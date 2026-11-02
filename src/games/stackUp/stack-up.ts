import { seededRandom, shuffled } from "../../random.ts";
import { computerSeats } from "../card-game-codec.ts";
import { STACK_UP_SIZES } from "../card-games.constants.ts";
import type { CardId } from "../card-games.types.ts";
import { reshuffled } from "../cards.ts";

import type { StackUpEnd, StackUpGame, StackUpMove } from "./stack-up.types.ts";

/**
 * STACK UP: the rules, and nothing else.
 *
 * Two to six players. The deck is 162 cards: twelve of each number from 1 to 12, and eighteen wilds. Each player is dealt
 * a stock pile (10, 15 or 20 cards, face down but for the top one), and the rest is the draw pile. On your turn you draw
 * up to five cards, then lay cards on the four building piles in the middle: a pile starts at 1 and goes up one at a time
 * to 12, and a wild stands for whatever the pile wants. You may lay a card from your hand, from the top of your stock, or
 * from the top of any of your four discard piles. A pile that reaches 12 is set aside, to be shuffled back into the draw
 * pile later. If you play your last hand card you draw five more at once. Your turn ends when you put one card from your
 * hand on one of your own discard piles. The first player to play the last card of their stock wins. If no card can be
 * drawn and nobody has played for a whole round, the game ends and the fewest stock cards left wins; level, they share it.
 *
 * Pure: every function returns a new game and leaves the one given alone.
 */

/** How many cards a hand is drawn up to.
 *
 * @example
 * ```ts
 * import { STACK_UP_HAND } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(STACK_UP_HAND);
 * ```
 */
export const STACK_UP_HAND = 5;

/** The highest number on a card, and the length a building pile is finished at.
 *
 * @example
 * ```ts
 * import { STACK_UP_TOP } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(STACK_UP_TOP);
 * ```
 */
export const STACK_UP_TOP = 12;

/** The wild card's name.
 *
 * @example
 * ```ts
 * import { STACK_UP_WILD } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(STACK_UP_WILD);
 * ```
 */
export const STACK_UP_WILD = "nw";

/** The four building piles in the middle, and the four discard piles each player has.
 *
 * @example
 * ```ts
 * import { STACK_UP_PILES } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(STACK_UP_PILES);
 * ```
 */
export const STACK_UP_PILES = 4;

/** The whole deck of 162 cards, in a fixed order: 1 to 12 twelve times over, then the wilds.
 *
 * @example
 * ```ts
 * import { STACK_UP_DECK } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(STACK_UP_DECK.length);
 * ```
 */
export const STACK_UP_DECK: readonly CardId[] = [
  ...Array.from({ length: 12 }, () =>
    Array.from({ length: STACK_UP_TOP }, (_, at) => `n${String(at + 1).padStart(2, "0")}`),
  ).flat(),
  ...Array.from({ length: 18 }, () => STACK_UP_WILD),
];

/** The sizes of a stock pile a table is offered.
 *
 * @example
 * ```ts
 * import { STACK_UP_STOCKS } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(STACK_UP_STOCKS);
 * ```
 */
export const STACK_UP_STOCKS = STACK_UP_SIZES;

/** What a card counts for: its number 1 to 12, or 0 for a wild, which is whatever a pile wants.
 *
 * @param card - The card id to read.
 * @returns What a card counts for: its number 1 to 12, or 0 for a wild.
 *
 * @example
 * ```ts
 * import { stackUpValue } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(stackUpValue("n07"));
 * ```
 */
export function stackUpValue(card: CardId): number {
  return card === STACK_UP_WILD ? 0 : Number.parseInt(card.slice(1), 10);
}

/** What number a building pile wants next: one more than the cards on it.
 *
 * @param pile - The cards on the building pile.
 * @returns What number a building pile wants next: one more than the cards on it.
 *
 * @example
 * ```ts
 * import { stackUpWants } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(stackUpWants(["n01", "nw"]));
 * ```
 */
export function stackUpWants(pile: readonly CardId[]): number {
  return pile.length + 1;
}

/** Whether a card may go on a building pile: a wild always, a number when it is the one the pile wants.
 *
 * @param card - The card id to lay.
 * @param pile - The cards on the building pile.
 * @returns Whether a card may go on a building pile.
 *
 * @example
 * ```ts
 * import { stackUpFits } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(stackUpFits("n01", []));
 * ```
 */
export function stackUpFits(card: CardId, pile: readonly CardId[]): boolean {
  return card === STACK_UP_WILD || stackUpValue(card) === stackUpWants(pile);
}

