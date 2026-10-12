import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId } from "../card-games.types.ts";

/** Passing three cards before the deal is played, playing it out trick by trick, or the game over.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { HeartsPhase } from "@johnmorrisdotca/toranpu/hearts";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.hearts.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("hearts", { players: names, seed: 42 })!;
 * const value: HeartsPhase = game.phase;
 * console.log(value);
 * ```
 */
export type HeartsPhase = "passing" | "playing" | "over";

/** One card laid on a trick, and whose it was.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { HeartsPlay } from "@johnmorrisdotca/toranpu/hearts";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.hearts.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("hearts", { players: names, seed: 42 })!;
 * const value: HeartsPlay = { seat: 0, card: game.hands[0]![0]! };
 * console.log(value.card);
 * ```
 */
export type HeartsPlay = { seat: number; card: CardId };

/** Three cards passed (all three at once, as a player hands them over), or one card played to the trick.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import type { HeartsMove } from "@johnmorrisdotca/toranpu/hearts";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.hearts.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("hearts", { players: names, seed: 42 })!;
 * const value: HeartsMove = rulesFor("hearts").moves(game)[0]!;
 * console.log(value);
 * ```
 */
export type HeartsMove = { pass: CardId[] } | { play: CardId };

/**
 * A GAME OF HEARTS: its table and moves (what is kept, `KeptCardGame`), and
 * everything the moves make, read again from them whenever the game is.
 * `size` is the score that ends the game: 50 or 100.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { HeartsGame } from "@johnmorrisdotca/toranpu/hearts";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.hearts.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("hearts", { players: names, seed: 42 })!;
 * const value: HeartsGame = game;
 * console.log(value.phase);
 * ```
 */
export type HeartsGame = KeptCardGame<HeartsMove> & {
  /** Which deal this is, from 0: it decides the way the cards are passed. */
  deal: number;
  phase: HeartsPhase;
  hands: CardId[][];
  /** The three cards each seat has chosen to pass this deal, or null while it has not. */
  passing: (CardId[] | null)[];
  /** The three cards each seat was passed this deal, shown to that seat once the passing is done. */
  received: CardId[][];
  /** The trick on the table, in the order it was played. */
  trick: HeartsPlay[];
  /** The trick before, and who took it: what a player may still look back at. */
  lastTrick: { plays: HeartsPlay[]; winner: number } | null;
  /** Every card played in a finished trick this deal: what everybody at the table has seen. */
  played: CardId[];
  /** Whose move it is; null once the game is over. */
  toPlay: number | null;
  heartsBroken: boolean;
  /** Each seat's points taken this deal, so far. */
  points: number[];
  /** Each seat's total before this deal. */
  scores: number[];
  /** Each finished deal's points, one row a deal. */
  dealScores: number[][];
  /** The seat that took every point of the last finished deal, if one did. */
  moon: number | null;
};
