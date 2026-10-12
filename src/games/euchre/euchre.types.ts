import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId, CardSuit } from "../card-games.types.ts";

/**
 * Ordering up the card turned up, or passing; naming another suit, or passing;
 * the dealer throwing a card after picking the turned one up; or a card
 * played to the trick.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import type { EuchreMove } from "@johnmorrisdotca/toranpu/euchre";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.euchre.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("euchre", { players: names, seed: 42 })!;
 * const value: EuchreMove = rulesFor("euchre").moves(game)[0]!;
 * console.log(value);
 * ```
 */
export type EuchreMove = { order: true } | { pass: true } | { call: CardSuit } | { discard: CardId } | { play: CardId };

/**
 * The first round of the making (take the turned card's suit, or pass), the
 * second (name another suit, or pass — the dealer may not), the dealer's
 * discard, the tricks, or the game over.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { EuchrePhase } from "@johnmorrisdotca/toranpu/euchre";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.euchre.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("euchre", { players: names, seed: 42 })!;
 * const value: EuchrePhase = game.phase;
 * console.log(value);
 * ```
 */
export type EuchrePhase = "order" | "call" | "discard" | "playing" | "over";

/** One card laid, and whose it was.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { EuchrePlay } from "@johnmorrisdotca/toranpu/euchre";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.euchre.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("euchre", { players: names, seed: 42 })!;
 * const value: EuchrePlay = { seat: 0, card: game.hands[0]![0]! };
 * console.log(value.card);
 * ```
 */
export type EuchrePlay = { seat: number; card: CardId };

/** What one hand did: which partnership made trumps, the tricks it took, and the points each partnership scored.
 *
 * @example
 * ```ts
 * import type { EuchreHandScore } from "@johnmorrisdotca/toranpu/euchre";
 *
 * const value: EuchreHandScore = { makers: 0, trump: "H", tricks: 3, points: [1, 0] };
 * console.log(value.trump);
 * ```
 */
export type EuchreHandScore = { makers: 0 | 1; trump: CardSuit; tricks: number; points: [number, number] };

/**
 * A GAME OF EUCHRE: its table and moves (what is kept, `KeptCardGame`), and
 * everything the moves make. Four seats in two partnerships across the table,
 * seats 0 and 2 against 1 and 3. `size` is the score that wins: 5 or 10.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { EuchreGame } from "@johnmorrisdotca/toranpu/euchre";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.euchre.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("euchre", { players: names, seed: 42 })!;
 * const value: EuchreGame = game;
 * console.log(value.phase);
 * ```
 */
export type EuchreGame = KeptCardGame<EuchreMove> & {
  /** Which hand this is, from 0: the deal moves one seat round each time. */
  deal: number;
  phase: EuchrePhase;
  hands: CardId[][];
  /** The card turned up from the four left over. */
  upcard: CardId;
  /** Trumps, once made; null while the making goes round. */
  trump: CardSuit | null;
  /** The seat that made trumps. */
  maker: number | null;
  /** How many seats have passed in the making's current round. */
  passes: number;
  trick: EuchrePlay[];
  lastTrick: { plays: EuchrePlay[]; winner: number } | null;
  played: CardId[];
  toPlay: number | null;
  /** Tricks each seat has taken this hand. */
  tricks: number[];
  /** Each partnership's points: seats 0 and 2, then 1 and 3. */
  scores: [number, number];
  /** Each finished hand, one row a hand. */
  results: EuchreHandScore[];
};
