import { RANK_DISPLAY } from "../cards/cards.constants.ts";
import type { Card } from "../cards/cards.types.ts";
import { cardFromId, cardId, cardName, freshDeck, shuffledDeck as shuffledCards } from "../cards/deck.ts";
import { seededRandom, shuffled } from "../random.ts";

import type { CardId, CardRank, CardSuit } from "./card-games.types.ts";

/**
 * THE CARDS THE TABLE GAMES ARE DEALT, as the rules see them: fifty-two
 * short names, "QS" for the queen of spades and "TD" for the ten of
 * diamonds, a rank letter and a suit letter.
 *
 * A name rather than an object, because a rule compares, counts and keeps
 * cards far more often than it draws one: two names are equal when they are
 * the same card, a hand is a list of them, and a game kept as text is short.
 * They are the deck's own ids (`cardId` in `cards/deck.ts`), dealt from its
 * shuffle, and `cardOfId` turns one back into the deck's `Card` for drawing.
 */

/** The rank letters, ace low: an index here plus one is the rank (A = 1, J = 11, Q = 12, K = 13).
 *
 * @example
 * ```ts
 * import { RANK_LETTERS } from "@johnmorrisdotca/toranpu";
 * console.log(RANK_LETTERS);
 * ```
 */
export const RANK_LETTERS = "A23456789TJQK";

/** Every card, in the deck's own order.
 *
 * @example
 * ```ts
 * import { FULL_DECK } from "@johnmorrisdotca/toranpu";
 * console.log(FULL_DECK.slice(0, 8));
 * ```
 */
export const FULL_DECK: readonly CardId[] = freshDeck().map(cardId);

const EVERY_CARD = new Set(FULL_DECK);

/** Whether this is one of the fifty-two names.
 *
 * @param value - The unknown value to validate.
 * @returns Whether this is one of the fifty-two names.
 *
 * @example
 * ```ts
 * import { isCard } from "@johnmorrisdotca/toranpu";
 *
 * console.log(isCard("AS"));
 * ```
 */
export function isCard(value: unknown): value is CardId {
  return typeof value === "string" && EVERY_CARD.has(value);
}

/** A card's rank, ace low: 1 to 13.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns A card's rank, ace low: 1 to 13.
 *
 * @example
 * ```ts
 * import { rankOf } from "@johnmorrisdotca/toranpu";
 *
 * console.log(rankOf("AS"));
 * ```
 */
export function rankOf(card: CardId): CardRank {
  return (RANK_LETTERS.indexOf(card[0]) + 1) as CardRank;
}

/** A card's suit, as its letter: `S`, `H`, `D` or `C`.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns A card's suit, as its letter: `S`, `H`, `D` or `C`.
 *
 * @example
 * ```ts
 * import { suitOf } from "@johnmorrisdotca/toranpu";
 *
 * console.log(suitOf("AS"));
 * ```
 */
export function suitOf(card: CardId): CardSuit {
  return card[1] as CardSuit;
}

/** The card of this rank and suit.
 *
 * @param rank - The card rank to inspect or name.
 * @param suit - The card suit to compare or name.
 * @returns The card of this rank and suit.
 *
 * @example
 * ```ts
 * import { cardOf } from "@johnmorrisdotca/toranpu";
 *
 * console.log(cardOf(1, "S"));
 * ```
 */
export function cardOf(rank: CardRank, suit: CardSuit): CardId {
  return `${RANK_LETTERS[rank - 1]}${suit}`;
}

/** The deck's card for an id, for the deck's components to draw.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns The deck's card for an id, for the deck's components to draw.
 *
 * @example
 * ```ts
 * import { cardOfId } from "@johnmorrisdotca/toranpu";
 *
 * console.log(cardOfId("AS"));
 * ```
 */
export function cardOfId(card: CardId): Card {
  const found = cardFromId(card);
  if (found === null) throw new Error(`no card ${card}`);
  return found;
}

