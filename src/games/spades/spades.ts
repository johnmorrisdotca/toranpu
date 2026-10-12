import { computerSeats } from "../card-game-codec.ts";
import { SPADES_SIZES } from "../card-games.constants.ts";
import type { CardId } from "../card-games.types.ts";
import { dealRound, nextSeat, rankOf, shuffledDeck, suitOf } from "../cards.ts";

import type { SpadesDealScore, SpadesGame, SpadesMove, SpadesPlay } from "./spades.types.ts";

/**
 * SPADES: the rules, and nothing else.
 *
 * Four players in two partnerships, partners sitting across from each other.
 * Thirteen cards each; then each player, from the dealer's left, bids how many
 * tricks they will take — or nil, none at all. A partnership's contract is
 * its two bids added. Follow suit if you can; spades are trumps, and may not
 * be led until one has been played on another suit (unless the leader holds
 * nothing else). Make the contract and score ten a trick bid and one for
 * every trick over (a bag); fall short and lose ten a trick bid. Every ten
 * bags cost a hundred. Nil makes a hundred if its bidder takes no trick, and
 * costs a hundred if they take one. The first partnership to the game's total
 * wins — or, if one sinks to minus that total, the other does.
 *
 * Pure: every function returns a new game and leaves the one given alone.
 */

/** How many play Spades: four, in two partnerships.
 *
 * @example
 * ```ts
 * import { SPADES_SEATS } from "@johnmorrisdotca/toranpu/spades";
 * console.log(SPADES_SEATS);
 * ```
 */
export const SPADES_SEATS = 4;
/** The tricks in a deal of Spades: thirteen.
 *
 * @example
 * ```ts
 * import { SPADES_TRICKS } from "@johnmorrisdotca/toranpu/spades";
 * console.log(SPADES_TRICKS);
 * ```
 */
export const SPADES_TRICKS = 13;
/** The bid that means no tricks at all.
 *
 * @example
 * ```ts
 * import { NIL } from "@johnmorrisdotca/toranpu/spades";
 * console.log(NIL);
 * ```
 */
export const NIL = 0;
const NIL_POINTS = 100;
/** Ten overtricks carried cost a hundred, and the ten are taken off. */
const BAGS_FOR_PENALTY = 10;
const BAG_PENALTY = 100;

/** A card's height in a trick: ace high.
 *
 * @param card - The physical card or card id to read, draw or play.
 * @returns A card's height in a trick: ace high.
 *
 * @example
 * ```ts
 * import { spadesHeight } from "@johnmorrisdotca/toranpu/spades";
 *
 * console.log(spadesHeight("AS"));
 * ```
 */
export function spadesHeight(card: CardId): number {
  const rank = rankOf(card);
  return rank === 1 ? 14 : rank;
}

/** A seat's partnership: 0 for seats 0 and 2, 1 for seats 1 and 3.
 *
 * @param seat - The zero-based player seat.
 * @returns A seat's partnership: 0 for seats 0 and 2, 1 for seats 1 and 3.
 *
 * @example
 * ```ts
 * import { teamOf } from "@johnmorrisdotca/toranpu/spades";
 *
 * console.log(teamOf(3));
 * ```
 */
export function teamOf(seat: number): 0 | 1 {
  return (seat % 2) as 0 | 1;
}

/** The seat across the table.
 *
 * @param seat - The zero-based player seat.
 * @returns The seat across the table.
 *
 * @example
 * ```ts
 * import { partnerOf } from "@johnmorrisdotca/toranpu/spades";
 *
 * console.log(partnerOf(1));
 * ```
 */
export function partnerOf(seat: number): number {
  return (seat + 2) % SPADES_SEATS;
}

/** A hand sorted as a player holds it: diamonds, clubs, hearts, spades, low to high within each.
 *
 * @param hand - The player’s held cards, or the hand number for a deal.
 * @returns A hand sorted as a player holds it: diamonds, clubs, hearts, spades, low to high within each.
 *
 * @example
 * ```ts
 * import { sortSpades } from "@johnmorrisdotca/toranpu/spades";
 *
 * console.log(sortSpades(["AS", "KH", "2C"]));
 * ```
 */
