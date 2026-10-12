import type { FreeCellMove, FreeCellPile, FreeCellTable } from "./freecell.types.ts";

/**
 * THE RULES OF FREECELL, pure: every function returns a new table and leaves
 * the one it was given alone, as the engine does and as Klondike's rules do
 * (`solitaire/klondike.ts`), so a game is its deal and its moves.
 *
 * The rules as the site plays them:
 * - The whole deck is dealt face up into eight columns, from the left, one
 *   card to each in turn: the first four columns take seven cards, the rest six.
 * - A column is built down in alternating colours, a red 6 on a black 7, and
 *   any card may go into an empty column.
 * - A free cell holds one card, any card. The classic game has four; the
 *   set-up offers three or two for a harder one.
 * - Each suit's foundation is built up from its Ace. A card at home stays home.
 * - Only the top card of a column moves, but a run in order may go as a whole
 *   where it could have gone a card at a time through the free cells and the
 *   empty columns (`mostCarried`) — the "supermove" every program allows.
 */

/** How many columns the tableau has.
 *
 * @example
 * ```ts
 * import { COLUMNS } from "@johnmorrisdotca/toranpu/freecell";
 * console.log(COLUMNS);
 * ```
 */
export const COLUMNS = 8;
/** How many ranks a suit has, ace to king.
 *
 * @example
 * ```ts
 * import { RANKS_A_SUIT } from "@johnmorrisdotca/toranpu/freecell";
 * console.log(RANKS_A_SUIT);
 * ```
 */
export const RANKS_A_SUIT = 13;
/** The columns, as a move names them.
 *
 * @example
 * ```ts
 * import { COLUMN_PILES } from "@johnmorrisdotca/toranpu/freecell";
 * console.log(COLUMN_PILES);
 * ```
 */
export const COLUMN_PILES = ["1", "2", "3", "4", "5", "6", "7", "8"] as const satisfies readonly FreeCellPile[];
/** The free cells, as a move names them: as many as the game is played with, from the first.
 *
 * @example
 * ```ts
 * import { CELL_PILES } from "@johnmorrisdotca/toranpu/freecell";
 * console.log(CELL_PILES);
 * ```
 */
export const CELL_PILES = ["a", "b", "c", "d"] as const satisfies readonly FreeCellPile[];
/** The foundations' letters, in `SUITS` order (spades, hearts, diamonds, clubs), as a card id writes a suit.
 *
 * @example
 * ```ts
 * import { FOUNDATION_PILES } from "@johnmorrisdotca/toranpu/freecell";
 * console.log(FOUNDATION_PILES);
 * ```
 */
export const FOUNDATION_PILES = ["S", "H", "D", "C"] as const satisfies readonly FreeCellPile[];
/** Every pile's letter, for a move written down to be read back.
 *
 * @example
 * ```ts
 * import { FREECELL_PILES } from "@johnmorrisdotca/toranpu/freecell";
 * console.log(FREECELL_PILES);
 * ```
 */
export const FREECELL_PILES: ReadonlySet<string> = new Set<string>([...COLUMN_PILES, ...CELL_PILES, ...FOUNDATION_PILES]);

/** A card's suit, 0 to 3 in `SUITS` order.
 *
 * @param card - The packed card number from 0 to 51.
 * @returns A card's suit, 0 to 3 in `SUITS` order.
 *
 * @example
 * ```ts
 * import { suitOf } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(suitOf(0));
 * ```
 */
export const suitOf = (card: number): number => Math.floor(card / RANKS_A_SUIT);
/** A card's rank, 1 for an ace to 13 for a king.
 *
 * @param card - The packed card number from 0 to 51.
 * @returns A card's rank, 1 for an ace to 13 for a king.
 *
 * @example
 * ```ts
 * import { rankOf } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(rankOf(0));
 * ```
 */
export const rankOf = (card: number): number => (card % RANKS_A_SUIT) + 1;
/** Hearts and diamonds, the second and third suits.
 *
 * @param card - The packed card number from 0 to 51.
 * @returns Hearts and diamonds, the second and third suits.
 *
 * @example
 * ```ts
 * import { redCard } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(redCard(13));
 * ```
 */
export const redCard = (card: number): boolean => suitOf(card) === 1 || suitOf(card) === 2;

