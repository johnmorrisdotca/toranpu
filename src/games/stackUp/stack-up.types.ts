import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId } from "../card-games.types.ts";

/** One move at Stack Up: a card laid on a building pile (from the hand, the top of the stock, or the top of one of your own discard piles), a card put on a discard pile, which ends the turn, or a pass when there is nothing in hand to discard.
 *
 * @example
 * ```ts
 * import type { StackUpMove } from "@johnmorrisdotca/toranpu/stack-up";
 *
 * const value: StackUpMove = { play: "n01", from: "hand", to: 0 };
 * console.log(value);
 * ```
 */
export type StackUpMove =
  | { play: CardId; from: "hand" | "stock"; to: number }
  | { play: CardId; from: "discard"; pile: number; to: number }
  | { discard: CardId; to: number }
  | { pass: true };

/** Why a game is over: someone played their last stock card, or nothing could be played for a whole round with no cards left to draw, and the fewest stock cards left wins.
 *
 * @example
 * ```ts
 * import type { StackUpEnd } from "@johnmorrisdotca/toranpu/stack-up";
 *
 * const value: StackUpEnd = "emptied";
 * console.log(value);
 * ```
 */
export type StackUpEnd = "emptied" | "stuck";

/** A game of Stack Up: every seat's stock, hand and four discard piles, the four building piles, the cards still to draw and the finished piles waiting to be shuffled back in.
 *
 * @example
 * ```ts
 * import type { StackUpGame } from "@johnmorrisdotca/toranpu/stack-up";
 * import { newGame } from "@johnmorrisdotca/toranpu";
 *
 * const value: StackUpGame = newGame("stackUp", { players: ["Aki", "Ben"], seed: 42 })!;
 * console.log(value.building.length);
 * ```
 */
export type StackUpGame = KeptCardGame<StackUpMove> & {
  phase: "playing" | "over";
  toPlay: number | null;
  /** Each seat's stock, face down but for the top card, which is the last. */
  stocks: CardId[][];
  hands: CardId[][];
  /** Each seat's four discard piles, the top card of each last. */
  discards: CardId[][][];
  /** The four building piles: a pile of n cards wants an n + 1 next, up to 12. */
  building: CardId[][];
  draw: CardId[];
  /** Finished piles of twelve, shuffled back into the draw pile when it runs out. */
  done: CardId[];
  reshuffles: number;
  /** Whether the seat to play has played a card this turn. */
  played: boolean;
  /** Turns in a row that ended with nothing played. */
  idle: number;
  ended: StackUpEnd | null;
};
