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
/** A game of Go Fish as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Go Fish as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeGoFish } from "@johnmorrisdotca/toranpu/go-fish";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.goFish.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("goFish", { players: names, seed: 42 })!;
 * console.log(encodeGoFish(game));
 * ```
 */
export const encodeGoFish = codec.encode;
/** Text read back into the game of Go Fish it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of Go Fish it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeGoFish, encodeGoFish } from "@johnmorrisdotca/toranpu/go-fish";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.goFish.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("goFish", { players: names, seed: 42 })!;
 * console.log(decodeGoFish(encodeGoFish(game))?.phase);
 * ```
 */
export const decodeGoFish = codec.decode;

/** Go Fish as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { GO_FISH_RULES } from "@johnmorrisdotca/toranpu/go-fish";
 * console.log(Object.keys(GO_FISH_RULES));
 * ```
 */
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