/** A new game of Stack Up for two to six players with a stock pile of this size, dealt from the seed, or null for a table it is not offered for.
 *
 * @param size - The cards in each player's stock pile: 10, 15 or 20.
 * @param players - The player names in seat order.
 * @param _language - An unused legacy language argument retained for compatibility.
 * @param dealt - The numeric seed used to deal the game.
 * @param computers - Flags by seat: true where a computer controls that seat.
 * @returns A new game of Stack Up, or null.
 *
 * @example
 * ```ts
 * import { startStackUp } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(startStackUp(15, ["Aki", "Ben"], undefined, 42)?.hands[0]?.length);
 * ```
 */
export function startStackUp(
  size: number,
  players: readonly string[],
  _language?: unknown,
  dealt?: number,
  computers?: readonly boolean[],
): StackUpGame | null {
  if (!(STACK_UP_STOCKS as readonly number[]).includes(size)) return null;
  if (players.length < 2 || players.length > 6) return null;
  const seed = dealt ?? 1;
  const deck = shuffled(STACK_UP_DECK, seededRandom(seed));
  const stocks = players.map((_, seat) => deck.slice(seat * size, (seat + 1) * size));
  const game: StackUpGame = {
    size,
    players: [...players],
    computers: computerSeats(players.length, computers),
    seed,
    moves: [],
    phase: "playing",
    toPlay: 0,
    stocks,
    hands: players.map(() => []),
    discards: players.map(() => Array.from({ length: STACK_UP_PILES }, () => [])),
    building: Array.from({ length: STACK_UP_PILES }, () => []),
    draw: deck.slice(players.length * size),
    done: [],
    reshuffles: 0,
    played: false,
    idle: 0,
    ended: null,
  };
  return drawUp(game, 0);
}

/** The game with this seat drawn up to a full hand, shuffling the finished piles back in when the draw pile runs out. */
function drawUp(game: StackUpGame, seat: number): StackUpGame {
  const hand = [...game.hands[seat]!];
  let draw = [...game.draw];
  let done = game.done;
  let reshuffles = game.reshuffles;
  while (hand.length < STACK_UP_HAND) {
    if (draw.length === 0 && done.length > 0) {
      draw = reshuffled(done, game.seed, 100 + reshuffles);
      reshuffles += 1;
      done = [];
    }
    const next = draw.pop();
    if (next === undefined) break;
    hand.push(next);
  }
  return { ...game, hands: game.hands.map((was, at) => (at === seat ? hand : was)), draw, done, reshuffles };
}

/** The distinct cards of a hand, in the order they first appear. */
function distinct(cards: readonly CardId[]): CardId[] {
  return [...new Set(cards)];
}

/** Every move the seat to play may make: each card that fits a building pile, from the hand, the stock or a discard pile; each card of the hand on each discard pile; and a pass when the hand is empty.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns Every move the seat to play may make.
 *
 * @example
 * ```ts
 * import { stackUpMoves, startStackUp } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(stackUpMoves(startStackUp(15, ["Aki", "Ben"], undefined, 42)!).length);
 * ```
 */
export function stackUpMoves(game: StackUpGame): StackUpMove[] {
  if (game.phase === "over" || game.toPlay === null) return [];
  const seat = game.toPlay;
  const hand = game.hands[seat]!;
  const stock = game.stocks[seat]!;
  const moves: StackUpMove[] = [];
  game.building.forEach((pile, to) => {
    for (const card of distinct(hand)) if (stackUpFits(card, pile)) moves.push({ play: card, from: "hand", to });
    const top = stock[stock.length - 1];
    if (top !== undefined && stackUpFits(top, pile)) moves.push({ play: top, from: "stock", to });
    game.discards[seat]!.forEach((discard, at) => {
      const card = discard[discard.length - 1];
      if (card !== undefined && stackUpFits(card, pile)) moves.push({ play: card, from: "discard", pile: at, to });
    });
  });
  for (const card of distinct(hand)) for (let to = 0; to < STACK_UP_PILES; to += 1) moves.push({ discard: card, to });
  if (hand.length === 0) moves.push({ pass: true });
  return moves;
}

/** Whether something is a move Stack Up has, by its shape.
 *
 * @param value - The unknown value to validate.
 * @returns Whether something is a move Stack Up has.
 *
 * @example
 * ```ts
 * import { isStackUpMove } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(isStackUpMove({ pass: true }));
 * ```
 */
