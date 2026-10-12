import type { CardId } from "../card-games.types.ts";
import { FULL_DECK, rankOf } from "../cards.ts";

import { cardValue, cribPairs, cribbageMoves, cribbagePlayable, dealerOf, pegPoints, showCount } from "./cribbage.ts";
import type { CribbageGame, CribbageMove } from "./cribbage.types.ts";

/**
 * A COMPUTER AT THE CRIBBAGE TABLE. Laying away, it tries every two cards it
 * could throw and keeps the four whose show is worth most on average over
 * every starter it might be cut, adding what the two thrown are worth to its
 * own crib or taking it off the other player's. Pegging, it takes the most
 * points a card can make now, and otherwise keeps the count off five and
 * twenty-one (a ten makes fifteen or thirty-one of them), leads low, and
 * never leads a five.
 *
 * It reads a view of the game (`cribbageView`): its own hand and what is on
 * the table — nothing of the other hand, the crib, or the card to be cut.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { CribbageView } from "@johnmorrisdotca/toranpu/cribbage";
 * import { cribbageView } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("cribbage", { players: names, seed: 42 })!;
 * const value: CribbageView = cribbageView(game);
 * console.log(value.hand.length);
 * ```
 */
export type CribbageView = {
  seat: number;
  dealer: number;
  phase: CribbageGame["phase"];
  hand: readonly CardId[];
  count: number;
  run: readonly CardId[];
};

/** The part of the game the seat to play can see, which is all its computer is given.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The part of the game the seat to play can see, which is all its computer is given.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { cribbageView } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("cribbage", { players: names, seed: 42 })!;
 * console.log(cribbageView(game));
 * ```
 */
export function cribbageView(game: CribbageGame): CribbageView {
  const seat = game.toPlay ?? 0;
  return { seat, dealer: dealerOf(game.deal), phase: game.phase, hand: game.hands[seat], count: game.count, run: game.run.map((play) => play.card) };
}

/** What two cards thrown to a crib are worth to it, roughly: a pair, a fifteen, fives, and cards close enough to run.
 *
 * @param options - Options for this call; omitted fields retain their documented defaults.
 * @returns What two cards thrown to a crib are worth to it, roughly: a pair, a fifteen, fives, and cards close enough to run.
 *
 * @example
 * ```ts
 * import { throwWorth } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * console.log(throwWorth(["5H", "JS"]));
 * ```
 */
export function throwWorth([a, b]: readonly [CardId, CardId]): number {
  let worth = 0;
  if (rankOf(a) === rankOf(b)) worth += 2;
  if (cardValue(a) + cardValue(b) === 15) worth += 2;
  worth += [a, b].filter((card) => rankOf(card) === 5).length * 1.5;
  if (Math.abs(rankOf(a) - rankOf(b)) === 1) worth += 0.5;
  return worth;
}

/** The two cards to lay away: the four kept worth most on average with every starter, the crib counted for or against.
 *
 * @param hand - The player’s held cards, or the hand number for a deal.
 * @param ownCrib - Whether the crib belongs to this player.
 * @returns The two cards to lay away: the four kept worth most on average with every starter, the crib counted for or against.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { chooseCrib } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("cribbage", { players: names, seed: 42 })!;
 * console.log(chooseCrib(game.hands[0]!, true));
 * ```
 */
export function chooseCrib(hand: readonly CardId[], ownCrib: boolean): [CardId, CardId] {
  const starters = FULL_DECK.filter((card) => !hand.includes(card));
  let best = cribPairs(hand)[0];
  let bestWorth = -Infinity;
  for (const pair of cribPairs(hand)) {
    const kept = hand.filter((card) => !pair.includes(card));
    let total = 0;
    for (const starter of starters) total += showCount(kept, starter).total;
    const worth = total / starters.length + (ownCrib ? 1 : -1) * throwWorth(pair);
    if (worth > bestWorth) {
      bestWorth = worth;
      best = pair;
    }
  }
  return best;
}

/** The card to peg: most points now, then a count kept off five and twenty-one, a low lead that is not a five.
 *
 * @param view - The player-visible game information used by a computer.
 * @returns The card to peg: most points now, then a count kept off five and twenty-one, a low lead that is not a five.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import { choosePeg, cribbageView } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("cribbage", { players: names, seed: 42 })!;
 * const rules = rulesFor("cribbage");
 * for (let setup = 0; setup < 100 && game.phase !== "pegging" && game.phase !== "over"; setup += 1) {
 *   const next = rules.play(game, rules.computer(game));
 *   if (next === null) throw new Error("Unexpected illegal setup move");
 *   game = next;
 * }
 * if (game.phase !== "pegging") throw new Error("Setup did not reach pegging");
 * console.log(choosePeg(cribbageView(game)));
 * ```
 */
export function choosePeg(view: CribbageView): CardId {
  const playable = cribbagePlayable(view.hand, view.count);
  const worth = (card: CardId) => {
    const count = view.count + cardValue(card);
    let value = pegPoints([...view.run, card], count).points * 10;
    if (count === 5 || count === 21) value -= 3;
    if (view.count === 0) value += rankOf(card) === 5 ? -4 : cardValue(card) < 5 ? 2 : 0;
    // Otherwise spend the higher cards, keeping the low ones for the end of a count.
    return value + cardValue(card) / 20;
  };
  return playable.reduce((best, card) => (worth(card) > worth(best) ? card : best));
}

/** The move a computer in the seat to play makes: always one the rules allow.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The move a computer in the seat to play makes: always one the rules allow.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { cribbageComputer } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("cribbage", { players: names, seed: 42 })!;
 * console.log(cribbageComputer(game));
 * ```
 */
export function cribbageComputer(game: CribbageGame): CribbageMove {
  const view = cribbageView(game);
  if (view.phase === "crib") return { crib: chooseCrib(view.hand, view.seat === view.dealer) };
  const moves = cribbageMoves(game);
  return moves.length === 0 ? { play: view.hand[0] } : { play: choosePeg(view) };
}
