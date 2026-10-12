import type { CardId } from "../card-games.types.ts";
import { suitOf } from "../cards.ts";

import { ohHellBids, ohHellHeight, ohHellPlayable, ohHellTrickWinner } from "./oh-hell.ts";
import type { OhHellGame, OhHellMove, OhHellPlay } from "./oh-hell.types.ts";

/**
 * A COMPUTER AT THE OH HELL TABLE. Bidding, it counts the tricks its hand
 * should take — high trumps, long trumps, aces outside and, in a hand of a
 * few cards, kings — and bids the nearest it may. Playing, it tries to take
 * a trick while it has taken fewer than it bid, as cheaply as it can, and to
 * lose every trick once it has made its bid, throwing its most dangerous
 * cards while it can do so safely.
 *
 * It reads a view of the game (`ohHellView`): its own hand, the turned card,
 * the bids and the cards played — nothing of another hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { OhHellView } from "@johnmorrisdotca/toranpu/oh-hell";
 * import { ohHellView } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ohHell", { players: names, seed: 42 })!;
 * const value: OhHellView = ohHellView(game);
 * console.log(value.hand.length);
 * ```
 */
export type OhHellView = {
  seat: number;
  hand: readonly CardId[];
  trump: string;
  bid: number | null;
  took: number;
  trick: readonly OhHellPlay[];
  seats: number;
  playable: readonly CardId[];
};

/** The part of the game the seat to play can see, which is all its computer is given.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The part of the game the seat to play can see, which is all its computer is given.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { ohHellView } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ohHell", { players: names, seed: 42 })!;
 * console.log(ohHellView(game));
 * ```
 */
export function ohHellView(game: OhHellGame): OhHellView {
  const seat = game.toPlay ?? 0;
  return { seat, hand: game.hands[seat], trump: game.trump, bid: game.bids[seat], took: game.tricks[seat], trick: game.trick, seats: game.players.length, playable: ohHellPlayable(game) };
}

/** The tricks a hand should take with these trumps, roughly.
 *
 * @param hand - The player’s held cards, or the hand number for a deal.
 * @param trump - The current trump suit.
 * @param seats - The seat count or seat state supplied by this API.
 * @returns The tricks a hand should take with these trumps, roughly.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { ohHellWorth } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ohHell", { players: names, seed: 42 })!;
 * console.log(ohHellWorth(game.hands[0]!, game.trump, game.players.length));
 * ```
 */
export function ohHellWorth(hand: readonly CardId[], trump: string, seats: number): number {
  const trumps = hand.filter((card) => suitOf(card) === trump).map(ohHellHeight);
  let worth = 0;
  for (const height of trumps) worth += height === 14 ? 1 : height === 13 ? 0.85 : height === 12 ? 0.6 : height >= 10 ? 0.4 : 0.25;
  // A trump past a third of the hand is a trick at the end.
  worth += Math.max(0, trumps.length - Math.ceil(hand.length / 3)) * 0.4;
  for (const card of hand) {
    if (suitOf(card) === trump) continue;
    const length = hand.filter((held) => suitOf(held) === suitOf(card)).length;
    const height = ohHellHeight(card);
    if (height === 14) worth += length <= 3 ? 0.8 : 0.5;
    else if (height === 13 && hand.length <= 5 && length <= 2) worth += seats === 3 ? 0.45 : 0.3;
  }
  return worth;
}

/** The bid nearest what the hand is worth, among those allowed.
 *
 * @param worth - The estimated number of tricks this hand can win.
 * @param allowed - The legal bids available to this player.
 * @returns The bid nearest what the hand is worth, among those allowed.
 *
 * @example
 * ```ts
 * import { chooseOhHellBid } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * console.log(chooseOhHellBid(1.4, [0, 1, 2, 3]));
 * ```
 */
export function chooseOhHellBid(worth: number, allowed: readonly number[]): number {
  return allowed.reduce((best, bid) => (Math.abs(bid - worth) < Math.abs(best - worth) ? bid : best));
}

/** The move a computer in the seat to play makes: always one the rules allow.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The move a computer in the seat to play makes: always one the rules allow.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { ohHellComputer } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ohHell", { players: names, seed: 42 })!;
 * console.log(ohHellComputer(game));
 * ```
 */
export function ohHellComputer(game: OhHellGame): OhHellMove {
  const view = ohHellView(game);
  if (game.phase === "bidding") return { bid: chooseOhHellBid(ohHellWorth(view.hand, view.trump, view.seats), ohHellBids(game)) };
  return { play: chooseCard(view) };
}

function chooseCard(view: OhHellView): CardId {
  const { playable, trick, seat, trump } = view;
  if (playable.length === 1) return playable[0];
  const power = (card: CardId) => (suitOf(card) === trump ? 100 : 0) + ohHellHeight(card);
  const highest = (cards: readonly CardId[]) => cards.reduce((a, b) => (power(b) > power(a) ? b : a));
  const lowest = (cards: readonly CardId[]) => cards.reduce((a, b) => (power(b) < power(a) ? b : a));
  const want = (view.bid ?? 0) > view.took;
  if (trick.length === 0) return want ? highest(playable) : lowest(playable);
  const wins = (card: CardId) => ohHellTrickWinner([...trick, { seat, card }], trump) === seat;
  const winners = playable.filter(wins);
  const losers = playable.filter((card) => !wins(card));
  const last = trick.length === view.seats - 1;
  if (want) {
    if (winners.length === 0) return lowest(playable);
    return last ? lowest(winners) : highest(winners);
  }
  // Made, or past it: lose the trick with the highest card that still loses, else win it as cheaply as possible.
  return losers.length > 0 ? highest(losers) : lowest(playable);
}
