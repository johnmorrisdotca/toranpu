import type { CardId } from "../card-games.types.ts";

import { STACK_UP_WILD, stackUpFits, stackUpMoves, stackUpValue, stackUpWants } from "./stack-up.ts";
import type { StackUpGame, StackUpMove } from "./stack-up.types.ts";

/**
 * A COMPUTER AT THE STACK UP TABLE. It plays what empties its stock first, then what helps the stock card come out, then
 * the cards that are free to play, keeping wilds for when they are needed; and it ends a turn by putting a card where
 * it does the least harm: on a pile whose top is one higher, so the piles run downwards, or on an empty one. It looks at
 * its own cards and the piles on the table, and nothing hidden.
 */

/** How much a play is worth to the seat making it: the stock card above all, then the cards that lead to it, and a wild only when nothing else will do. */
function worth(game: StackUpGame, seat: number, move: Extract<StackUpMove, { play: CardId }>): number {
  const stock = game.stocks[seat]!;
  const top = stock[stock.length - 1];
  if (move.from === "stock") return 1000;
  const pile = game.building[move.to]!;
  let score = move.from === "discard" ? 60 : 40;
  if (move.play === STACK_UP_WILD) score -= 30;
  if (top !== undefined && top !== STACK_UP_WILD) {
    const reach = stackUpValue(top);
    // Laid on the pile the stock card is waiting for: it brings the stock card a step closer.
    if (stackUpWants(pile) < reach && stackUpWants(pile) + 1 <= reach) score += 200 - 5 * (reach - stackUpWants(pile));
    if (stackUpWants(pile) === reach - 1 && move.play !== STACK_UP_WILD) score += 100;
  }
  if (move.from === "hand" && game.hands[seat]!.length === 1) score += 30;
  return score;
}

/** Where a card goes when the turn ends: the pile whose top is the smallest number above it, else an empty pile, else the shortest. */
function discardTo(game: StackUpGame, seat: number, card: CardId): number {
  const piles = game.discards[seat]!;
  const value = stackUpValue(card);
  let best = 0;
  let bestScore = Number.NEGATIVE_INFINITY;
  piles.forEach((pile, to) => {
    const top = pile[pile.length - 1];
    let score: number;
    if (top === undefined) score = 50;
    else if (stackUpValue(top) === value) score = 90;
    else if (stackUpValue(top) > value) score = 80 - (stackUpValue(top) - value);
    else score = 10 - pile.length - (value - stackUpValue(top));
    if (score > bestScore) {
      bestScore = score;
      best = to;
    }
  });
  return best;
}

/** What a card is worth keeping in the hand: wilds most, then the numbers a building pile wants soonest. */
function keeping(game: StackUpGame, card: CardId): number {
  if (card === STACK_UP_WILD) return 100;
  const value = stackUpValue(card);
  const nearest = Math.min(
    ...game.building.map((pile) => (value >= stackUpWants(pile) ? value - stackUpWants(pile) : 20)),
  );
  return 50 - nearest;
}

/** The move a computer makes: the best play it has, or else the card it would miss least, put where it does least harm.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The move a computer makes.
 *
 * @example
 * ```ts
 * import { stackUpComputer, startStackUp } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(stackUpComputer(startStackUp(15, ["Aki", "Ben"], undefined, 42)!));
 * ```
 */
export function stackUpComputer(game: StackUpGame): StackUpMove {
  const seat = game.toPlay ?? 0;
  const moves = stackUpMoves(game);
  let best: StackUpMove | null = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  for (const move of moves) {
    if (!("play" in move)) continue;
    // A pile that nothing here fits was never offered; a wild is not spent on a card the hand could play anyway.
    const score = worth(game, seat, move);
    if (score > bestScore) {
      bestScore = score;
      best = move;
    }
  }
  if (best !== null && (bestScore > 0 || game.hands[seat]!.length > 1)) return best;
  const hand = game.hands[seat]!;
  if (hand.length === 0) return { pass: true };
  const card = [...hand].sort((a, b) => keeping(game, a) - keeping(game, b))[0]!;
  void stackUpFits;
  return { discard: card, to: discardTo(game, seat, card) };
}
