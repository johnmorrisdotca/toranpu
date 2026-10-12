import { seededRandom, shuffled } from "../random.ts";

import { CARD_ALPHABET, DECK_SIZE, RANKS, RANK_DISPLAY, SUITS, SUIT_DISPLAY } from "./cards.constants.ts";
import type { Card, CardCode, Rank, Suit, SuitColour } from "./cards.types.ts";

/**
 * THE DECK, AND WHAT ANY CARD GAME DOES WITH IT BEFORE ITS OWN RULES BEGIN:
 * make one, shuffle it from a seed, deal it out, and write it down.
 *
 * Pure: every function returns new arrays and leaves what it was given alone,
 * so a game can keep its deck and replay a deal exactly. The shuffle is
 * seeded (`random.ts`), so a seed kept with a game's moves re-deals the same
 * cards in every browser, and reloading a page can never deal again.
 */

/** A fresh deck in the order a new pack is sorted: spades ace to king, then hearts, diamonds, clubs.
 *
 * @returns A fresh deck in the order a new pack is sorted: spades ace to king, then hearts, diamonds, clubs.
 *
 * @example
 * ```ts
 * import { freshDeck } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(freshDeck().slice(0, 4));
 * ```
 */
export function freshDeck(): Card[] {
  return SUITS.flatMap((suit) => RANKS.map((rank) => ({ suit, rank })));
}

/** A deck shuffled from a seed: the same seed, the same order, in every browser and every test.
 *
 * @param seed - The numeric seed that reproduces the same shuffle or deal.
 * @returns A deck shuffled from a seed: the same seed, the same order, in every browser and every test.
 *
 * @example
 * ```ts
 * import { shuffledDeck } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(shuffledDeck(42).slice(0, 7));
 * ```
 */
export function shuffledDeck(seed: number): Card[] {
  return shuffled(freshDeck(), seededRandom(seed));
}

/** A card's colour: red for hearts and diamonds, black for spades and clubs.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns A card's colour: red for hearts and diamonds, black for spades and clubs.
 *
 * @example
 * ```ts
 * import { colourOf } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(colourOf(card));
 * ```
 */
export function colourOf(card: Card): SuitColour {
  return SUIT_DISPLAY[card.suit].colour;
}

/** Whether a card is a heart or a diamond.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns Whether a card is a heart or a diamond.
 *
 * @example
 * ```ts
 * import { isRed } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(isRed(card));
 * ```
 */
export function isRed(card: Card): boolean {
  return colourOf(card) === "red";
}

/** Whether two card objects are the same card.
 *
 * @param a - The first card or value to compare.
 * @param b - The second card or value to compare.
 * @returns Whether two card objects are the same card.
 *
 * @example
 * ```ts
 * import { cardFromId, sameCard } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(sameCard(card, cardFromId("AS")!));
 * ```
 */
