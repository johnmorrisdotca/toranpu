import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";
import { isClimbMove } from "../climbing/climbing.ts";
import type { ClimbMove } from "../climbing/climbing.types.ts";

import { bigTwoMoves, bigTwoWinners, playBigTwo, startBigTwo } from "./big-two.ts";
import { bigTwoComputer } from "./big-two-computer.ts";
import type { BigTwoGame } from "./big-two.types.ts";

/** Big Two, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

const codec = cardGameCodec<BigTwoGame, ClimbMove>("bigTwo", startBigTwo, playBigTwo, isClimbMove);
/** A game of Big Two as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Big Two as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeBigTwo } from "@johnmorrisdotca/toranpu/big-two";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.bigTwo.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("bigTwo", { players: names, seed: 42 })!;
 * console.log(encodeBigTwo(game));
 * ```
 */
export const encodeBigTwo = codec.encode;
/** Text read back into the game of Big Two it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of Big Two it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeBigTwo, encodeBigTwo } from "@johnmorrisdotca/toranpu/big-two";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.bigTwo.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("bigTwo", { players: names, seed: 42 })!;
 * console.log(decodeBigTwo(encodeBigTwo(game))?.phase);
 * ```
 */
export const decodeBigTwo = codec.decode;

/** Big Two as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { BIG_TWO_RULES } from "@johnmorrisdotca/toranpu/big-two";
 * console.log(Object.keys(BIG_TWO_RULES));
 * ```
 */
export const BIG_TWO_RULES: CardGameRules<BigTwoGame, ClimbMove> = {
  start: startBigTwo,
  moves: bigTwoMoves,
  play: playBigTwo,
  over: (game) => game.phase === "over",
  winners: bigTwoWinners,
  encode: encodeBigTwo,
  decode: decodeBigTwo,
  toPlay: (game) => game.toPlay,
  computer: bigTwoComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
