import { deckOf } from "../klondike/code.ts";

import type { FreeCellMove, FreeCellPile, FreeCellTable } from "./freecell.types.ts";
import { dealFreeCell, FREECELL_PILES, isColumnPile, playFreeCell } from "./rules.ts";

/**
 * A FREECELL GAME WRITTEN DOWN: the deal and the moves, as Solitaire's are
 * (`solitaire/code.ts`). The deal is the deck in the order it was dealt, one
 * letter a card, fifty-two letters. A move is the pile it leaves and the pile
 * it lands on, and a carry from a column to a column says how many cards it
 * takes as a third character, `1`–`9` then `a`–`d` for ten to thirteen
 * (base 36), since into an empty column any number up to the most would do.
 */

export { dealOfSeed, deckOf } from "../klondike/code.ts";

/** One move written as text: one or two letters.
 *
 * @param move - The native move to validate or apply.
 * @returns One move written as text: one or two letters.
 *
 * @example
 * ```ts
 * import { encodeMove } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(encodeMove({ from: "1", to: "a", count: 1 }));
 * ```
 */
export function encodeMove(move: FreeCellMove): string {
  if (isColumnPile(move.from) && isColumnPile(move.to)) return `${move.from}${move.to}${move.count.toString(36)}`;
  return `${move.from}${move.to}`;
}

/** A list of moves written as text, one after another with nothing between.
 *
 * @param moves - The ordered native moves to replay.
 * @returns A list of moves written as text, one after another with nothing between.
 *
 * @example
 * ```ts
 * import { encodeMoves } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(encodeMoves([{ from: "1", to: "a", count: 1 }]));
 * ```
 */
export function encodeMoves(moves: readonly FreeCellMove[]): string {
  return moves.map(encodeMove).join("");
}

/** A move list read back, or null for one with a character that is no move.
 *
 * @param code - The encoded card or game state.
 * @returns A move list read back, or null for one with a character that is no move.
 *
 * @example
 * ```ts
 * import { decodeMoves, encodeMoves } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(decodeMoves(encodeMoves([{ from: "1", to: "a", count: 1 }])));
 * ```
 */
export function decodeMoves(code: string): FreeCellMove[] | null {
  const moves: FreeCellMove[] = [];
  for (let at = 0; at < code.length; ) {
    const from = code[at];
    const to = code[at + 1];
    if (!FREECELL_PILES.has(from) || to === undefined || !FREECELL_PILES.has(to)) return null;
    if (isColumnPile(from as FreeCellPile) && isColumnPile(to as FreeCellPile)) {
      const count = parseInt(code[at + 2] ?? "", 36);
      if (!(count >= 1 && count <= 13)) return null;
      moves.push({ from: from as FreeCellPile, to: to as FreeCellPile, count });
      at += 3;
    } else {
      moves.push({ from: from as FreeCellPile, to: to as FreeCellPile, count: 1 });
      at += 2;
    }
  }
  return moves;
}

/**
 * A game played out from its deal: every table it passed through, the first
 * the deal, or null where the deal is not a deck or a move is one the rules
 * refuse. The one reader of a move list, for the table, a kept run, the check
 * and a finished game's page alike.
 *
 * @param deal - The deal number or dealing specification.
 * @param cells - The number of available free cells.
 * @param moves - The ordered native moves to replay.
 * @returns A game played out from its deal: every table it passed through, the first the deal, or null where the deal is not a deck or a move is one the rules refuse. The one reader of a move list, for the table, a kept run, the check and a finished game's page alike.
 *
 * @example
 * ```ts
 * import { dealFreeCell, dealOfSeed, deckOf, encodeMoves, movesFrom, replayFreeCell } from "@johnmorrisdotca/toranpu/freecell";
 *
 * const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
 * console.log(replayFreeCell(dealOfSeed(42), 4, encodeMoves(movesFrom(table).slice(0, 1)))?.length);
 * ```
 */
export function replayFreeCell(deal: string, cells: number, moves: string): FreeCellTable[] | null {
  const deck = deckOf(deal);
  const list = decodeMoves(moves);
  if (deck === null || list === null) return null;
  const tables = [dealFreeCell(deck, cells)];
  for (const move of list) {
    const next = playFreeCell(tables[tables.length - 1], move);
    if (next === null) return null;
    tables.push(next);
  }
  return tables;
}
