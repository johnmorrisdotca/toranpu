import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { goFishMoves, goFishWinners, playGoFish, startGoFish } from "./go-fish.ts";
import { goFishComputer } from "./go-fish-computer.ts";
import type { GoFishGame, GoFishMove } from "./go-fish.types.ts";

/** Go Fish, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isGoFishMove(value: unknown): value is GoFishMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return Number.isInteger(move.ask) && Number.isInteger(move.rank);
}

const codec = cardGameCodec<GoFishGame, GoFishMove>("goFish", startGoFish, playGoFish, isGoFishMove);
/** A game of Go Fish as text: its table, its seed and its moves, never a hand. */
export const encodeGoFish = codec.encode;
/** Text read back into the game of Go Fish it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeGoFish = codec.decode;

/** Go Fish as one `CardGameRules`: everything a table asks of the game. */
export const GO_FISH_RULES: CardGameRules<GoFishGame, GoFishMove> = {
  start: startGoFish,
  moves: goFishMoves,
  play: playGoFish,
  over: (game) => game.phase === "over",
  winners: goFishWinners,
  encode: encodeGoFish,
  decode: decodeGoFish,
  toPlay: (game) => game.toPlay,
  computer: goFishComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
