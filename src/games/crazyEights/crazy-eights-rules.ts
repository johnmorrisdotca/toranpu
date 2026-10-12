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
/** A game of Crazy Eights as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Crazy Eights as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeCrazyEights } from "@johnmorrisdotca/toranpu/crazy-eights";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.crazyEights.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("crazyEights", { players: names, seed: 42 })!;
 * console.log(encodeCrazyEights(game));
 * ```
 */
export const encodeCrazyEights = codec.encode;
/** Text read back into the game of Crazy Eights it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of Crazy Eights it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeCrazyEights, encodeCrazyEights } from "@johnmorrisdotca/toranpu/crazy-eights";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.crazyEights.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("crazyEights", { players: names, seed: 42 })!;
 * console.log(decodeCrazyEights(encodeCrazyEights(game))?.phase);
 * ```
 */
export const decodeCrazyEights = codec.decode;

/** Crazy Eights as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { CRAZY_EIGHTS_RULES } from "@johnmorrisdotca/toranpu/crazy-eights";
 * console.log(Object.keys(CRAZY_EIGHTS_RULES));
 * ```
 */
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