/** Whether a pile a move names is a column.
 *
 * @param pile - The pile to inspect or arrange.
 * @returns Whether a pile a move names is a column.
 *
 * @example
 * ```ts
 * import { isColumnPile } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(isColumnPile("1"));
 * ```
 */
export function isColumnPile(pile: FreeCellPile): boolean {
  return pile >= "1" && pile <= "8";
}
/** Whether a pile a move names is a free cell.
 *
 * @param pile - The pile to inspect or arrange.
 * @returns Whether a pile a move names is a free cell.
 *
 * @example
 * ```ts
 * import { isCellPile } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(isCellPile("a"));
 * ```
 */
export function isCellPile(pile: FreeCellPile): boolean {
  return pile >= "a" && pile <= "d";
}
/** Whether a pile a move names is a suit's foundation.
 *
 * @param pile - The pile to inspect or arrange.
 * @returns Whether a pile a move names is a suit's foundation.
 *
 * @example
 * ```ts
 * import { isFoundationPile } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(isFoundationPile("S"));
 * ```
 */
export function isFoundationPile(pile: FreeCellPile): boolean {
  return (FOUNDATION_PILES as readonly string[]).includes(pile);
}
/** Which column, from 0, a pile a move names is.
 *
 * @param pile - The pile to inspect or arrange.
 * @returns Which column, from 0, a pile a move names is.
 *
 * @example
 * ```ts
 * import { columnAt } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(columnAt("1"));
 * ```
 */
export function columnAt(pile: FreeCellPile): number {
  return Number(pile) - 1;
}
/** Which free cell, from 0, a pile a move names is.
 *
 * @param pile - The pile to inspect or arrange.
 * @returns Which free cell, from 0, a pile a move names is.
 *
 * @example
 * ```ts
 * import { cellAt } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(cellAt("a"));
 * ```
 */
export function cellAt(pile: FreeCellPile): number {
  return pile.charCodeAt(0) - "a".charCodeAt(0);
}
/** Which foundation, from 0 in `SUITS` order, a pile a move names is.
 *
 * @param pile - The pile to inspect or arrange.
 * @returns Which foundation, from 0 in `SUITS` order, a pile a move names is.
 *
 * @example
 * ```ts
 * import { foundationAt } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(foundationAt("S"));
 * ```
 */
export function foundationAt(pile: FreeCellPile): number {
  return (FOUNDATION_PILES as readonly string[]).indexOf(pile);
}
/** The foundation a card goes to.
 *
 * @param card - The packed card number from 0 to 51.
 * @returns The foundation a card goes to.
 *
 * @example
 * ```ts
 * import { foundationPileOf } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(foundationPileOf(0));
 * ```
 */
export function foundationPileOf(card: number): FreeCellPile {
  return FOUNDATION_PILES[suitOf(card)];
}

/** Deal a deck (card numbers, the first dealt first) into a table with so many free cells: one card to each column in turn.
 *
 * @param deck - The deck in its current order; the input is left unchanged.
 * @param cells - The number of available free cells.
 * @returns Deal a deck (card numbers, the first dealt first) into a table with so many free cells: one card to each column in turn.
 *
 * @example
 * ```ts
 * import { dealFreeCell, dealOfSeed, deckOf } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(dealFreeCell(deckOf(dealOfSeed(42))!, 4).tableau.map((column) => column.length));
 * ```
 */
export function dealFreeCell(deck: readonly number[], cells: number): FreeCellTable {
  if (deck.length !== 4 * RANKS_A_SUIT) throw new Error("a FreeCell deal needs the whole deck");
  if (cells < 1 || cells > CELL_PILES.length) throw new Error(`a FreeCell table has one to four cells, not ${cells}`);
  const tableau: number[][] = Array.from({ length: COLUMNS }, () => []);
  deck.forEach((card, at) => tableau[at % COLUMNS].push(card));
  return { tableau, cells: Array.from({ length: cells }, () => null), foundation: [0, 0, 0, 0] };
}

/** Whether `upper` may lie on `lower` in a column: one lower, of the other colour.
 *
 * @param lower - The inclusive lower bound.
 * @param upper - The inclusive upper bound.
 * @returns Whether `upper` may lie on `lower` in a column: one lower, of the other colour.
 *
 * @example
 * ```ts
 * import { follows } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(follows(16, 4));
 * ```
 */
export function follows(lower: number, upper: number): boolean {
  return rankOf(lower) === rankOf(upper) + 1 && redCard(lower) !== redCard(upper);
}

