import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId } from "../card-games.types.ts";
import type { ClimbMove, ClimbTrick } from "../climbing/climbing.types.ts";

/** A climbing move, or the cards a President or Vice-President hands back down at the start of a round.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import type { PresidentMove } from "@johnmorrisdotca/toranpu/president";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.president.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("president", { players: names, seed: 42 })!;
 * const value: PresidentMove = rulesFor("president").moves(game)[0]!;
 * console.log(value);
 * ```
 */
export type PresidentMove = ClimbMove | { give: CardId[] };

/** Cards handed over at the start of a round: the best cards up, whatever the receiver chooses back down.
 *
 * @example
 * ```ts
 * import type { PresidentSwap } from "@johnmorrisdotca/toranpu/president";
 *
 * const value: PresidentSwap = { from: 0, to: 3, cards: ["3D", "4C"] };
 * console.log(value.cards);
 * ```
 */
export type PresidentSwap = { from: number; to: number; cards: CardId[] };

/**
 * A GAME OF PRESIDENT: its table and moves (what is kept), and the round they
 * have reached. `size` is how many rounds the game lasts: 3, 5 or 7.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { PresidentGame } from "@johnmorrisdotca/toranpu/president";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.president.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("president", { players: names, seed: 42 })!;
 * const value: PresidentGame = game;
 * console.log(value.phase);
 * ```
 */
export type PresidentGame = KeptCardGame<PresidentMove> &
  ClimbTrick & {
    /** Which round this is, from 0. */
    round: number;
    /** Handing cards over before the round, playing it, or the game over. */
    phase: "exchange" | "playing" | "over";
    /** The order players went out this round, first to last so far. */
    out: number[];
    /** The order they went out last round, which gives this round's titles; null in the first. */
    titles: number[] | null;
    /** The hands-back still owed this round, in order: who gives, to whom, how many. */
    owed: { from: number; to: number; count: number }[];
    /** What has changed hands this round, both ways. */
    swaps: PresidentSwap[];
    /** Each seat's points so far: the most wins. */
    scores: number[];
    /** Each finished round's finishing order, first out first. */
    rounds: number[][];
  };
