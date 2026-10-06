import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId } from "../card-games.types.ts";

/**
 * The one thing a player does at War: turn the top cards over. War has no choices, so this is its only move, and a
 * computer's turn is the same move as a person's.
 */
export type WarMove = { turn: true };

/** One card laid in a turn: who laid it, and whether it lay face down (the three of a war) or was turned up. */
export type WarLaid = { seat: number; card: CardId; down: boolean };

/**
 * What the table saw of the last turn: every card laid, in the order laid, how many wars the turn went through (0 for a plain
 * turn of the cards), and who took the cards (null when the turn ended the game on a war that was not finished).
 */
export type WarTurn = { laid: WarLaid[]; wars: number; winner: number | null };

/**
 * Why a game of War ended: one player has every card (`"cleared"`), a player could not finish a war and the other could,
 * or both could not and one ran out first (`"short"`), both ran out together (`"drawn"`), or the turns ran out (`"limit"`).
 */
export type WarEnd = "cleared" | "short" | "drawn" | "limit";

/**
 * A GAME OF WAR: its table and moves (what is kept), and what they make. `size` is how many turns it may last, and `hands`
 * are each player's cards, face down, the top card first. Nothing here is hidden: no player chooses anything.
 */
export type WarGame = KeptCardGame<WarMove> & {
  phase: "playing" | "over";
  /** Each player's pile, top card first. */
  hands: CardId[][];
  /** The seat the table waits on: the first person's, or the first seat when computers hold both. Null once over. */
  toPlay: number | null;
  /** The last turn, for the table to show; null before the first. */
  last: WarTurn | null;
  /** Why the game ended; null while it goes on. */
  ended: WarEnd | null;
};
