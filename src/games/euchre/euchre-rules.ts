import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { euchreMoves, euchreWinners, playEuchre, startEuchre } from "./euchre.ts";
import { euchreComputer } from "./euchre-computer.ts";
import type { EuchreGame, EuchreMove } from "./euchre.types.ts";

/** Euchre, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isEuchreMove(value: unknown): value is EuchreMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return move.order === true || move.pass === true || typeof move.call === "string" || typeof move.discard === "string" || typeof move.play === "string";
}

const codec = cardGameCodec<EuchreGame, EuchreMove>("euchre", startEuchre, playEuchre, isEuchreMove);
/** A game of Euchre as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Euchre as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeEuchre } from "@johnmorrisdotca/toranpu/euchre";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.euchre.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("euchre", { players: names, seed: 42 })!;
 * console.log(encodeEuchre(game));
 * ```
 */
export const encodeEuchre = codec.encode;
/** Text read back into the game of Euchre it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of Euchre it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeEuchre, encodeEuchre } from "@johnmorrisdotca/toranpu/euchre";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.euchre.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("euchre", { players: names, seed: 42 })!;
 * console.log(decodeEuchre(encodeEuchre(game))?.phase);
 * ```
 */
export const decodeEuchre = codec.decode;

/** Euchre as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { EUCHRE_RULES } from "@johnmorrisdotca/toranpu/euchre";
 * console.log(Object.keys(EUCHRE_RULES));
 * ```
 */
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
