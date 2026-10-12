import { cardGameCodec } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { cribbageMoves, cribbageWinners, playCribbage, startCribbage } from "./cribbage.ts";
import { cribbageComputer } from "./cribbage-computer.ts";
import type { CribbageGame, CribbageMove } from "./cribbage.types.ts";

/** Cribbage, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isCribbageMove(value: unknown): value is CribbageMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  if (typeof move.play === "string") return true;
  return Array.isArray(move.crib) && move.crib.length === 2 && move.crib.every((card) => typeof card === "string");
}

const codec = cardGameCodec<CribbageGame, CribbageMove>("cribbage", startCribbage, playCribbage, isCribbageMove);
/** A game of Cribbage as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Cribbage as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeCribbage } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("cribbage", { players: names, seed: 42 })!;
 * console.log(encodeCribbage(game));
 * ```
 */
export const encodeCribbage = codec.encode;
/** Text read back into the game of Cribbage it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of Cribbage it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeCribbage, encodeCribbage } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("cribbage", { players: names, seed: 42 })!;
 * console.log(decodeCribbage(encodeCribbage(game))?.phase);
 * ```
 */
export const decodeCribbage = codec.decode;

/** Cribbage as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { CRIBBAGE_RULES } from "@johnmorrisdotca/toranpu/cribbage";
 * console.log(Object.keys(CRIBBAGE_RULES));
 * ```
 */
export const CRIBBAGE_RULES: CardGameRules<CribbageGame, CribbageMove> = {
  start: startCribbage,
  moves: cribbageMoves,
  play: playCribbage,
  over: (game) => game.phase === "over",
  winners: cribbageWinners,
  encode: encodeCribbage,
  decode: decodeCribbage,
  toPlay: (game) => game.toPlay,
  computer: cribbageComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
