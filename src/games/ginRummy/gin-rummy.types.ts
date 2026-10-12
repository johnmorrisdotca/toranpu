import type { KeptCardGame } from "../card-game-codec.ts";
import type { CardId } from "../card-games.types.ts";

/** A card drawn from the stock or taken from the discard pile, or a card thrown: laid on the pile, or face down to knock.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import type { GinMove } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ginRummy", { players: names, seed: 42 })!;
 * const value: GinMove = rulesFor("ginRummy").moves(game)[0]!;
 * console.log(value);
 * ```
 */
export type GinMove = { draw: "stock" } | { draw: "discard" } | { discard: CardId } | { knock: CardId };

/** A meld: three or four of a rank, or a run of three or more in one suit.
 *
 * @example
 * ```ts
 * import type { GinMeld } from "@johnmorrisdotca/toranpu/gin-rummy";
 * import { isMeld } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const value: GinMeld = ["3H", "4H", "5H"];
 * console.log(isMeld(value));
 * ```
 */
export type GinMeld = CardId[];

/** Each hand's player, laid out: their melds, and the cards left over.
 *
 * @example
 * ```ts
 * import type { GinLayout } from "@johnmorrisdotca/toranpu/gin-rummy";
 * import { bestLayout } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const value: GinLayout = bestLayout(["3H", "4H", "5H", "AS"]);
 * console.log(value.deadwood);
 * ```
 */
export type GinLayout = { melds: GinMeld[]; deadwood: CardId[] };

/** How a hand ended: who scored and how much, and how each hand was laid down.
 *
 * @example
 * ```ts
 * import type { GinResult } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const value: GinResult = { knocker: null, winner: null, points: 0, kind: "drawn", layouts: [], laidOff: [] };
 * console.log(value.kind);
 * ```
 */
export type GinResult = {
  /** The seat that knocked, or null for a hand drawn with the stock run down. */
  knocker: number | null;
  /** The seat that scored the hand, or null for none. */
  winner: number | null;
  points: number;
  /** "gin" with no deadwood, "knock" won, "undercut" when the other player had no more, "drawn" when the stock ran out. */
  kind: "gin" | "knock" | "undercut" | "drawn";
  /** Each seat's melds and deadwood as scored, after the other player laid off onto a knocker's melds. */
  layouts: GinLayout[];
  /** The cards the defender laid off onto the knocker's melds. */
  laidOff: CardId[];
};

/**
 * A GAME OF GIN RUMMY: its table and moves (what is kept), and the hand they
 * have reached. Two seats. `size` is the score that wins: 50, 100 or 150.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import type { GinGame } from "@johnmorrisdotca/toranpu/gin-rummy";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.ginRummy.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * const game = newGame("ginRummy", { players: names, seed: 42 })!;
 * const value: GinGame = game;
 * console.log(value.phase);
 * ```
 */
export type GinGame = KeptCardGame<GinMove> & {
  /** Which hand this is, from 0: the first to play alternates. */
  hand: number;
  /** Drawing a card, throwing one, or the game over. */
  phase: "draw" | "discard" | "over";
  hands: CardId[][];
  /** The stock, face down, top card first. */
  stock: CardId[];
  /** The discard pile, face up, the top card last. */
  discard: CardId[];
  /** The card just taken from the discard pile, which may not be thrown straight back; null otherwise. */
  taken: CardId | null;
  toPlay: number | null;
  /** The cards each seat has taken from the discard pile this hand and still holds: what the whole table watched them take. */
  picked: CardId[][];
  /** The cards thrown this hand so far: a new hand shows how the last was laid down until each player has thrown once. */
  throws: number;
  scores: number[];
  results: GinResult[];
};