/** "queen of spades", as a sentence and a screen reader say it.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns "queen of spades", as a sentence and a screen reader say it.
 *
 * @example
 * ```ts
 * import { cardWords } from "@johnmorrisdotca/toranpu";
 *
 * console.log(cardWords("AS"));
 * ```
 */
export function cardWords(card: CardId): string {
  return cardName(cardOfId(card));
}

/** A rank named in the plural, as it is asked for: "sevens", "sixes", "queens".
 *
 * @param rank - The card rank to inspect or name.
 * @returns A rank named in the plural, as it is asked for: "sevens", "sixes", "queens".
 *
 * @example
 * ```ts
 * import { rankWords } from "@johnmorrisdotca/toranpu";
 *
 * console.log(rankWords(1));
 * ```
 */
export function rankWords(rank: CardRank): string {
  const word = RANK_DISPLAY[rank].name;
  return word.endsWith("x") ? `${word}es` : `${word}s`;
}

/** A suit's name: "spades".
 *
 * @param suit - The card suit to compare or name.
 * @returns A suit's name: "spades".
 *
 * @example
 * ```ts
 * import { suitWords } from "@johnmorrisdotca/toranpu";
 *
 * console.log(suitWords("S"));
 * ```
 */
export function suitWords(suit: CardSuit): string {
  return { C: "clubs", D: "diamonds", H: "hearts", S: "spades" }[suit];
}

/**
 * The deck shuffled for one deal of one game: the same seed and deal always
 * the same order, so a game kept as its seed and moves deals itself again
 * exactly, and reloading can never re-deal a hand somebody has seen.
 *
 * @param seed - The numeric seed that reproduces the same shuffle or deal.
 * @param deal - The deal number or dealing specification.
 * @param leaveOut - Cards to omit from the generated deck or possibilities.
 * @returns The deck shuffled for one deal of one game: the same seed and deal always the same order, so a game kept as its seed and moves deals itself again exactly, and reloading can never re-deal a hand somebody has seen.
 *
 * @example
 * ```ts
 * import { shuffledDeck } from "@johnmorrisdotca/toranpu";
 *
 * console.log(shuffledDeck(42, 0).slice(0, 7));
 * ```
 */
export function shuffledDeck(seed: number, deal: number, leaveOut: readonly CardId[] = []): CardId[] {
  return shuffledCards(mixSeed(seed, deal))
    .map(cardId)
    .filter((card) => !leaveOut.includes(card));
}

/** These cards shuffled again, the same way for the same seed and salt: a pile turned over to make a new stock.
 *
 * @param cards - The cards in their current order.
 * @param seed - The numeric seed that reproduces the same shuffle or deal.
 * @param salt - The extra value mixed into a seeded shuffle.
 * @returns These cards shuffled again, the same way for the same seed and salt: a pile turned over to make a new stock.
 *
 * @example
 * ```ts
 * import { reshuffled } from "@johnmorrisdotca/toranpu";
 *
 * console.log(reshuffled(["AS", "KH", "TD"], 42, 1));
 * ```
 */
export function reshuffled(cards: readonly CardId[], seed: number, salt: number): CardId[] {
  return shuffled(cards, seededRandom(mixSeed(seed, salt)));
}

/** Two numbers folded into one seed, so each deal of a game (and each reshuffle within one) has its own order.
 *
 * @param seed - The numeric seed that reproduces the same shuffle or deal.
 * @param salt - The extra value mixed into a seeded shuffle.
 * @returns Two numbers folded into one seed, so each deal of a game (and each reshuffle within one) has its own order.
 *
 * @example
 * ```ts
 * import { mixSeed } from "@johnmorrisdotca/toranpu";
 *
 * console.log(mixSeed(42, 1));
 * ```
 */
