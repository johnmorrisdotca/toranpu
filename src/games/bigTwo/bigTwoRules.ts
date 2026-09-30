import { cardGameCodec } from "../cardGameCodec.ts";
import type { CardGameRules } from "../cardGames.types.ts";
import { isClimbMove } from "../climbing/climbing.ts";
import type { ClimbMove } from "../climbing/climbing.types.ts";

import { bigTwoMoves, bigTwoWinners, playBigTwo, startBigTwo } from "./bigTwo.ts";
import { bigTwoComputer } from "./bigTwoComputer.ts";
import type { BigTwoGame } from "./bigTwo.types.ts";

/** Big Two, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

const codec = cardGameCodec<BigTwoGame, ClimbMove>("bigTwo", startBigTwo, playBigTwo, isClimbMove);
/** A game of Big Two as text: its table, its seed and its moves, never a hand. */
export const encodeBigTwo = codec.encode;
/** Text read back into the game of Big Two it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeBigTwo = codec.decode;

/** Big Two as one `CardGameRules`: everything a table asks of the game. */
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
