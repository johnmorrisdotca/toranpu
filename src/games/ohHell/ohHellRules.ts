import { cardGameCodec } from "../cardGameCodec.ts";
import type { CardGameRules } from "../cardGames.types.ts";

import { ohHellMoves, ohHellWinners, playOhHell, startOhHell } from "./ohHell.ts";
import { ohHellComputer } from "./ohHellComputer.ts";
import type { OhHellGame, OhHellMove } from "./ohHell.types.ts";

/** Oh Hell, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isOhHellMove(value: unknown): value is OhHellMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return typeof move.play === "string" || (typeof move.bid === "number" && Number.isInteger(move.bid));
}

const codec = cardGameCodec<OhHellGame, OhHellMove>("ohHell", startOhHell, playOhHell, isOhHellMove);
/** A game of Oh Hell as text: its table, its seed and its moves, never a hand. */
export const encodeOhHell = codec.encode;
/** Text read back into the game of Oh Hell it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeOhHell = codec.decode;

/** Oh Hell as one `CardGameRules`: everything a table asks of the game. */
export const OH_HELL_RULES: CardGameRules<OhHellGame, OhHellMove> = {
  start: startOhHell,
  moves: ohHellMoves,
  play: playOhHell,
  over: (game) => game.phase === "over",
  winners: ohHellWinners,
  encode: encodeOhHell,
  decode: decodeOhHell,
  toPlay: (game) => game.toPlay,
  computer: ohHellComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
