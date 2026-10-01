import { cardGameCodec } from "../cardGameCodec.ts";
import type { CardGameRules } from "../cardGames.types.ts";

import { isWarMove, playWar, startWar, warMoves, warWinners } from "./war.ts";
import { warComputer } from "./warComputer.ts";
import type { WarGame, WarMove } from "./war.types.ts";

/** War, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

const codec = cardGameCodec<WarGame, WarMove>("war", startWar, playWar, isWarMove);
/** A game of War as text: its table, its seed and its moves, never a pile. */
export const encodeWar = codec.encode;
/** Text read back into the game of War it records, by playing every move again through the rules; null for anything they cannot play out. */
export const decodeWar = codec.decode;

/** War as one `CardGameRules`: everything a table asks of the game. */
export const WAR_RULES: CardGameRules<WarGame, WarMove> = {
  start: startWar,
  moves: warMoves,
  play: playWar,
  over: (game) => game.phase === "over",
  winners: warWinners,
  encode: encodeWar,
  decode: decodeWar,
  toPlay: (game) => game.toPlay,
  computer: warComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
