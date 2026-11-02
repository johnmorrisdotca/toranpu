import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { isStackUpMove, playStackUp, stackUpMoves, stackUpWinners, startStackUp } from "./stack-up.ts";
import type { StackUpGame, StackUpMove } from "./stack-up.types.ts";
import { stackUpComputer } from "./stack-up-computer.ts";

/** Stack Up, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

const codec = cardGameCodec<StackUpGame, StackUpMove>("stackUp", startStackUp, playStackUp, isStackUpMove);

/** A game of Stack Up as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Stack Up as text.
 *
 * @example
 * ```ts
 * import { encodeStackUp, startStackUp } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(encodeStackUp(startStackUp(15, ["Aki", "Ben"], undefined, 42)!).length > 0);
 * ```
 */
export const encodeStackUp = codec.encode;

/** Text read back into the game of Stack Up it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns The game, or null.
 *
 * @example
 * ```ts
 * import { decodeStackUp, encodeStackUp, startStackUp } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(decodeStackUp(encodeStackUp(startStackUp(15, ["Aki", "Ben"], undefined, 42)!))?.phase);
 * ```
 */
export const decodeStackUp = codec.decode;

/** Stack Up as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { STACK_UP_RULES } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(Object.keys(STACK_UP_RULES));
 * ```
 */
export const STACK_UP_RULES: CardGameRules<StackUpGame, StackUpMove> = {
  start: startStackUp,
  moves: stackUpMoves,
  play: playStackUp,
  over: (game) => game.phase === "over",
  winners: stackUpWinners,
  encode: encodeStackUp,
  decode: decodeStackUp,
  toPlay: (game) => game.toPlay,
  computer: stackUpComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