/** Whether a card may go onto its suit's foundation now.
 *
 * @param card - The packed card number from 0 to 51.
 * @param foundation - The foundation index or state being checked.
 * @returns Whether a card may go onto its suit's foundation now.
 *
 * @example
 * ```ts
 * import { fitsFoundation } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(fitsFoundation(0, [0, 0, 0, 0]));
 * ```
 */
export function fitsFoundation(card: number, foundation: readonly number[]): boolean {
  return foundation[suitOf(card)] === rankOf(card) - 1;
}

/** How many cards on top of a column are in order, each on the one under it: the most a single carry could ever take.
 *
 * @param column - The column index, or its bottom-to-top cards where an array is accepted.
 * @returns How many cards on top of a column are in order, each on the one under it: the most a single carry could ever take.
 *
 * @example
 * ```ts
 * import { runLength } from "@johnmorrisdotca/toranpu/freecell";
 *
 * console.log(runLength([4, 16]));
 * ```
 */
export function runLength(column: readonly number[]): number {
  if (column.length === 0) return 0;
  let length = 1;
  while (length < column.length && follows(column[column.length - length - 1], column[column.length - length])) length += 1;
  return length;
}

/**
 * The most cards a carry may take, as though moved one at a time: one more
 * than the empty free cells, doubled for every empty column but the one the
 * cards are going to.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @param toEmptyColumn - Whether the destination tableau column is empty.
 * @returns The most cards a carry may take, as though moved one at a time: one more than the empty free cells, doubled for every empty column but the one the cards are going to.
 *
 * @example
 * ```ts
 * import { dealFreeCell, dealOfSeed, deckOf, mostCarried } from "@johnmorrisdotca/toranpu/freecell";
 *
 * const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
 * console.log(mostCarried(table, false));
 * ```
 */
export function mostCarried(table: FreeCellTable, toEmptyColumn: boolean): number {
  const freeCells = table.cells.filter((card) => card === null).length;
  const emptyColumns = table.tableau.filter((column) => column.length === 0).length - (toEmptyColumn ? 1 : 0);
  return (freeCells + 1) * 2 ** Math.max(0, emptyColumns);
}

/** The top card of a pile, or undefined where it holds none (a foundation's top is its suit at its count).
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @param pile - The pile to inspect or arrange.
 * @returns The top card of a pile, or undefined where it holds none (a foundation's top is its suit at its count).
 *
 * @example
 * ```ts
 * import { dealFreeCell, dealOfSeed, deckOf, topOf } from "@johnmorrisdotca/toranpu/freecell";
 *
 * const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
 * console.log(topOf(table, "a"));
 * ```
 */
export function topOf(table: FreeCellTable, pile: FreeCellPile): number | undefined {
  if (isColumnPile(pile)) return table.tableau[columnAt(pile)].at(-1);
  if (isCellPile(pile)) return table.cells[cellAt(pile)] ?? undefined;
  const suit = foundationAt(pile);
  const count = table.foundation[suit];
  return count === 0 ? undefined : suit * RANKS_A_SUIT + count - 1;
}

function replaced<T>(list: readonly T[], index: number, value: T): T[] {
  return list.map((each, at) => (at === index ? value : each));
}

/** The table after a move, or null where the rules refuse it.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @param move - The native move to validate or apply.
 * @returns The table after a move, or null where the rules refuse it.
 *
 * @example
 * ```ts
 * import { dealFreeCell, dealOfSeed, deckOf, movesFrom, playFreeCell } from "@johnmorrisdotca/toranpu/freecell";
 *
 * const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
 * console.log(playFreeCell(table, movesFrom(table)[0]!)?.tableau.map((column) => column.length));
 * ```
 */
