/**
 * THE VOCABULARY OF A DECK OF PLAYING CARDS.
 *
 * One deck, fifty-two cards, four suits of thirteen ranks, for any card game:
 * a solitaire and the table games here deal the same one. Nothing here knows
 * any game's rules; a game keeps its own state and names cards by these.
 */

/** One of the four suits, by name.
 *
 * @example
 * ```ts
 * import type { Suit } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: Suit = "spades";
 * console.log(value);
 * ```
 */
export type Suit = "spades" | "hearts" | "diamonds" | "clubs";

/** Ace is 1 and King 13. A game that ranks the ace high (Hearts, Big Two) says so in its own rules.
 *
 * @example
 * ```ts
 * import type { Rank } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: Rank = 1;
 * console.log(value);
 * ```
 */
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

/** A suit's colour, which Klondike's alternating runs and Crazy Eights' matches both read.
 *
 * @example
 * ```ts
 * import type { SuitColour } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: SuitColour = "black";
 * console.log(value);
 * ```
 */
export type SuitColour = "red" | "black";

/** A card as an object: its suit and its rank.
 *
 * @example
 * ```ts
 * import type { Card } from "@johnmorrisdotca/toranpu/deck";
 * import { cardId } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: Card = { suit: "spades", rank: 1 };
 * console.log(cardId(value));
 * ```
 */
export type Card = { suit: Suit; rank: Rank };

/**
 * A card as ONE character, `A`–`Z` then `a`–`z` (`cardCode`): a whole deck is a
 * fifty-two-character string, so a deal travels in a saved game, an address
 * and a move list without any separator to parse.
 *
 * @example
 * ```ts
 * import type { CardCode } from "@johnmorrisdotca/toranpu/deck";
 * import { cardCode } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: CardCode = cardCode({ suit: "spades", rank: 1 });
 * console.log(value);
 * ```
 */
export type CardCode = string;

/** How a suit is written and drawn.
 *
 * @example
 * ```ts
 * import type { SuitDisplay } from "@johnmorrisdotca/toranpu/deck";
 * import { SUIT_DISPLAY } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: SuitDisplay = SUIT_DISPLAY.spades;
 * console.log(value.symbol);
 * ```
 */
export type SuitDisplay = {
  /** The Unicode suit, for a sentence or an aria label: ♠ ♥ ♦ ♣. */
  symbol: string;
  /** Its name in English, lower case, as a sentence uses it. */
  name: string;
  colour: SuitColour;
};

/** How a rank is written: `A`, `2`…`10`, `J`, `Q`, `K`, and in a sentence.
 *
 * @example
 * ```ts
 * import type { RankDisplay } from "@johnmorrisdotca/toranpu/deck";
 * import { RANK_DISPLAY } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: RankDisplay = RANK_DISPLAY[1];
 * console.log(value.short);
 * ```
 */
export type RankDisplay = { short: string; name: string };
