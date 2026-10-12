import type { CardId, CardSuit } from "../card-games.types.ts";
import { rankOf, suitOf } from "../cards.ts";

import { EIGHT, crazyEightsMoves, crazyPoints } from "./crazy-eights.ts";
import type { CrazyEightsGame, CrazyEightsMove } from "./crazy-eights.types.ts";

/**
 * A COMPUTER AT THE CRAZY EIGHTS TABLE, which saves its eights.
 *
 * It plays an ordinary card whenever it has one, choosing the card that keeps
 * the play in the suit it holds most of and sheds the most points; it plays
 * an eight only when nothing else will go (or when it is nearly out), and
 * then calls the suit it is longest in. A drawn eight is kept for later
 * rather than played at once. It reads its own hand, the pile, the suit to
 * follow and how many cards each player holds, and nothing else.
 */

/** What one seat can see of a game of Crazy Eights: its own hand, the table, and what has been said and shown.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { CrazyEightsView } from "@johnmorrisdotca/toranpu/crazy-eights";
 * import { crazyEightsView } from "@johnmorrisdotca/toranpu/crazy-eights";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.crazyEights.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("crazyEights", { players: names, seed: 42 })!;
 * const value: CrazyEightsView = crazyEightsView(game);
 * console.log(value.hand.length);
 * ```
 */
export type CrazyEightsView = {
  seat: number;
  hand: readonly CardId[];
  counts: readonly number[];
  drawn: CardId | null;
  legal: readonly CrazyEightsMove[];
};

/** The part of the game the seat to play can see, which is all its computer is given.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The part of the game the seat to play can see, which is all its computer is given.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { crazyEightsView } from "@johnmorrisdotca/toranpu/crazy-eights";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.crazyEights.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("crazyEights", { players: names, seed: 42 })!;
 * console.log(crazyEightsView(game));
 * ```
 */
export function crazyEightsView(game: CrazyEightsGame): CrazyEightsView {
  const seat = game.toPlay ?? 0;
  return { seat, hand: game.hands[seat], counts: game.hands.map((hand) => hand.length), drawn: game.drawn, legal: crazyEightsMoves(game) };
}

/** The suit this hand holds most of, eights aside; clubs first among equals so the choice is always the same.
 *
 * @param hand - The player’s held cards, or the hand number for a deal.
 * @returns The suit this hand holds most of, eights aside; clubs first among equals so the choice is always the same.
 *
 * @example
 * ```ts
 * import { longestSuit } from "@johnmorrisdotca/toranpu/crazy-eights";
 *
 * console.log(longestSuit(["AS", "2S", "KH"]));
 * ```
 */
export function longestSuit(hand: readonly CardId[]): CardSuit {
  const suits: CardSuit[] = ["C", "D", "H", "S"];
  const count = (suit: CardSuit) => hand.filter((card) => suitOf(card) === suit && rankOf(card) !== EIGHT).length;
  return suits.reduce((best, suit) => (count(suit) > count(best) ? suit : best));
}

/** The move a computer in the seat to play makes: always one the rules allow.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The move a computer in the seat to play makes: always one the rules allow.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { crazyEightsComputer } from "@johnmorrisdotca/toranpu/crazy-eights";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.crazyEights.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("crazyEights", { players: names, seed: 42 })!;
 * console.log(crazyEightsComputer(game));
 * ```
 */
export function crazyEightsComputer(game: CrazyEightsGame): CrazyEightsMove {
  const view = crazyEightsView(game);
  const plays = view.legal.flatMap((move) => ("play" in move ? [move] : []));
  const fallback = view.legal[0];
  if (plays.length === 0) return fallback;
  const nearlyOut = view.hand.length <= 2;
  const ordinary = plays.filter((move) => rankOf(move.play) !== EIGHT);
  if (ordinary.length > 0) {
    const after = (card: CardId) => view.hand.filter((held) => held !== card);
    const worth = (card: CardId) => {
      const left = after(card);
      const sameSuit = left.filter((held) => suitOf(held) === suitOf(card) && rankOf(held) !== EIGHT).length;
      return sameSuit * 10 + crazyPoints(card);
    };
    return ordinary.reduce((best, move) => (worth(move.play) > worth(best.play) ? move : best));
  }
  // Only eights will go. One just drawn is kept for later, unless the hand is nearly gone.
  if (view.drawn !== null && !nearlyOut && view.legal.some((move) => "pass" in move)) return { pass: true };
  const eight = plays[0].play;
  const suit = longestSuit(view.hand.filter((card) => card !== eight));
  return plays.find((move) => move.suit === suit) ?? plays[0];
}
