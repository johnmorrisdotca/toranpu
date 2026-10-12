import type { CardId } from "../card-games.types.ts";

/**
 * A CLIMBING GAME'S TRICK: Big Two and President are both played this way.
 * Somebody leads a card or a set of cards; round the table each player beats
 * it with the same number of cards, higher, or passes; a pass holds until the
 * trick is over; and when everybody else has passed, the trick is cleared and
 * whoever played last leads again.
 */

/** What is on the table: the last cards played to this trick, and whose they were.
 *
 * @example
 * ```ts
 * import type { ClimbPlay } from "@johnmorrisdotca/toranpu/big-two";
 *
 * const value: ClimbPlay = { seat: 0, cards: ["3D"] };
 * console.log(value.cards);
 * ```
 */
export type ClimbPlay = { seat: number; cards: CardId[] };

/** Cards played to beat the table (or lead), or a pass.
 *
 * @example
 * ```ts
 * import type { ClimbMove } from "@johnmorrisdotca/toranpu/big-two";
 *
 * const value: ClimbMove = { play: ["3D"] };
 * console.log(value);
 * ```
 */
export type ClimbMove = { play: CardId[] } | { pass: true };

/** The part of a climbing game's state the trick machinery moves: every climbing game carries these.
 *
 * @example
 * ```ts
 * import type { ClimbTrick } from "@johnmorrisdotca/toranpu/big-two";
 * import { newGame } from "@johnmorrisdotca/toranpu";
 *
 * const value: ClimbTrick = newGame("bigTwo", { players: ["Aki", "Ben", "Cy", "Dev"], seed: 42 })!;
 * console.log(value.hands.map((hand) => hand.length));
 * ```
 */
export type ClimbTrick = {
  hands: CardId[][];
  /** The cards to beat, or null when the seat to play leads. */
  pile: ClimbPlay | null;
  /** Who has passed on this trick: they wait until it is cleared. */
  passed: boolean[];
  /** Whose move it is; null once the game is over. */
  toPlay: number | null;
  /** Every card played this deal, in order: what the whole table has seen. */
  played: CardId[];
};
