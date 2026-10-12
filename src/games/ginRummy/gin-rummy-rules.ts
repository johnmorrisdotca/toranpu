import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { ginMoves, ginWinners, playGin, startGin } from "./gin-rummy.ts";
import { ginComputer, ginSensible } from "./gin-computer.ts";
import type { GinGame, GinMove } from "./gin-rummy.types.ts";

/** Gin Rummy, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isGinMove(value: unknown): value is GinMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return move.draw === "stock" || move.draw === "discard" || typeof move.discard === "string" || typeof move.knock === "string";
}

const codec = cardGameCodec<GinGame, GinMove>("ginRummy", startGin, playGin, isGinMove);
/** A game of Gin Rummy as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Gin Rummy as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeGin } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ginRummy", { players: names, seed: 42 })!;
 * console.log(encodeGin(game));
 * ```
 */
export const encodeGin = codec.encode;
/** Text read back into the game of Gin Rummy it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of Gin Rummy it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeGin, encodeGin } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("ginRummy", { players: names, seed: 42 })!;
 * console.log(decodeGin(encodeGin(game))?.phase);
 * ```
 */
export const decodeGin = codec.decode;

/** Gin Rummy as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { GIN_RUMMY_RULES } from "@johnmorrisdotca/toranpu/gin-rummy";
 * console.log(Object.keys(GIN_RUMMY_RULES));
 * ```
 */
export const GIN_RUMMY_RULES: CardGameRules<GinGame, GinMove> = {
  start: startGin,
  moves: ginMoves,
  play: playGin,
  over: (game) => game.phase === "over",
  winners: ginWinners,
  encode: encodeGin,
  decode: decodeGin,
  toPlay: (game) => game.toPlay,
  computer: ginComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
  sensible: ginSensible,
};