export function sortSpades(hand: readonly CardId[]): CardId[] {
  const order = "DCHS";
  return [...hand].sort((a, b) => order.indexOf(suitOf(a)) - order.indexOf(suitOf(b)) || spadesHeight(a) - spadesHeight(b));
}

/** The seat that deals this deal: the first seat, then round to the left.
 *
 * @param deal - The deal number or dealing specification.
 * @returns The seat that deals this deal: the first seat, then round to the left.
 *
 * @example
 * ```ts
 * import { dealerOf } from "@johnmorrisdotca/toranpu/spades";
 *
 * console.log(dealerOf(0));
 * ```
 */
export function dealerOf(deal: number): number {
  return deal % SPADES_SEATS;
}

/** A new deal: thirteen each, and the bidding opened by the dealer's left. */
function dealSpades(game: Omit<SpadesGame, "hands" | "bids" | "trick" | "played" | "toPlay" | "spadesBroken" | "tricks" | "phase">): SpadesGame {
  const { hands } = dealRound(shuffledDeck(game.seed, game.deal), SPADES_SEATS);
  return {
    ...game,
    phase: "bidding",
    hands: hands.map(sortSpades),
    bids: new Array<number | null>(SPADES_SEATS).fill(null),
    trick: [],
    played: [],
    toPlay: nextSeat(dealerOf(game.deal), SPADES_SEATS),
    spadesBroken: false,
    tricks: new Array<number>(SPADES_SEATS).fill(0),
  };
}

/** A new game of Spades for these players (one name a seat) at this size, dealt from the seed `dealt`, or null for a table Spades is not offered for. `computers` says, one a seat, which seats a computer plays; the third argument is unused.
 *
 * @param size - The game’s length or size, as defined by its table specification.
 * @param players - The player names in seat order.
 * @param _language - An unused legacy language argument retained for compatibility.
 * @param dealt - The numeric seed used to deal the game.
 * @param computers - Flags by seat: true where a computer controls that seat.
 * @returns A new game of Spades for these players (one name a seat) at this size, dealt from the seed `dealt`, or null for a table Spades is not offered for. `computers` says, one a seat, which seats a computer plays; the third argument is unused.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES } from "@johnmorrisdotca/toranpu";
 * import { startSpades } from "@johnmorrisdotca/toranpu/spades";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.spades.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * console.log(startSpades(CARD_GAME_TABLES.spades.defaultSize, names, undefined, 42)?.phase);
 * ```
 */
export function startSpades(size: number, players: readonly string[], _language?: unknown, dealt?: number, computers?: readonly boolean[]): SpadesGame | null {
  if (!(SPADES_SIZES as readonly number[]).includes(size)) return null;
  if (players.length !== SPADES_SEATS) return null;
  return dealSpades({
    size,
    players: [...players],
    computers: computerSeats(players.length, computers),
    seed: dealt ?? 1,
    moves: [],
    deal: 0,
    lastTrick: null,
    scores: [0, 0],
    bags: [0, 0],
    dealScores: [],
  });
}

/** The cards the seat to play may lay on the trick now.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The cards the seat to play may lay on the trick now.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import { spadesPlayable } from "@johnmorrisdotca/toranpu/spades";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.spades.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("spades", { players: names, seed: 42 })!;
 * const rules = rulesFor("spades");
 * for (let setup = 0; setup < 100 && game.phase !== "playing" && game.phase !== "over"; setup += 1) {
 *   const next = rules.play(game, rules.computer(game));
 *   if (next === null) throw new Error("Unexpected illegal setup move");
 *   game = next;
 * }
 * if (game.phase !== "playing") throw new Error("Setup did not reach playing");
 * console.log(spadesPlayable(game));
 * ```
 */
export function spadesPlayable(game: SpadesGame): CardId[] {
  if (game.phase !== "playing" || game.toPlay === null) return [];
  const hand = game.hands[game.toPlay];
  if (game.trick.length === 0) {
    const notSpades = hand.filter((card) => suitOf(card) !== "S");
    return game.spadesBroken || notSpades.length === 0 ? hand : notSpades;
  }
  const led = suitOf(game.trick[0].card);
  const following = hand.filter((card) => suitOf(card) === led);
  return following.length > 0 ? following : hand;
}

