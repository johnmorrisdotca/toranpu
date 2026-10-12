import { cardAt, cardIndex, isWholeDeck, readCards, shuffledDeck, writeCards } from "../../cards/deck.ts";

import { dealKlondike, playKlondike } from "./klondike.ts";
import type { KlondikeMove, KlondikePile, KlondikeRules, KlondikeTable } from "./klondike.types.ts";

/**
 * A SOLITAIRE GAME WRITTEN DOWN: the deal and the moves, each a short string.
 *
 * The deal is the deck in the order it was dealt, one letter a card
 * (`writeCards`), fifty-two letters: a puzzle's givens. The moves are what a
 * kept run, a finished game and its check all read: `d` turns the stock, `r`
 * turns the waste back over, and any other move is two characters, the pile
 * it leaves and the pile it lands on (`KlondikePile`). So a hundred-move game
 * is a couple of hundred characters, and its check is a replay, one move at a
 * time, with no search.
 */

/** The letter a draw from the stock is written as, in a move list.
 *
 * @example
 * ```ts
 * import { DRAW_CODE } from "@johnmorrisdotca/toranpu/klondike";
 * console.log(DRAW_CODE);
 * ```
 */
export const DRAW_CODE = "d";
/** The letter turning the waste back over is written as, in a move list.
 *
 * @example
 * ```ts
 * import { RECYCLE_CODE } from "@johnmorrisdotca/toranpu/klondike";
 * console.log(RECYCLE_CODE);
 * ```
 */
export const RECYCLE_CODE = "r";
const PILES = new Set<string>(["s", "w", "S", "H", "D", "C", "1", "2", "3", "4", "5", "6", "7"]);

/** One move written as text: one or two letters.
 *
 * @param move - The native move to validate or apply.
 * @returns One move written as text: one or two letters.
 *
 * @example
 * ```ts
 * import { encodeMove } from "@johnmorrisdotca/toranpu/klondike";
 *
 * console.log(encodeMove({ kind: "draw" }));
 * ```
 */
export function encodeMove(move: KlondikeMove): string {
  if (move.kind === "draw") return DRAW_CODE;
  if (move.kind === "recycle") return RECYCLE_CODE;
  return `${move.from}${move.to}`;
}

/** A list of moves written as text, one after another with nothing between.
 *
 * @param moves - The ordered native moves to replay.
 * @returns A list of moves written as text, one after another with nothing between.
 *
 * @example
 * ```ts
 * import { encodeMoves } from "@johnmorrisdotca/toranpu/klondike";
 *
 * console.log(encodeMoves([{ kind: "draw" }]));
 * ```
 */
export function encodeMoves(moves: readonly KlondikeMove[]): string {
  return moves.map(encodeMove).join("");
}

/** A move list read back, or null for one with a character that is no move.
 *
 * @param code - The encoded card or game state.
 * @returns A move list read back, or null for one with a character that is no move.
 *
 * @example
 * ```ts
 * import { decodeMoves, encodeMoves } from "@johnmorrisdotca/toranpu/klondike";
 *
 * console.log(decodeMoves(encodeMoves([{ kind: "draw" }])));
 * ```
 */
export function decodeMoves(code: string): KlondikeMove[] | null {
  const moves: KlondikeMove[] = [];
  for (let at = 0; at < code.length; ) {
    const char = code[at];
    if (char === DRAW_CODE || char === RECYCLE_CODE) {
      moves.push({ kind: char === DRAW_CODE ? "draw" : "recycle" });
      at += 1;
      continue;
    }
    const to = code[at + 1];
    if (!PILES.has(char) || to === undefined || !PILES.has(to)) return null;
    moves.push({ kind: "carry", from: char as KlondikePile, to: to as KlondikePile });
    at += 2;
  }
  return moves;
}

/** The deck a deal string names, as card numbers, or null for one that is not a whole deck.
 *
 * @param deal - The deal number or dealing specification.
 * @returns The deck a deal string names, as card numbers, or null for one that is not a whole deck.
 *
 * @example
 * ```ts
 * import { dealOfSeed, deckOf } from "@johnmorrisdotca/toranpu/klondike";
 *
 * console.log(deckOf(dealOfSeed(42))?.slice(0, 7));
 * ```
 */
export function deckOf(deal: string): number[] | null {
  if (!isWholeDeck(deal)) return null;
  return readCards(deal)!.map(cardIndex);
}

/** The deal of a seed: the site's one shuffle (`shuffledDeck`), written down.
 *
 * @param seed - The numeric seed that reproduces the same shuffle or deal.
 * @returns The deal of a seed: the site's one shuffle (`shuffledDeck`), written down.
 *
 * @example
 * ```ts
 * import { dealOfSeed } from "@johnmorrisdotca/toranpu/klondike";
 *
 * console.log(dealOfSeed(42));
 * ```
 */
export function dealOfSeed(seed: number): string {
  return writeCards(shuffledDeck(seed));
}

/** A deal string from card numbers.
 *
 * @param deck - The deck in its current order; the input is left unchanged.
 * @returns A deal string from card numbers.
 *
 * @example
 * ```ts
 * import { dealOf, dealOfSeed, deckOf } from "@johnmorrisdotca/toranpu/klondike";
 *
 * console.log(dealOf(deckOf(dealOfSeed(42))!));
 * ```
 */
export function dealOf(deck: readonly number[]): string {
  return writeCards(deck.map(cardAt));
}

/**
 * A game played out from its deal: every table it passed through, the first
 * the deal, or null where the deal is not a deck or a move is one the rules
 * refuse. The one reader of a move list, for the table, a kept run, the
 * check and a finished game's page alike.
 *
 * @param deal - The deal number or dealing specification.
 * @param rules - The game-specific rules or solver rules.
 * @param moves - The ordered native moves to replay.
 * @returns A game played out from its deal: every table it passed through, the first the deal, or null where the deal is not a deck or a move is one the rules refuse. The one reader of a move list, for the table, a kept run, the check and a finished game's page alike.
 *
 * @example
 * ```ts
 * import { dealOfSeed, encodeMoves, replay } from "@johnmorrisdotca/toranpu/klondike";
 *
 * console.log(replay(dealOfSeed(42), { draw: 3, passes: 3 }, encodeMoves([{ kind: "draw" }]))?.length);
 * ```
 */
export function replay(deal: string, rules: KlondikeRules, moves: string): KlondikeTable[] | null {
  const deck = deckOf(deal);
  const list = decodeMoves(moves);
  if (deck === null || list === null) return null;
  const tables = [dealKlondike(deck, rules)];
  for (const move of list) {
    const next = playKlondike(tables[tables.length - 1], move);
    if (next === null) return null;
    tables.push(next);
  }
  return tables;
}
