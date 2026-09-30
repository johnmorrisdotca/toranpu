import type { Rank, RankDisplay, Suit, SuitDisplay } from "./cards.types.ts";

/**
 * The suits in the order a fresh deck is sorted and a foundation row is laid
 * out: spades, hearts, diamonds, clubs — black, red, red, black, so no two
 * neighbours on a row of four look alike.
 */
export const SUITS: readonly Suit[] = ["spades", "hearts", "diamonds", "clubs"];

/** The ranks in order, ace low: 1 (the ace) to 13 (the king). */
export const RANKS: readonly Rank[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

/** How many cards a deck holds: fifty-two. */
export const DECK_SIZE = SUITS.length * RANKS.length;

/** How each suit is written and drawn: its symbol, its name and its colour. */
export const SUIT_DISPLAY: Record<Suit, SuitDisplay> = {
  spades: { symbol: "♠", name: "spades", colour: "black" },
  hearts: { symbol: "♥", name: "hearts", colour: "red" },
  diamonds: { symbol: "♦", name: "diamonds", colour: "red" },
  clubs: { symbol: "♣", name: "clubs", colour: "black" },
};

/** How each rank is written: short (`A`, `10`, `K`) and as a word (`ace`, `ten`, `king`). */
export const RANK_DISPLAY: Record<Rank, RankDisplay> = {
  1: { short: "A", name: "ace" },
  2: { short: "2", name: "two" },
  3: { short: "3", name: "three" },
  4: { short: "4", name: "four" },
  5: { short: "5", name: "five" },
  6: { short: "6", name: "six" },
  7: { short: "7", name: "seven" },
  8: { short: "8", name: "eight" },
  9: { short: "9", name: "nine" },
  10: { short: "10", name: "ten" },
  11: { short: "J", name: "jack" },
  12: { short: "Q", name: "queen" },
  13: { short: "K", name: "king" },
};

/**
 * The fifty-two characters a card is written as, in deck order: spades A–K are
 * `A`–`M`, hearts `N`–`Z`, diamonds `a`–`m`, clubs `n`–`z`. Letters only, so a
 * deal is safe in an address, a JSON body and a file name alike.
 */
export const CARD_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