/** Who takes a finished trick (or is winning one still being played): the highest spade, or else the highest card of the suit led.
 *
 * @param trick - The cards and seats in the current trick.
 * @returns Who takes a finished trick (or is winning one still being played): the highest spade, or else the highest card of the suit led.
 *
 * @example
 * ```ts
 * import { spadesTrickWinner } from "@johnmorrisdotca/toranpu/spades";
 *
 * console.log(spadesTrickWinner([{ seat: 0, card: "AC" }, { seat: 1, card: "2S" }, { seat: 2, card: "KC" }, { seat: 3, card: "QC" }]));
 * ```
 */
export function spadesTrickWinner(trick: readonly SpadesPlay[]): number {
  const led = suitOf(trick[0].card);
  const beats = (card: CardId, best: CardId) => {
    const suit = suitOf(card);
    const bestSuit = suitOf(best);
    if (suit === bestSuit) return spadesHeight(card) > spadesHeight(best);
    return suit === "S" || (suit === led && bestSuit !== "S" && bestSuit !== led);
  };
  let best = trick[0];
  for (const play of trick) if (beats(play.card, best.card)) best = play;
  return best.seat;
}

/** The bids open to a player: nil, or one to thirteen tricks.
 *
 * @example
 * ```ts
 * import { SPADES_BIDS } from "@johnmorrisdotca/toranpu/spades";
 * console.log(SPADES_BIDS);
 * ```
 */
export const SPADES_BIDS: readonly number[] = Array.from({ length: SPADES_TRICKS + 1 }, (_, bid) => bid);

/** Every move the seat to play may make now; none once the game is over.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns Every move the seat to play may make now; none once the game is over.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { spadesMoves } from "@johnmorrisdotca/toranpu/spades";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.spades.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("spades", { players: names, seed: 42 })!;
 * console.log(spadesMoves(game));
 * ```
 */
export function spadesMoves(game: SpadesGame): SpadesMove[] {
  if (game.phase === "bidding") return SPADES_BIDS.map((bid) => ({ bid }));
  return spadesPlayable(game).map((play) => ({ play }));
}

function bidTricks(game: SpadesGame, seat: number, bid: number): SpadesGame | null {
  if (!Number.isInteger(bid) || bid < NIL || bid > SPADES_TRICKS) return null;
  const bids = game.bids.map((had, at) => (at === seat ? bid : had));
  const next = nextSeat(seat, SPADES_SEATS);
  // The last bid is the dealer's: then the dealer's left leads the first trick.
  if (bids.every((one) => one !== null)) return { ...game, bids, phase: "playing", toPlay: next };
  return { ...game, bids, toPlay: next };
}

function playCard(game: SpadesGame, seat: number, card: CardId): SpadesGame | null {
  if (!spadesPlayable(game).includes(card)) return null;
  const hands = game.hands.map((hand, at) => (at === seat ? hand.filter((held) => held !== card) : hand));
  const trick = [...game.trick, { seat, card }];
  const spadesBroken = game.spadesBroken || suitOf(card) === "S";
  if (trick.length < SPADES_SEATS) return { ...game, hands, trick, spadesBroken, toPlay: nextSeat(seat, SPADES_SEATS) };
  const winner = spadesTrickWinner(trick);
  const tricks = game.tricks.map((had, at) => (at === winner ? had + 1 : had));
  const after: SpadesGame = { ...game, hands, trick: [], spadesBroken, tricks, played: [...game.played, ...trick.map((play) => play.card)], lastTrick: { plays: trick, winner }, toPlay: winner };
  return hands[0].length === 0 ? endDeal(after) : after;
}

/**
 * What one partnership made of a deal: its contract (the two bids, a nil
 * counting none) made or not, each nil made or not, and the overtricks — the
 * tricks over the contract, and any trick a nil bidder took — as bags.
 *
 * @param bids - Bids by seat, in seat order.
 * @param tricks - The number of tricks won.
 * @param team - The zero-based team index.
 * @returns What one partnership made of a deal: its contract (the two bids, a nil counting none) made or not, each nil made or not, and the overtricks — the tricks over the contract, and any trick a nil bidder took — as bags.
 *
 * @example
 * ```ts
 * import { partnershipScore } from "@johnmorrisdotca/toranpu/spades";
 *
 * console.log(partnershipScore([3, 4, 3, 3], [4, 3, 3, 3], 0));
 * ```
 */
