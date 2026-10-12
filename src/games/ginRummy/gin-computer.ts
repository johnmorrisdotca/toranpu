import type { CardId } from "../card-games.types.ts";
import { rankOf, suitOf, without } from "../cards.ts";

import { bestLayout, canKnockWith, deadwoodIn, deadwoodValue, ginMoves } from "./gin-rummy.ts";
import type { GinGame, GinMove } from "./gin-rummy.types.ts";

/**
 * A COMPUTER AT THE GIN RUMMY TABLE: it takes the discard only when the card
 * goes straight into a meld, throws the card that leaves the least deadwood
 * (the highest of those that tie, and never one the other player has shown
 * they are collecting when another will do), and knocks the moment it can.
 *
 * It reads a view of the game (`ginView`): its own hand, the discard pile and
 * what the other player took from it — and nothing of their hand or the stock.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { GinView } from "@johnmorrisdotca/toranpu/gin-rummy";
 * import { ginView } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ginRummy", { players: names, seed: 42 })!;
 * const value: GinView = ginView(game);
 * console.log(value.hand.length);
 * ```
 */
export type GinView = {
  hand: readonly CardId[];
  phase: GinGame["phase"];
  /** The card on top of the discard pile, if any. */
  top: CardId | null;
  /** The card just taken from the pile, which may not go straight back. */
  taken: CardId | null;
  /** Every card the other player has taken from the discard pile this hand and still holds: the table watched them take it. */
  theirPicks: readonly CardId[];
};

/** The part of the game the seat to play can see, which is all its computer is given.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The part of the game the seat to play can see, which is all its computer is given.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { ginView } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ginRummy", { players: names, seed: 42 })!;
 * console.log(ginView(game));
 * ```
 */
export function ginView(game: GinGame): GinView {
  const seat = game.toPlay ?? 0;
  return { hand: game.hands[seat], phase: game.phase, top: game.discard.at(-1) ?? null, taken: game.taken, theirPicks: game.picked[1 - seat] ?? [] };
}

/** The move a computer in the seat to play makes: always one the rules allow.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The move a computer in the seat to play makes: always one the rules allow.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { ginComputer } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ginRummy", { players: names, seed: 42 })!;
 * console.log(ginComputer(game));
 * ```
 */
export function ginComputer(game: GinGame): GinMove {
  const view = ginView(game);
  if (view.phase === "draw") return view.top !== null && wanted(view.hand, view.top) ? { draw: "discard" } : { draw: "stock" };
  const card = chooseThrow(view);
  const move: GinMove = canKnockWith(view.hand, card) ? { knock: card } : { discard: card };
  const offered = ginMoves(game);
  return offered.some((one) => JSON.stringify(one) === JSON.stringify(move)) ? move : offered[0];
}

/** Whether the discard would go straight into a meld: the hand with it and its best throw has less deadwood than now.
 *
 * @param hand - The player’s held cards, or the hand number for a deal.
 * @param card - The physical card or card id to read, draw or play.
 * @returns Whether the discard would go straight into a meld: the hand with it and its best throw has less deadwood than now.
 *
 * @example
 * ```ts
 * import { wanted } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * console.log(wanted(["3H", "4H"], "5H"));
 * ```
 */
export function wanted(hand: readonly CardId[], card: CardId): boolean {
  const withIt = [...hand, card];
  if (!bestLayout(withIt).melds.some((meld) => meld.includes(card))) return false;
  const after = Math.min(...hand.map((thrown) => deadwoodIn(without(withIt, [thrown])!)));
  return after < deadwoodIn(hand);
}

/** The card to throw: the one leaving the least deadwood; of those, not a card the other player could use, and the highest.
 *
 * @param view - The player-visible game information used by a computer.
 * @returns The card to throw: the one leaving the least deadwood; of those, not a card the other player could use, and the highest.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import { chooseThrow, ginView } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ginRummy", { players: names, seed: 42 })!;
 * const rules = rulesFor("ginRummy");
 * for (let setup = 0; setup < 100 && game.phase !== "discard" && game.phase !== "over"; setup += 1) {
 *   const next = rules.play(game, rules.computer(game));
 *   if (next === null) throw new Error("Unexpected illegal setup move");
 *   game = next;
 * }
 * if (game.phase !== "discard") throw new Error("Setup did not reach discard");
 * console.log(chooseThrow(ginView(game)));
 * ```
 */
export function chooseThrow(view: GinView): CardId {
  const throwable = view.hand.filter((card) => card !== view.taken);
  const helps = (card: CardId) =>
    view.theirPicks.some((pick) => (rankOf(pick) === rankOf(card)) || (suitOf(pick) === suitOf(card) && Math.abs(rankOf(pick) - rankOf(card)) <= 2)) ? 1 : 0;
  const cost = (card: CardId) => deadwoodIn(without(view.hand, [card])!);
  return throwable.reduce((best, card) => {
    const a = cost(card);
    const b = cost(best);
    if (a !== b) return a < b ? card : best;
    if (helps(card) !== helps(best)) return helps(card) < helps(best) ? card : best;
    return deadwoodValue(card) > deadwoodValue(best) ? card : best;
  });
}

/**
 * A player a test can play at random who still ends a hand: a random
 * draw and a random throw, but a knock whenever the card thrown allows one.
 * A player choosing every move uniformly would almost never knock, and hand
 * after hand would run the stock down to a draw with nobody scoring.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @param random - A source of numbers in [0, 1), such as seededRandom(seed).
 * @returns A player a test can play at random who still ends a hand: a random draw and a random throw, but a knock whenever the card thrown allows one. A player choosing every move uniformly would almost never knock, and hand after hand would run the stock down to a draw with nobody scoring.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { ginSensible } from "@johnmorrisdotca/toranpu/gin-rummy";
 * import { seededRandom } from "@johnmorrisdotca/toranpu/deck";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ginRummy", { players: names, seed: 42 })!;
 * console.log(ginSensible(game, seededRandom(42)));
 * ```
 */
export function ginSensible(game: GinGame, random: () => number): GinMove {
  const offered = ginMoves(game);
  const knocks = offered.filter((move) => "knock" in move);
  if (knocks.length > 0) return knocks[Math.floor(random() * knocks.length)];
  return offered[Math.floor(random() * offered.length)];
}
