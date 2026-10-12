import { cardGameCodec, isCardList } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";
import { isClimbMove } from "../climbing/climbing.ts";

import { playPresident, presidentMoves, presidentWinners, startPresident } from "./president.ts";
import { presidentComputer } from "./president-computer.ts";
import type { PresidentGame, PresidentMove } from "./president.types.ts";

/** President, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isPresidentMove(value: unknown): value is PresidentMove {
  return isClimbMove(value) || (typeof value === "object" && value !== null && isCardList((value as Record<string, unknown>).give));
}

const codec = cardGameCodec<PresidentGame, PresidentMove>("president", startPresident, playPresident, isPresidentMove);
/** A game of President as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of President as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodePresident } from "@johnmorrisdotca/toranpu/president";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.president.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("president", { players: names, seed: 42 })!;
 * console.log(encodePresident(game));
 * ```
 */
export const encodePresident = codec.encode;
/** Text read back into the game of President it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of President it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodePresident, encodePresident } from "@johnmorrisdotca/toranpu/president";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.president.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("president", { players: names, seed: 42 })!;
 * console.log(decodePresident(encodePresident(game))?.phase);
 * ```
 */
export const decodePresident = codec.decode;

/** President as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { PRESIDENT_RULES } from "@johnmorrisdotca/toranpu/president";
 * console.log(Object.keys(PRESIDENT_RULES));
 * ```
 */
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
