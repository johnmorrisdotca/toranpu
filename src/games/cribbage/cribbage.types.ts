import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId } from "../card-games.types.ts";

/** Two cards laid away to the crib, or one card played in the pegging.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import type { CribbageMove } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("cribbage", { players: names, seed: 42 })!;
 * const value: CribbageMove = rulesFor("cribbage").moves(game)[0]!;
 * console.log(value);
 * ```
 */
export type CribbageMove = { crib: [CardId, CardId] } | { play: CardId };

/** Both players laying two cards to the crib, the pegging, or the game over.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { CribbagePhase } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("cribbage", { players: names, seed: 42 })!;
 * const value: CribbagePhase = game.phase;
 * console.log(value);
 * ```
 */
export type CribbagePhase = "crib" | "pegging" | "over";

/** One card laid, and whose it was.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { CribbagePlay } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("cribbage", { players: names, seed: 42 })!;
 * const value: CribbagePlay = { seat: 0, card: game.hands[0]![0]! };
 * console.log(value.card);
 * ```
 */
export type CribbagePlay = { seat: number; card: CardId };

/** What one card played in the pegging scored, and why: "fifteen", "a pair", "a run of three", "go", "last card", "thirty-one".
 *
 * @example
 * ```ts
 * import type { CribbagePeg } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const value: CribbagePeg = { seat: 0, points: 2, why: ["fifteen"] };
 * console.log(value.points);
 * ```
 */
export type CribbagePeg = { seat: number; points: number; why: string[] };

/** What a hand's show is worth, by kind.
 *
 * @example
 * ```ts
 * import type { CribbageCount } from "@johnmorrisdotca/toranpu/cribbage";
 * import { showCount } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const value: CribbageCount = showCount(["5H", "5D", "5C", "JS"], "5S");
 * console.log(value.total);
 * ```
 */
export type CribbageCount = { fifteens: number; pairs: number; runs: number; flush: number; nobs: number; total: number };

/** One hand as it was shown: the dealer, the starter, both four-card hands and the crib, and what each counted.
 *
 * @example
 * ```ts
 * import type { CribbageHandScore } from "@johnmorrisdotca/toranpu/cribbage";
 * import { showCount } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const value: CribbageHandScore = { dealer: 0, starter: "5S", hands: [["5H", "5D", "5C", "JS"], ["AH", "2D", "3C", "4S"]], crib: ["6H", "7D", "8C", "9S"], counts: [showCount(["5H", "5D", "5C", "JS"], "5S"), showCount(["AH", "2D", "3C", "4S"], "5S")], cribCount: showCount(["6H", "7D", "8C", "9S"], "5S", true) };
 * console.log(value.cribCount.total);
 * ```
 */
export type CribbageHandScore = {
  dealer: number;
  starter: CardId;
  hands: [CardId[], CardId[]];
  crib: CardId[];
  counts: [CribbageCount, CribbageCount];
  cribCount: CribbageCount;
};

/**
 * A GAME OF CRIBBAGE: its table and moves (what is kept, `KeptCardGame`), and
 * everything the moves make, read again from them whenever the game is. Two
 * seats; `size` is the score that wins, 61 or 121.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { CribbageGame } from "@johnmorrisdotca/toranpu/cribbage";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.cribbage.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("cribbage", { players: names, seed: 42 })!;
 * const value: CribbageGame = game;
 * console.log(value.phase);
 * ```
 */
export type CribbageGame = KeptCardGame<CribbageMove> & {
  /** Which hand this is, from 0: the deal goes to the other player each time. */
  deal: number;
  phase: CribbagePhase;
  /** The cards each seat still holds: six dealt, four kept, then played away in the pegging. */
  hands: CardId[][];
  /** The four cards each seat kept, as they will be shown. */
  kept: CardId[][];
  crib: CardId[];
  /** The card to be cut once the crib is laid: face down until then, so never shown. */
  cut: CardId;
  /** The starter, once cut. */
  starter: CardId | null;
  /** The pegging count, 0 to 31. */
  count: number;
  /** The cards played since the count last went back to nought. */
  run: CribbagePlay[];
  /** Every card played in the pegging this hand. */
  pegged: CribbagePlay[];
  /** What the last card played scored, if it scored. */
  peg: CribbagePeg | null;
  toPlay: number | null;
  scores: [number, number];
  /** Each hand shown, one row a hand. */
  results: CribbageHandScore[];
};
