import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { crazyEightsMoves, crazyEightsWinners, playCrazyEights, startCrazyEights } from "./crazy-eights.ts";
import { crazyEightsComputer } from "./crazy-eights-computer.ts";
import type { CrazyEightsGame, CrazyEightsMove } from "./crazy-eights.types.ts";

/** Crazy Eights, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isCrazyEightsMove(value: unknown): value is CrazyEightsMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  if (typeof move.play === "string") return move.suit === undefined || typeof move.suit === "string";
  return move.draw === true || move.pass === true;
}

const codec = cardGameCodec<CrazyEightsGame, CrazyEightsMove>("crazyEights", startCrazyEights, playCrazyEights, isCrazyEightsMove);
/** A game of Crazy Eights as text: its table, its seed and its moves, never a hand. */
export const encodeCrazyEights = codec.encode;
/** Text read back into the game of Crazy Eights it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeCrazyEights = codec.decode;

/** Crazy Eights as one `CardGameRules`: everything a table asks of the game. */
export const CRAZY_EIGHTS_RULES: CardGameRules<CrazyEightsGame, CrazyEightsMove> = {
  start: startCrazyEights,
  moves: crazyEightsMoves,
  play: playCrazyEights,
  over: (game) => game.phase === "over",
  winners: crazyEightsWinners,
  encode: encodeCrazyEights,
  decode: decodeCrazyEights,
  toPlay: (game) => game.toPlay,
  computer: crazyEightsComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