export function isStackUpMove(value: unknown): value is StackUpMove {
  if (typeof value !== "object" || value === null) return false;
  const move = value as Record<string, unknown>;
  if (move.pass === true) return true;
  if (typeof move.discard === "string") return Number.isInteger(move.to);
  if (typeof move.play !== "string" || !Number.isInteger(move.to)) return false;
  if (move.from === "hand" || move.from === "stock") return true;
  return move.from === "discard" && Number.isInteger(move.pile);
}

/** Whether a move is among the ones the rules offer now. */
function offered(game: StackUpGame, move: StackUpMove): boolean {
  return stackUpMoves(game).some((allowed) => JSON.stringify(allowed) === JSON.stringify(move));
}

/** The seats that win: the one who played their last stock card, or at a stuck table those with the fewest stock cards left. */
function winnersOf(game: StackUpGame): number[] {
  const left = game.stocks.map((stock) => stock.length);
  const fewest = Math.min(...left);
  return left.flatMap((count, seat) => (count === fewest ? [seat] : []));
}

/** The game after the turn ends: the next seat draws up and plays, unless nothing has been played for a whole round with nothing left to draw. */
function endTurn(game: StackUpGame): StackUpGame {
  const idle = game.played ? 0 : game.idle + 1;
  const next = ((game.toPlay ?? 0) + 1) % game.players.length;
  const stuck = idle >= game.players.length && game.draw.length === 0 && game.done.length === 0;
  if (stuck) return { ...game, phase: "over", toPlay: null, idle, ended: "stuck" as StackUpEnd };
  return drawUp({ ...game, toPlay: next, played: false, idle }, next);
}

/** The game after a move, or null for a move the rules refuse. A card played from the last of a hand draws five more; the last card of a stock ends the game; a building pile of twelve is set aside.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @param move - The move to apply.
 * @returns The game after a move, or null for a move the rules refuse.
 *
 * @example
 * ```ts
 * import { playStackUp, stackUpMoves, startStackUp } from "@johnmorrisdotca/toranpu/stack-up";
 *
 * const game = startStackUp(15, ["Aki", "Ben"], undefined, 42)!;
 * console.log(playStackUp(game, stackUpMoves(game)[0]!)?.moves.length);
 * ```
 */
export function playStackUp(game: StackUpGame, move: StackUpMove): StackUpGame | null {
  if (game.phase === "over" || game.toPlay === null || !offered(game, move)) return null;
  const seat = game.toPlay;
  const kept = { ...game, moves: [...game.moves, move] };
  if ("pass" in move) return endTurn(kept);
  const hands = kept.hands.map((hand) => [...hand]);
  if ("discard" in move) {
    hands[seat]!.splice(hands[seat]!.indexOf(move.discard), 1);
    const discards = kept.discards.map((piles) => piles.map((pile) => [...pile]));
    discards[seat]![move.to]!.push(move.discard);
    return endTurn({ ...kept, hands, discards });
  }
  const stocks = kept.stocks.map((stock) => [...stock]);
  const discards = kept.discards.map((piles) => piles.map((pile) => [...pile]));
  if (move.from === "hand") hands[seat]!.splice(hands[seat]!.indexOf(move.play), 1);
  else if (move.from === "discard") discards[seat]![move.pile]!.pop();
  else stocks[seat]!.pop();
  const building = kept.building.map((pile) => [...pile]);
  building[move.to]!.push(move.play);
  let done = kept.done;
  if (building[move.to]!.length === STACK_UP_TOP) {
    done = [...done, ...building[move.to]!];
    building[move.to] = [];
  }
  const laid: StackUpGame = { ...kept, hands, stocks, discards, building, done, played: true, idle: 0 };
  if (stocks[seat]!.length === 0) return { ...laid, phase: "over", toPlay: null, ended: "emptied" };
  return move.from === "hand" && hands[seat]!.length === 0 ? drawUp(laid, seat) : laid;
}

/** The seats that won a game that is over: the one who emptied their stock, or at a stuck table those with the fewest cards left; empty while it is being played.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The seats that won.
 *
 * @example
 * ```ts
 * import { stackUpWinners, startStackUp } from "@johnmorrisdotca/toranpu/stack-up";
 * console.log(stackUpWinners(startStackUp(15, ["Aki", "Ben"], undefined, 42)!));
 * ```
 */
export function stackUpWinners(game: StackUpGame): number[] {
  if (game.phase !== "over") return [];
  if (game.ended === "emptied") return game.stocks.flatMap((stock, seat) => (stock.length === 0 ? [seat] : []));
  return winnersOf(game);
}