export function sameCard(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

/** The card's place in a fresh deck, 0 to 51.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns The card's place in a fresh deck, 0 to 51.
 *
 * @example
 * ```ts
 * import { cardIndex } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(cardIndex(card));
 * ```
 */
export function cardIndex(card: Card): number {
  return SUITS.indexOf(card.suit) * RANKS.length + (card.rank - 1);
}

/** The card at a place in a fresh deck, 0 to 51. Throws for a place that is not one.
 *
 * @param index - The zero-based deck or seat position.
 * @returns The card at a place in a fresh deck, 0 to 51. Throws for a place that is not one.
 *
 * @example
 * ```ts
 * import { cardAt } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(cardAt(0));
 * ```
 */
export function cardAt(index: number): Card {
  if (!Number.isInteger(index) || index < 0 || index >= DECK_SIZE) throw new Error(`no card at ${index}`);
  return { suit: SUITS[Math.floor(index / RANKS.length)], rank: RANKS[index % RANKS.length] };
}

/** One character for a card (`CARD_ALPHABET`).
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns One character for a card (`CARD_ALPHABET`).
 *
 * @example
 * ```ts
 * import { cardCode } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(cardCode(card));
 * ```
 */
export function cardCode(card: Card): CardCode {
  return CARD_ALPHABET[cardIndex(card)];
}

/** The card a character names, or null for one that names none — a kept string is read, never trusted.
 *
 * @param code - The encoded card or game state.
 * @returns The card a character names, or null for one that names none — a kept string is read, never trusted.
 *
 * @example
 * ```ts
 * import { cardCode, cardFromCode } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(cardFromCode(cardCode(card)));
 * ```
 */
export function cardFromCode(code: string): Card | null {
  const index = code.length === 1 ? CARD_ALPHABET.indexOf(code) : -1;
  return index < 0 ? null : cardAt(index);
}

/** The rank letters of a two-character id: `T` for the ten, so every id is two long. */
const ID_RANKS = "A23456789TJQK";
/** The suit letters of a two-character id, in `SUITS` order. */
const ID_SUITS = "SHDC";

/**
 * "QS", "TH", "AC": the two-character id card players write, rank then suit,
 * with `T` for the ten. For a game that keys its state by a readable id; a
 * kept deal is written with `cardCode`, one character a card.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns "QS", "TH", "AC": the two-character id card players write, rank then suit, with `T` for the ten. For a game that keys its state by a readable id; a kept deal is written with `cardCode`, one character a card.
 *
 * @example
 * ```ts
 * import { cardId } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(cardId(card));
 * ```
 */
export function cardId(card: Card): string {
  return `${ID_RANKS[card.rank - 1]}${ID_SUITS[SUITS.indexOf(card.suit)]}`;
}

/** The card a two-character id names, or null. Lower case is read too.
 *
 * @param id - The physical card id to read.
 * @returns The card a two-character id names, or null. Lower case is read too.
 *
 * @example
 * ```ts
 * import { cardFromId } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(cardFromId("AS"));
 * ```
 */
export function cardFromId(id: string): Card | null {
  if (id.length !== 2) return null;
  const rank = ID_RANKS.indexOf(id[0].toUpperCase());
  const suit = ID_SUITS.indexOf(id[1].toUpperCase());
  return rank < 0 || suit < 0 ? null : { suit: SUITS[suit], rank: RANKS[rank] };
}

/** A run of cards as a string, one character each.
 *
 * @param cards - The cards in their current order.
 * @returns A run of cards as a string, one character each.
 *
 * @example
 * ```ts
 * import { freshDeck, writeCards } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(writeCards(freshDeck().slice(0, 5)));
 * ```
 */
export function writeCards(cards: readonly Card[]): string {
  return cards.map(cardCode).join("");
}

/** A string of card characters read back, or null if any character names no card.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns A string of card characters read back, or null if any character names no card.
 *
 * @example
 * ```ts
 * import { readCards } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(readCards("AS KH TD"));
 * ```
 */
export function readCards(text: string): Card[] | null {
  const cards: Card[] = [];
  for (const code of text) {
    const card = cardFromCode(code);
    if (card === null) return null;
    cards.push(card);
  }
  return cards;
}

/** Whether a string is a whole deck: fifty-two cards, each exactly once.
 *
 * @param text - The notation, encoded state or saved text to read.
 * @returns Whether a string is a whole deck: fifty-two cards, each exactly once.
 *
 * @example
 * ```ts
 * import { freshDeck, isWholeDeck, writeCards } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(isWholeDeck(writeCards(freshDeck())));
 * ```
 */
export function isWholeDeck(text: string): boolean {
  const cards = readCards(text);
  return cards !== null && cards.length === DECK_SIZE && new Set(text).size === DECK_SIZE;
}

/** "Q♥": the short name a corner shows.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns "Q♥": the short name a corner shows.
 *
 * @example
 * ```ts
 * import { cardShortName } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(cardShortName(card));
 * ```
 */
export function cardShortName(card: Card): string {
  return `${RANK_DISPLAY[card.rank].short}${SUIT_DISPLAY[card.suit].symbol}`;
}

/** "queen of hearts": the name a screen reader says.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns "queen of hearts": the name a screen reader says.
 *
 * @example
 * ```ts
 * import { cardName } from "@johnmorrisdotca/toranpu/deck";
 *
 * const card = { suit: "spades", rank: 1 } as const;
 * console.log(cardName(card));
 * ```
 */
export function cardName(card: Card): string {
  return `${RANK_DISPLAY[card.rank].name} of ${SUIT_DISPLAY[card.suit].name}`;
}

/**
 * Deal one card at a time round the table, as a dealer does: `hands` hands of
 * `each` cards, dealt from the top (the start of the array), and what is left.
 *
 * @param deck - The deck in its current order; the input is left unchanged.
 * @param hands - The hands by seat, or the number of hands where numeric.
 * @param each - The number of cards dealt to each hand.
 * @returns Deal one card at a time round the table, as a dealer does: `hands` hands of `each` cards, dealt from the top (the start of the array), and what is left.
 *
 * @example
 * ```ts
 * import { dealRound, shuffledDeck } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(dealRound(shuffledDeck(42), 4, 5).hands.map((hand) => hand.length));
 * ```
 */
export function dealRound(deck: readonly Card[], hands: number, each: number): { hands: Card[][]; rest: Card[] } {
  if (hands < 1 || each < 0 || hands * each > deck.length) throw new Error(`cannot deal ${hands} hands of ${each} from ${deck.length}`);
  const dealt: Card[][] = Array.from({ length: hands }, () => []);
  for (let at = 0; at < hands * each; at += 1) dealt[at % hands].push(deck[at]);
  return { hands: dealt, rest: deck.slice(hands * each) };
}

/** Deal the whole deck round the table: the first hands get one more where it does not divide evenly.
 *
 * @param deck - The deck in its current order; the input is left unchanged.
 * @param hands - The hands by seat, or the number of hands where numeric.
 * @returns Deal the whole deck round the table: the first hands get one more where it does not divide evenly.
 *
 * @example
 * ```ts
 * import { dealAll, shuffledDeck } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(dealAll(shuffledDeck(42), 4).map((hand) => hand.length));
 * ```
 */
export function dealAll(deck: readonly Card[], hands: number): Card[][] {
  if (hands < 1) throw new Error("a deal needs a hand");
  const dealt: Card[][] = Array.from({ length: hands }, () => []);
  deck.forEach((card, at) => dealt[at % hands].push(card));
  return dealt;
}

/** Take `count` from the top: what was taken, and what is left.
 *
 * @param deck - The deck in its current order; the input is left unchanged.
 * @param count - The requested number of cards, sounds or layout positions.
 * @returns Take `count` from the top: what was taken, and what is left.
 *
 * @example
 * ```ts
 * import { shuffledDeck, take } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(take(shuffledDeck(42), 5).taken);
 * ```
 */
export function take(deck: readonly Card[], count: number): { taken: Card[]; rest: Card[] } {
  if (count < 0 || count > deck.length) throw new Error(`cannot take ${count} from ${deck.length}`);
  return { taken: deck.slice(0, count), rest: deck.slice(count) };
}

/** A hand sorted by suit (the fresh-deck order) and then by rank: how a player arranges one.
 *
 * @param cards - The cards in their current order.
 * @param rankOrder - A function that gives each rank its sorting value.
 * @param suitOrder - The suit order for sorting a hand.
 * @returns A hand sorted by suit (the fresh-deck order) and then by rank: how a player arranges one.
 *
 * @example
 * ```ts
 * import { shuffledDeck, sortedHand } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(sortedHand(shuffledDeck(42).slice(0, 7)));
 * ```
 */
export function sortedHand(cards: readonly Card[], rankOrder: (rank: Rank) => number = (rank) => rank, suitOrder: readonly Suit[] = SUITS): Card[] {
  return [...cards].sort((a, b) => suitOrder.indexOf(a.suit) - suitOrder.indexOf(b.suit) || rankOrder(a.rank) - rankOrder(b.rank));
}