export function mixSeed(seed: number, salt: number): number {
  let h = (seed ^ 0x9e3779b9) >>> 0;
  h = Math.imul(h ^ (salt + 0x7f4a7c15), 0x85ebca6b) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

/**
 * Deals the cards one at a time round the table, from the first seat, as a
 * dealer does: `each` to a seat, or every card when `each` is absent (so some
 * seats hold one more than others). What is not dealt is the stock, in order,
 * its top card first.
 *
 * @param deck - The deck in its current order; the input is left unchanged.
 * @param seats - The seat count or seat state supplied by this API.
 * @param each - The number of cards dealt to each hand.
 * @returns Deals the cards one at a time round the table, from the first seat, as a dealer does: `each` to a seat, or every card when `each` is absent (so some seats hold one more than others). What is not dealt is the stock, in order, its top card first.
 *
 * @example
 * ```ts
 * import { FULL_DECK, dealRound } from "@johnmorrisdotca/toranpu";
 *
 * console.log(dealRound(FULL_DECK, 4, 5).hands.map((hand) => hand.length));
 * ```
 */
export function dealRound(deck: readonly CardId[], seats: number, each?: number): { hands: CardId[][]; stock: CardId[] } {
  const hands: CardId[][] = Array.from({ length: seats }, () => []);
  const dealt = each === undefined ? deck.length : Math.min(deck.length, each * seats);
  for (let at = 0; at < dealt; at += 1) hands[at % seats].push(deck[at]);
  return { hands, stock: deck.slice(dealt) };
}

/** The hand without these cards, or null when it does not hold every one of them.
 *
 * @param hand - The player’s held cards, or the hand number for a deal.
 * @param cards - The cards in their current order.
 * @returns The hand without these cards, or null when it does not hold every one of them.
 *
 * @example
 * ```ts
 * import { without } from "@johnmorrisdotca/toranpu";
 *
 * console.log(without(["AS", "KH"], ["AS"]));
 * ```
 */
export function without(hand: readonly CardId[], cards: readonly CardId[]): CardId[] | null {
  const left = [...hand];
  for (const card of cards) {
    const at = left.indexOf(card);
    if (at < 0) return null;
    left.splice(at, 1);
  }
  return left;
}

/** Whether a list names no card twice.
 *
 * @param cards - The cards in their current order.
 * @returns Whether a list names no card twice.
 *
 * @example
 * ```ts
 * import { allDifferent } from "@johnmorrisdotca/toranpu";
 *
 * console.log(allDifferent(["AS", "AS"]));
 * ```
 */
export function allDifferent(cards: readonly CardId[]): boolean {
  return new Set(cards).size === cards.length;
}

/** Every way of choosing `count` of these cards, in the order they are given.
 *
 * @param items - The items to shuffle without changing the input.
 * @param count - The requested number of cards, sounds or layout positions.
 * @returns Every way of choosing `count` of these cards, in the order they are given.
 *
 * @example
 * ```ts
 * import { choices } from "@johnmorrisdotca/toranpu";
 *
 * console.log(choices([1, 2, 3], 2));
 * ```
 */
export function choices<T>(items: readonly T[], count: number): T[][] {
  const out: T[][] = [];
  const pick = (from: number, chosen: T[]) => {
    if (chosen.length === count) {
      out.push(chosen);
      return;
    }
    for (let at = from; at <= items.length - (count - chosen.length); at += 1) pick(at + 1, [...chosen, items[at]]);
  };
  pick(0, []);
  return out;
}

/** The next seat round the table, to the left: the order every game here plays in.
 *
 * @param seat - The zero-based player seat.
 * @param seats - The seat count or seat state supplied by this API.
 * @returns The next seat round the table, to the left: the order every game here plays in.
 *
 * @example
 * ```ts
 * import { nextSeat } from "@johnmorrisdotca/toranpu";
 *
 * console.log(nextSeat(3, 4));
 * ```
 */
export function nextSeat(seat: number, seats: number): number {
  return (seat + 1) % seats;
}
