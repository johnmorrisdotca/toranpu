import type { CardId, CardRank } from "../card-games.types.ts";
import { rankOf } from "../cards.ts";

import { goFishRanks, goFishTargets } from "./go-fish.ts";
import type { GoFishEvent, GoFishGame, GoFishMove } from "./go-fish.types.ts";

/**
 * A COMPUTER AT THE GO FISH TABLE, which remembers what was asked.
 *
 * Everything said at the table is in the game's log, and the computer reads
 * it the way a player with a good memory would: a player who asked for sevens
 * holds a seven; a player who handed over their sevens, or said "Go fish" to
 * a request for sevens, holds none — until they draw from the pond, when
 * anything may have come in; and a rank booked is gone for good. It asks
 * whoever it knows holds a rank it has, the rank it holds most of first, and
 * otherwise the rank it holds most of from the player with the most cards who
 * is not known to be without it. It never looks at a hand it is not holding.
 */

/** What one seat can see of a game of Go Fish: its own hand, the table, and what has been said and shown.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { GoFishView } from "@johnmorrisdotca/toranpu/go-fish";
 * import { goFishView } from "@johnmorrisdotca/toranpu/go-fish";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.goFish.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("goFish", { players: names, seed: 42 })!;
 * const value: GoFishView = goFishView(game);
 * console.log(value.hand.length);
 * ```
 */
export type GoFishView = {
  seat: number;
  hand: readonly CardId[];
  targets: readonly number[];
  ranks: readonly CardRank[];
  counts: readonly number[];
  log: readonly GoFishEvent[];
};

/** The part of the game the seat to play can see, which is all its computer is given.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The part of the game the seat to play can see, which is all its computer is given.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { goFishView } from "@johnmorrisdotca/toranpu/go-fish";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.goFish.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("goFish", { players: names, seed: 42 })!;
 * console.log(goFishView(game));
 * ```
 */
export function goFishView(game: GoFishGame): GoFishView {
  const seat = game.toPlay ?? 0;
  return { seat, hand: game.hands[seat], targets: goFishTargets(game), ranks: goFishRanks(game), counts: game.hands.map((hand) => hand.length), log: game.log };
}

/** What the table has said about each seat's hand: for each seat, the ranks it is known to hold and known to be without.
 *
 * @example
 * ```ts
 * import type { GoFishMemory } from "@johnmorrisdotca/toranpu/go-fish";
 * import { goFishMemory } from "@johnmorrisdotca/toranpu/go-fish";
 *
 * const value: GoFishMemory = goFishMemory([], 4);
 * console.log(value.holds.length);
 * ```
 */
export type GoFishMemory = { holds: Set<CardRank>[]; lacks: Set<CardRank>[] };

/** What the table's log says about every seat's hand, worked out from the asks, the answers and the books.
 *
 * @param log - The recorded moves to replay or format.
 * @param seats - The seat count or seat state supplied by this API.
 * @returns What the table's log says about every seat's hand, worked out from the asks, the answers and the books.
 *
 * @example
 * ```ts
 * import { goFishMemory } from "@johnmorrisdotca/toranpu/go-fish";
 *
 * console.log(goFishMemory([], 4));
 * ```
 */
export function goFishMemory(log: readonly GoFishEvent[], seats: number): GoFishMemory {
  const holds = Array.from({ length: seats }, () => new Set<CardRank>());
  const lacks = Array.from({ length: seats }, () => new Set<CardRank>());
  const has = (seat: number, rank: CardRank) => {
    holds[seat].add(rank);
    lacks[seat].delete(rank);
  };
  const hasNone = (seat: number, rank: CardRank) => {
    holds[seat].delete(rank);
    lacks[seat].add(rank);
  };
  for (const event of log) {
    if (event.kind === "book") {
      for (let seat = 0; seat < seats; seat += 1) hasNone(seat, event.rank);
    } else if (event.kind === "draw") {
      // A card drawn face down could be anything: what this seat was known to lack may be wrong now.
      lacks[event.seat].clear();
    } else {
      hasNone(event.asked, event.rank);
      has(event.seat, event.rank);
      if (event.fished === "missed") lacks[event.seat].clear();
    }
  }
  return { holds, lacks };
}

/** The move a computer in the seat to play makes: always one the rules allow.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The move a computer in the seat to play makes: always one the rules allow.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { goFishComputer } from "@johnmorrisdotca/toranpu/go-fish";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.goFish.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("goFish", { players: names, seed: 42 })!;
 * console.log(goFishComputer(game));
 * ```
 */
export function goFishComputer(game: GoFishGame): GoFishMove {
  const view = goFishView(game);
  const memory = goFishMemory(view.log, view.counts.length);
  const mine = (rank: CardRank) => view.hand.filter((card) => rankOf(card) === rank).length;
  // Most held first; among equals the lower rank, so the choice is always the same for the same hand.
  const ranks = [...view.ranks].sort((a, b) => mine(b) - mine(a) || a - b);
  for (const rank of ranks) {
    const holder = view.targets.find((seat) => memory.holds[seat].has(rank));
    if (holder !== undefined) return { ask: holder, rank };
  }
  const byCards = [...view.targets].sort((a, b) => view.counts[b] - view.counts[a] || a - b);
  for (const rank of ranks) {
    const target = byCards.find((seat) => !memory.lacks[seat].has(rank));
    if (target !== undefined) return { ask: target, rank };
  }
  return { ask: byCards[0], rank: ranks[0] };
}
