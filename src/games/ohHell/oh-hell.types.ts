import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId, CardSuit } from "../card-games.types.ts";

/** Bidding the exact number of tricks each seat will take, playing the deal out, or the game over.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { OhHellPhase } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ohHell", { players: names, seed: 42 })!;
 * const value: OhHellPhase = game.phase;
 * console.log(value);
 * ```
 */
export type OhHellPhase = "bidding" | "playing" | "over";

/** One card laid, and whose it was.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { OhHellPlay } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ohHell", { players: names, seed: 42 })!;
 * const value: OhHellPlay = { seat: 0, card: game.hands[0]![0]! };
 * console.log(value.card);
 * ```
 */
export type OhHellPlay = { seat: number; card: CardId };

/** A bid of tricks, nought up to the cards in hand, or one card played to the trick.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import type { OhHellMove } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ohHell", { players: names, seed: 42 })!;
 * const value: OhHellMove = rulesFor("ohHell").moves(game)[0]!;
 * console.log(value);
 * ```
 */
export type OhHellMove = { bid: number } | { play: CardId };

/** What one finished deal did: each seat's bid, the tricks it took, and what it scored.
 *
 * @example
 * ```ts
 * import type { OhHellDealScore } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const value: OhHellDealScore = { cards: 1, bids: [1, 0, 0], tricks: [1, 0, 0], points: [11, 10, 10] };
 * console.log(value.cards);
 * ```
 */
export type OhHellDealScore = { cards: number; bids: number[]; tricks: number[]; points: number[] };

/**
 * A GAME OF OH HELL: its table and moves (what is kept, `KeptCardGame`), and
 * everything the moves make. Three or four seats, each for itself. `size` is
 * how many deals: 7 (one card, then two, up to seven) or 13 (up to seven and
 * back down to one).
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { OhHellGame } from "@johnmorrisdotca/toranpu/oh-hell";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ohHell.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ohHell", { players: names, seed: 42 })!;
 * const value: OhHellGame = game;
 * console.log(value.phase);
 * ```
 */
export type OhHellGame = KeptCardGame<OhHellMove> & {
  /** Which deal this is, from 0. */
  deal: number;
  phase: OhHellPhase;
  /** The cards each seat holds this deal. */
  cards: number;
  hands: CardId[][];
  /** The card turned up after the deal: its suit is trumps. */
  turned: CardId;
  trump: CardSuit;
  bids: (number | null)[];
  trick: OhHellPlay[];
  lastTrick: { plays: OhHellPlay[]; winner: number } | null;
  /** Every card played in a finished trick this deal. */
  played: CardId[];
  toPlay: number | null;
  tricks: number[];
  scores: number[];
  dealScores: OhHellDealScore[];
};