export function partnershipScore(bids: readonly number[], tricks: readonly number[], team: 0 | 1): { points: number; bags: number } {
  const seats = [team, team + 2];
  let points = 0;
  let bags = 0;
  let contract = 0;
  let taken = 0;
  for (const seat of seats) {
    if (bids[seat] === NIL) {
      points += tricks[seat] === 0 ? NIL_POINTS : -NIL_POINTS;
      bags += tricks[seat];
    } else {
      contract += bids[seat];
      taken += tricks[seat];
    }
  }
  if (contract > 0) {
    if (taken >= contract) {
      points += 10 * contract + (taken - contract);
      bags += taken - contract;
    } else points -= 10 * contract;
  }
  return { points, bags };
}

/** The deal is played out: each partnership scores, ten bags cost a hundred, and the game ends or the next deal is dealt. */
function endDeal(game: SpadesGame): SpadesGame {
  const bids = game.bids as number[];
  const made = ([0, 1] as const).map((team) => partnershipScore(bids, game.tricks, team));
  let scores = game.scores.map((score, team) => score + made[team].points) as [number, number];
  let bags = game.bags.map((had, team) => had + made[team].bags) as [number, number];
  scores = scores.map((score, team) => score - BAG_PENALTY * Math.floor(bags[team] / BAGS_FOR_PENALTY)) as [number, number];
  bags = bags.map((had) => had % BAGS_FOR_PENALTY) as [number, number];
  const dealScore: SpadesDealScore = { points: [scores[0] - game.scores[0], scores[1] - game.scores[1]], bags: [made[0].bags, made[1].bags] };
  const finished = { ...game, scores, bags, dealScores: [...game.dealScores, dealScore] };
  const reached = scores.some((score) => score >= game.size || score <= -game.size);
  // Level at the end, and the game goes on: a partnership has to be ahead to win.
  if (reached && scores[0] !== scores[1]) return { ...finished, phase: "over", toPlay: null };
  return dealSpades({ ...finished, deal: game.deal + 1 });
}

/** The game after that move, with the move added to its record, or null for a move the rules refuse.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @param move - The native move to validate or apply.
 * @returns The game after that move, with the move added to its record, or null for a move the rules refuse.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame, rulesFor } from "@johnmorrisdotca/toranpu";
 * import { playSpades } from "@johnmorrisdotca/toranpu/spades";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.spades.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("spades", { players: names, seed: 42 })!;
 * console.log(playSpades(game, rulesFor("spades").moves(game)[0]!)?.moves.length);
 * ```
 */
export function playSpades(game: SpadesGame, move: SpadesMove): SpadesGame | null {
  if (game.toPlay === null) return null;
  const seat = game.toPlay;
  const next = "bid" in move ? (game.phase === "bidding" ? bidTricks(game, seat, move.bid) : null) : game.phase === "playing" ? playCard(game, seat, move.play) : null;
  return next === null ? null : { ...next, moves: [...game.moves, move] };
}

/** The partnership with the higher score wins, both its seats.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The partnership with the higher score wins, both its seats.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { spadesWinners } from "@johnmorrisdotca/toranpu/spades";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.spades.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("spades", { players: names, seed: 42 })!;
 * console.log(spadesWinners(game));
 * ```
 */
export function spadesWinners(game: SpadesGame): number[] {
  if (game.phase !== "over") return [];
  const team = game.scores[0] > game.scores[1] ? 0 : 1;
  return [team, team + 2];
}

/** A partnership's contract this deal: its bids added, a nil counting none; null while either has still to bid.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @param team - The zero-based team index.
 * @returns A partnership's contract this deal: its bids added, a nil counting none; null while either has still to bid.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { contractOf } from "@johnmorrisdotca/toranpu/spades";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.spades.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("spades", { players: names, seed: 42 })!;
 * console.log(contractOf(game, 0));
 * ```
 */
export function contractOf(game: SpadesGame, team: 0 | 1): number | null {
  const a = game.bids[team];
  const b = game.bids[team + 2];
  return a === null || b === null ? null : a + b;
}
