import { cardGameCodec, isCardList } from "../card-game-codec.ts";
import type { CardGameRules } from "../card-games.types.ts";

import { heartsMoves, heartsWinners, playHearts, startHearts } from "./hearts.ts";
import { heartsComputer } from "./hearts-computer.ts";
import type { HeartsGame, HeartsMove } from "./hearts.types.ts";

/** Hearts, kept as its table, seed and moves (`cardGameCodec`), and everything a table asks of its rules. */

function isHeartsMove(value: unknown): value is HeartsMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return typeof move.play === "string" || isCardList(move.pass);
}

const codec = cardGameCodec<HeartsGame, HeartsMove>("hearts", startHearts, playHearts, isHeartsMove);
/** A game of Hearts as text: its table, its seed and its moves, never a hand.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns A game of Hearts as text: its table, its seed and its moves, never a hand.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeHearts } from "@johnmorrisdotca/toranpu/hearts";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.hearts.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("hearts", { players: names, seed: 42 })!;
 * console.log(encodeHearts(game));
 * ```
 */
export const encodeHearts = codec.encode;
/** Text read back into the game of Hearts it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Text read back into the game of Hearts it records, by playing every move again through the rules; null for anything they cannot play out.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { decodeHearts, encodeHearts } from "@johnmorrisdotca/toranpu/hearts";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.hearts.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("hearts", { players: names, seed: 42 })!;
 * console.log(decodeHearts(encodeHearts(game))?.phase);
 * ```
 */
export const decodeHearts = codec.decode;

/** Hearts as one `CardGameRules`: everything a table asks of the game.
 *
 * @example
 * ```ts
 * import { HEARTS_RULES } from "@johnmorrisdotca/toranpu/hearts";
 * console.log(Object.keys(HEARTS_RULES));
 * ```
 */
export const HEARTS_RULES: CardGameRules<HeartsGame, HeartsMove> = {
  start: startHearts,
  moves: heartsMoves,
  play: playHearts,
  over: (game) => game.phase === "over",
  winners: heartsWinners,
  encode: encodeHearts,
  decode: decodeHearts,
  toPlay: (game) => game.toPlay,
  computer: heartsComputer,
  seats: (game) => ({ players: game.players, computers: game.computers }),
};
