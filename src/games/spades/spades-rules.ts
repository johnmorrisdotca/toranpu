import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { playSpades, spadesMoves, spadesWinners, startSpades } from "./spades.ts";
import { spadesComputer } from "./spades-computer.ts";
import type { SpadesGame, SpadesMove } from "./spades.types.ts";

/** Spades, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isSpadesMove(value: unknown): value is SpadesMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return typeof move.play === "string" || typeof move.bid === "number";
}

const codec = cardGameCodec<SpadesGame, SpadesMove>("spades", startSpades, playSpades, isSpadesMove);
/** A game of Spades as text: its table, its seed and its moves, never a hand. */
export const encodeSpades = codec.encode;
/** Text read back into the game of Spades it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeSpades = codec.decode;

/** Spades as one `CardGameRules`: everything a table asks of the game. */
export const SPADES_RULES: CardGameRules<SpadesGame, SpadesMove> = {
  start: startSpades,
  moves: spadesMoves,
  play: playSpades,
  over: (game) => game.phase === "over",
  winners: spadesWinners,
  encode: encodeSpades,
  decode: decodeSpades,
  toPlay: (game) => game.toPlay,
  computer: spadesComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
