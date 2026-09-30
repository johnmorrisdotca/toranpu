import { cardGameCodec } from "../cardGameCodec.ts";
import type { CardGameRules } from "../cardGames.types.ts";

import { ginMoves, ginWinners, playGin, startGin } from "./ginRummy.ts";
import { ginComputer, ginSensible } from "./ginComputer.ts";
import type { GinGame, GinMove } from "./ginRummy.types.ts";

/** Gin Rummy, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isGinMove(value: unknown): value is GinMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return move.draw === "stock" || move.draw === "discard" || typeof move.discard === "string" || typeof move.knock === "string";
}

const codec = cardGameCodec<GinGame, GinMove>("ginRummy", startGin, playGin, isGinMove);
/** A game of Gin Rummy as text: its table, its seed and its moves, never a hand. */
export const encodeGin = codec.encode;
/** Text read back into the game of Gin Rummy it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeGin = codec.decode;

/** Gin Rummy as one `CardGameRules`: everything a table asks of the game. */
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
