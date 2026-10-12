import { isCardList } from "../card-game-codec.ts";
import type { CardId } from "../card-games.types.ts";
import { without } from "../cards.ts";

import type { ClimbMove, ClimbTrick } from "./climbing.types.ts";

/**
 * THE TRICK MACHINERY BIG TWO AND PRESIDENT SHARE: whose turn it is after a
 * play or a pass, and when a trick is cleared. What may be played, and what
 * beats what, is each game's own (`bigTwoHands.ts`, `president.ts`).
 *
 * A seat is "in" while it holds cards. A pass holds until the trick is
 * cleared: the trick is cleared once every seat still in, apart from whoever
 * played last, has passed — and if whoever played last has just gone out,
 * once every seat still in has. Then the last player leads, or, if they have
 * gone out, the next seat round from them that is still in.
 */

/** The seats still holding cards.
 *
 * @param trick - The cards and seats in the current trick.
 * @returns The seats still holding cards.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { seatsIn } from "@johnmorrisdotca/toranpu/big-two";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.bigTwo.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("bigTwo", { players: names, seed: 42 })!;
 * console.log(seatsIn(game));
 * ```
 */
export function seatsIn(trick: Pick<ClimbTrick, "hands">): number[] {
  return trick.hands.flatMap((hand, seat) => (hand.length > 0 ? [seat] : []));
}

/** The next seat round from `from` (not counting it) that `wanted` accepts, or null when none does.
 *
 * @param from - The source position or source state specified by this API.
 * @param seats - The seat count or seat state supplied by this API.
 * @param wanted - A predicate that says which seat may be selected next.
 * @returns The next seat round from `from` (not counting it) that `wanted` accepts, or null when none does.
 *
 * @example
 * ```ts
 * import { nextRound } from "@johnmorrisdotca/toranpu/big-two";
 *
 * console.log(nextRound(0, 4, (seat) => seat === 2));
 * ```
 */
export function nextRound(from: number, seats: number, wanted: (seat: number) => boolean): number | null {
  for (let step = 1; step <= seats; step += 1) {
    const seat = (from + step) % seats;
    if (wanted(seat)) return seat;
  }
  return null;
}

/**
 * Whose move it is after `from` played or passed: the next seat still in that
 * has not passed, or — when nobody is left to answer — the trick cleared and
 * led by whoever played last, or the next seat after them still in.
 *
 * @param trick - The cards and seats in the current trick.
 * @param from - The source position or source state specified by this API.
 * @returns Whose move it is after `from` played or passed: the next seat still in that has not passed, or — when nobody is left to answer — the trick cleared and led by whoever played last, or the next seat after them still in.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { afterTurn } from "@johnmorrisdotca/toranpu/big-two";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.bigTwo.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("bigTwo", { players: names, seed: 42 })!;
 * console.log(afterTurn(game, game.toPlay!));
 * ```
 */
export function afterTurn<T extends ClimbTrick>(trick: T, from: number): T {
  const seats = trick.hands.length;
  const holding = (seat: number) => trick.hands[seat].length > 0;
  const pile = trick.pile;
  const answering = (seat: number) => holding(seat) && !trick.passed[seat] && seat !== pile?.seat;
  const next = pile === null ? null : nextRound(from, seats, answering);
  if (pile !== null && next !== null) return { ...trick, toPlay: next };
  // Nobody can answer: the trick is over, and the last to play leads, or the next still in after them.
  const leadFrom = pile?.seat ?? from;
  const leader = holding(leadFrom) ? leadFrom : nextRound(leadFrom, seats, holding);
  return { ...trick, pile: null, passed: trick.passed.map(() => false), toPlay: leader };
}

/** The trick after `seat` lays these cards on it: out of their hand, on the table, and seen by all. Null if they do not hold them.
 *
 * @param trick - The cards and seats in the current trick.
 * @param seat - The zero-based player seat.
 * @param cards - The cards in their current order.
 * @returns The trick after `seat` lays these cards on it: out of their hand, on the table, and seen by all. null if they do not hold them.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { laid } from "@johnmorrisdotca/toranpu/big-two";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.bigTwo.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("bigTwo", { players: names, seed: 42 })!;
 * console.log(laid(game, game.toPlay!, [game.hands[game.toPlay!]![0]!])?.pile);
 * ```
 */
export function laid<T extends ClimbTrick>(trick: T, seat: number, cards: readonly CardId[]): T | null {
  const hand = without(trick.hands[seat], cards);
  if (hand === null) return null;
  return {
    ...trick,
    hands: trick.hands.map((held, at) => (at === seat ? hand : held)),
    pile: { seat, cards: [...cards] },
    played: [...trick.played, ...cards],
  };
}

/** The trick after `seat` passes.
 *
 * @param trick - The cards and seats in the current trick.
 * @param seat - The zero-based player seat.
 * @returns The trick after `seat` passes.
 *
 * @example
 * ```ts
 * import { freshTrick, laid, passedOn } from "@johnmorrisdotca/toranpu/big-two";
 *
 * console.log(passedOn(laid(freshTrick([["3D", "5H"], ["4C", "6S"]], 0), 0, ["3D"])!, 1).toPlay);
 * ```
 */
export function passedOn<T extends ClimbTrick>(trick: T, seat: number): T {
  return { ...trick, passed: trick.passed.map((was, at) => was || at === seat) };
}

/** A fresh trick to lead, for a new deal.
 *
 * @param hands - The hands by seat, or the number of hands where numeric.
 * @param leader - The seat that led the trick.
 * @returns A fresh trick to lead, for a new deal.
 *
 * @example
 * ```ts
 * import { freshTrick } from "@johnmorrisdotca/toranpu/big-two";
 *
 * console.log(freshTrick([["3D", "5H"], ["4C", "6S"]], 0));
 * ```
 */
export function freshTrick(hands: CardId[][], leader: number): ClimbTrick {
  return { hands, pile: null, passed: hands.map(() => false), toPlay: leader, played: [] };
}

/** A move read back from storage, checked for shape: cards to play, or a pass.
 *
 * @param value - The unknown value to validate.
 * @returns A move read back from storage, checked for shape: cards to play, or a pass.
 *
 * @example
 * ```ts
 * import { isClimbMove } from "@johnmorrisdotca/toranpu/big-two";
 *
 * console.log(isClimbMove({ play: ["3D"] }));
 * ```
 */
export function isClimbMove(value: unknown): value is ClimbMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  return move.pass === true || isCardList(move.play);
}
