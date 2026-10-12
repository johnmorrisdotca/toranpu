import type { SpiderMove, SpiderTable } from "./spider.types.ts";
import { allShowing, canDeal, movesFrom, playSpider, runLength, spiderWon } from "./rules.ts";
import { solveSpider } from "./solve.ts";

/**
 * WHAT A PERSON MEANT, read against Spider's rules, as Solitaire's
 * `intent.ts` reads Klondike's: the card they took hold of or tapped, and the
 * column they let it go on or tapped next, as a move — or nothing.
 *
 * A spot's pile is a column's number as a string (`"0"`–`"9"`), the stock
 * `"s"`, or a made run's place `"f"`.
 */

/** A place a tap lands on the table: the pile, and which card in it from the bottom.
 *
 * @example
 * ```ts
 * import type { SpiderSpot } from "@johnmorrisdotca/toranpu/spider";
 *
 * const value: SpiderSpot = { pile: "1", index: 0 };
 * console.log(value.pile);
 * ```
 */
export type SpiderSpot = { pile: string; index: number };

/** The column a pile names, or null for the stock and the made runs.
 *
 * @param pile - The pile to inspect or arrange.
 * @returns The column a pile names, or null for the stock and the made runs.
 *
 * @example
 * ```ts
 * import { spiderColumnOf } from "@johnmorrisdotca/toranpu/spider";
 *
 * console.log(spiderColumnOf("0"));
 * ```
 */
export function spiderColumnOf(pile: string): number | null {
  return /^[0-9]$/.test(pile) ? Number(pile) : null;
}

/** The cards a person can take hold of from a spot: a face-up card with the run of its own suit, in order, on top of it.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @param spot - The source or destination card location.
 * @returns The cards a person can take hold of from a spot: a face-up card with the run of its own suit, in order, on top of it.
 *
 * @example
 * ```ts
 * import { dealSpider, spiderDealOfSeed, spiderDeckOf, spiderLiftable } from "@johnmorrisdotca/toranpu/spider";
 *
 * const table = dealSpider(spiderDeckOf(spiderDealOfSeed(42, 1), 1)!);
 * console.log(spiderLiftable(table, { pile: "0", index: table.tableau[0]!.cards.length - 1 }));
 * ```
 */
export function spiderLiftable(table: SpiderTable, spot: SpiderSpot): readonly number[] {
  const column = spiderColumnOf(spot.pile);
  if (column === null) return [];
  const { cards } = table.tableau[column];
  if (spot.index < 0 || spot.index >= cards.length) return [];
  return cards.length - spot.index <= runLength(table.tableau[column]) ? cards.slice(spot.index) : [];
}

/** The move that carries the cards held at `from` onto the column `to`, if the rules allow exactly those cards there.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @param from - The source position or source state specified by this API.
 * @param to - The destination position or state specified by this API.
 * @returns The legal run carry, or null when the selected run cannot move onto that column.
 *
 * @example
 * ```ts
 * import { dealSpider, spiderDealOfSeed, spiderDeckOf, spiderMoveFor } from "@johnmorrisdotca/toranpu/spider";
 *
 * const table = dealSpider(spiderDeckOf(spiderDealOfSeed(42, 1), 1)!);
 * console.log(spiderMoveFor(table, { pile: "0", index: table.tableau[0]!.cards.length - 1 }, "1"));
 * ```
 */
export function spiderMoveFor(table: SpiderTable, from: SpiderSpot, to: string): SpiderMove | null {
  const source = spiderColumnOf(from.pile);
  const target = spiderColumnOf(to);
  const held = spiderLiftable(table, from);
  if (source === null || target === null || source === target || held.length === 0) return null;
  const move: SpiderMove = { kind: "carry", from: source, to: target, count: held.length };
  return playSpider(table, move) === null ? null : move;
}

/**
 * What a double tap does in Spider, where no card goes home by itself: the run
 * carried to the best column that takes it — one whose top is its own suit,
 * else any card one higher, else an empty column.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @param spot - The source or destination card location.
 * @returns A legal carry to the preferred receiving column, or null when no receiving column is available.
 *
 * @example
 * ```ts
 * import { dealSpider, spiderBestMove, spiderDealOfSeed, spiderDeckOf } from "@johnmorrisdotca/toranpu/spider";
 *
 * const table = dealSpider(spiderDeckOf(spiderDealOfSeed(42, 1), 1)!);
 * console.log(spiderBestMove(table, { pile: "0", index: table.tableau[0]!.cards.length - 1 }));
 * ```
 */
export function spiderBestMove(table: SpiderTable, spot: SpiderSpot): SpiderMove | null {
  const held = spiderLiftable(table, spot);
  if (held.length === 0) return null;
  const foot = held[0];
  const fits = table.tableau
    .map((column, to) => ({ to, top: column.cards.at(-1) }))
    .filter(({ to }) => spiderMoveFor(table, spot, String(to)) !== null);
  const best =
    fits.find(({ top }) => top !== undefined && Math.floor(top / 13) === Math.floor(foot / 13)) ?? fits.find(({ top }) => top !== undefined) ?? fits[0];
  return best === undefined ? null : spiderMoveFor(table, spot, String(best.to));
}

/** What a press on the stock does: deal, or nothing while a column is empty or the stock is spent.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @returns The next deal move, or null when a column is empty or the stock is spent.
 *
 * @example
 * ```ts
 * import { dealSpider, spiderDealMove, spiderDealOfSeed, spiderDeckOf } from "@johnmorrisdotca/toranpu/spider";
 *
 * const table = dealSpider(spiderDeckOf(spiderDealOfSeed(42, 1), 1)!);
 * console.log(spiderDealMove(table));
 * ```
 */
export function spiderDealMove(table: SpiderTable): SpiderMove | null {
  return canDeal(table) ? { kind: "deal" } : null;
}

/**
 * THE GAME PLAYS ITSELF OUT once every card is dealt and face up: the moves
 * that make the runs left, found by the solver on a small budget, or null
 * while a card is hidden or no way is found — then the player goes on.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @returns THE GAME PLAYS ITSELF OUT once every card is dealt and face up: the moves that make the runs left, found by the solver on a small budget, or null while a card is hidden or no way is found — then the player goes on.
 *
 * @example
 * ```ts
 * import { dealSpider, spiderDealOfSeed, spiderDeckOf, spiderFinishingMoves } from "@johnmorrisdotca/toranpu/spider";
 *
 * const table = dealSpider(spiderDeckOf(spiderDealOfSeed(42, 1), 1)!);
 * console.log(spiderFinishingMoves(table));
 * ```
 */
export function spiderFinishingMoves(table: SpiderTable): SpiderMove[] | null {
  if (!allShowing(table) || spiderWon(table)) return null;
  return solveSpider(table, 2000).moves;
}

/** Whether nothing can be done but give up: no card can move and the stock cannot deal.
 *
 * @param table - The native solitaire table; move helpers leave the input unchanged.
 * @returns Whether nothing can be done but give up: no card can move and the stock cannot deal.
 *
 * @example
 * ```ts
 * import { dealSpider, spiderDealOfSeed, spiderDeckOf, spiderStuck } from "@johnmorrisdotca/toranpu/spider";
 *
 * const table = dealSpider(spiderDeckOf(spiderDealOfSeed(42, 1), 1)!);
 * console.log(spiderStuck(table));
 * ```
 */
export function spiderStuck(table: SpiderTable): boolean {
  return !spiderWon(table) && movesFrom(table).length === 0;
}