export function playFreeCell(table: FreeCellTable, move: FreeCellMove): FreeCellTable | null {
  const { from, to, count } = move;
  if (from === to || !Number.isInteger(count) || count < 1) return null;
  // A card at home stays home, and a free cell the table does not have holds nothing.
  if (isFoundationPile(from)) return null;
  if (isCellPile(from) && cellAt(from) >= table.cells.length) return null;
  if (isCellPile(to) && cellAt(to) >= table.cells.length) return null;
  if (count > 1 && !(isColumnPile(from) && isColumnPile(to))) return null;

  // The cards carried, and the table without them.
  let carried: number[];
  let rest: FreeCellTable;
  if (isCellPile(from)) {
    const card = table.cells[cellAt(from)];
    if (card === null) return null;
    carried = [card];
    rest = { ...table, cells: replaced(table.cells, cellAt(from), null) };
  } else {
    const column = table.tableau[columnAt(from)];
    if (count > runLength(column)) return null;
    carried = column.slice(column.length - count);
    rest = { ...table, tableau: replaced(table.tableau, columnAt(from), column.slice(0, column.length - count)) };
  }

  const foot = carried[0];
  if (isFoundationPile(to)) {
    if (foundationAt(to) !== suitOf(foot) || !fitsFoundation(foot, rest.foundation)) return null;
    return { ...rest, foundation: replaced(rest.foundation, suitOf(foot), rankOf(foot)) };
  }
  if (isCellPile(to)) {
    if (rest.cells[cellAt(to)] !== null) return null;
    return { ...rest, cells: replaced(rest.cells, cellAt(to), foot) };
  }
  const onto = rest.tableau[columnAt(to)];
  const top = onto.at(-1);
  if (top !== undefined && !follows(top, foot)) return null;
  if (count > mostCarried(table, top === undefined)) return null;
  return { ...rest, tableau: replaced(rest.tableau, columnAt(to), [...onto, ...carried]) };
}

/**
 * How many cards a carry from one column to another takes, where it is not
 * the player's to say: onto a card, the one count whose foot fits it. Into an
 * empty column any count up to the most would do, so none is chosen here.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @param from - The source position or source state specified by this API.
 * @param to - The destination position or state specified by this API.
 * @returns The unique legal carried-card count for a nonempty destination, or null when there is no such count or the destination is empty and the player must choose.
 *
 * @example
 * ```ts
 * import { countOnto, dealFreeCell, dealOfSeed, deckOf } from "@johnmorrisdotca/toranpu/freecell";
 *
 * const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
 * console.log(countOnto(table, "1", "2"));
 * ```
 */
export function countOnto(table: FreeCellTable, from: FreeCellPile, to: FreeCellPile): number | null {
  const column = table.tableau[columnAt(from)];
  const top = table.tableau[columnAt(to)].at(-1);
  if (top === undefined) return null;
  const run = runLength(column);
  for (let count = 1; count <= run; count += 1) {
    if (follows(top, column[column.length - count])) return count <= mostCarried(table, false) ? count : null;
  }
  return null;
}

/** Whether every card is home.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @returns Whether every card is home.
 *
 * @example
 * ```ts
 * import { dealFreeCell, dealOfSeed, deckOf, freeCellWon } from "@johnmorrisdotca/toranpu/freecell";
 *
 * const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
 * console.log(freeCellWon(table));
 * ```
 */
export function freeCellWon(table: FreeCellTable): boolean {
  return table.foundation.every((count) => count === RANKS_A_SUIT);
}

/** Every move the rules allow from a table, one of each (the longest run into an empty column), for a stuck-game check.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @returns Every move the rules allow from a table, one of each (the longest run into an empty column), for a stuck-game check.
 *
 * @example
 * ```ts
 * import { dealFreeCell, dealOfSeed, deckOf, movesFrom } from "@johnmorrisdotca/toranpu/freecell";
 *
 * const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
 * console.log(movesFrom(table).slice(0, 5));
 * ```
 */
export function movesFrom(table: FreeCellTable): FreeCellMove[] {
  const moves: FreeCellMove[] = [];
  const cells = CELL_PILES.slice(0, table.cells.length);
  const tops: FreeCellPile[] = [...COLUMN_PILES, ...cells];
  const tryMove = (move: FreeCellMove) => {
    if (playFreeCell(table, move) !== null) moves.push(move);
  };
  for (const from of tops) {
    const card = topOf(table, from);
    if (card === undefined) continue;
    tryMove({ from, to: foundationPileOf(card), count: 1 });
    for (const to of COLUMN_PILES) {
      if (to === from) continue;
      if (isColumnPile(from)) {
        const count = countOnto(table, from, to) ?? Math.min(runLength(table.tableau[columnAt(from)]), mostCarried(table, true));
        tryMove({ from, to, count });
      } else tryMove({ from, to, count: 1 });
    }
    if (isColumnPile(from)) {
      const free = cells.find((cell) => table.cells[cellAt(cell)] === null);
      if (free !== undefined) tryMove({ from, to: free, count: 1 });
    }
  }
  return moves;
}
