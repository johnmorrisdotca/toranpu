import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { isWarMove, playWar, startWar, warMoves, warWinners } from "./war.ts";
import { warComputer } from "./war-computer.ts";
import type { WarGame, WarMove } from "./war.types.ts";

/** War, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

const codec = cardGameCodec<WarGame, WarMove>("war", startWar, playWar, isWarMove);
/** A game of War as text: its table, its seed and its moves, never a pile.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of War as text: its table, its seed and its moves, never a pile.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeWar } from "@johnmorrisdotca/toranpu/war";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.war.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("war", { players: names, seed: 42 })!;
 * console.log(encodeWar(game));
 * ```
 */
export const encodeWar = codec.encode;
/** Text read back into the game of War it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of War it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeWar, encodeWar } from "@johnmorrisdotca/toranpu/war";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.war.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("war", { players: names, seed: 42 })!;
 * console.log(decodeWar(encodeWar(game))?.phase);
 * ```
 */
export const decodeWar = codec.decode;

/** War as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { WAR_RULES } from "@johnmorrisdotca/toranpu/war";
 * console.log(Object.keys(WAR_RULES));
 * ```
 */
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
