import { cardGameCodec } from "../cardGameCodec.ts";
import type { CardGameRules } from "../cardGames.types.ts";

import { euchreMoves, euchreWinners, playEuchre, startEuchre } from "./euchre.ts";
import { euchreComputer } from "./euchreComputer.ts";
import type { EuchreGame, EuchreMove } from "./euchre.types.ts";

/** Euchre, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isEuchreMove(value: unknown): value is EuchreMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return move.order === true || move.pass === true || typeof move.call === "string" || typeof move.discard === "string" || typeof move.play === "string";
}

const codec = cardGameCodec<EuchreGame, EuchreMove>("euchre", startEuchre, playEuchre, isEuchreMove);
/** A game of Euchre as text: its table, its seed and its moves, never a hand. */
export const encodeEuchre = codec.encode;
/** Text read back into the game of Euchre it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeEuchre = codec.decode;

/** Euchre as one `CardGameRules`: everything a table asks of the game. */
export const EUCHRE_RULES: CardGameRules<EuchreGame, EuchreMove> = {
  start: startEuchre,
  moves: euchreMoves,
  play: playEuchre,
  over: (game) => game.phase === "over",
  winners: euchreWinners,
  encode: encodeEuchre,
  decode: decodeEuchre,
  toPlay: (game) => game.toPlay,
  computer: euchreComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
