import { cardGameCodec, isCardList } from "../cardGameCodec.ts";
import type { CardGameRules } from "../cardGames.types.ts";
import { isClimbMove } from "../climbing/climbing.ts";

import { playPresident, presidentMoves, presidentWinners, startPresident } from "./president.ts";
import { presidentComputer } from "./presidentComputer.ts";
import type { PresidentGame, PresidentMove } from "./president.types.ts";

/** President, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isPresidentMove(value: unknown): value is PresidentMove {
  return isClimbMove(value) || (typeof value === "object" && value !== null && isCardList((value as Record<string, unknown>).give));
}

const codec = cardGameCodec<PresidentGame, PresidentMove>("president", startPresident, playPresident, isPresidentMove);
/** A game of President as text: its table, its seed and its moves, never a hand. */
export const encodePresident = codec.encode;
/** Text read back into the game of President it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodePresident = codec.decode;

/** President as one `CardGameRules`: everything a table asks of the game. */
export const PRESIDENT_RULES: CardGameRules<PresidentGame, PresidentMove> = {
  start: startPresident,
  moves: presidentMoves,
  play: playPresident,
  over: (game) => game.phase === "over",
  winners: presidentWinners,
  encode: encodePresident,
  decode: decodePresident,
  toPlay: (game) => game.toPlay,
  computer: presidentComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
