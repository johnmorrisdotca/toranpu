import { computerSeats } from "../card-game-codec.ts";
import { WAR_ROUNDS } from "../card-games.constants.ts";
import type { CardId } from "../card-games.types.ts";
import { dealRound, rankOf, reshuffled, shuffledDeck } from "../cards.ts";

import type { WarEnd, WarGame, WarLaid, WarMove } from "./war.types.ts";

/**
 * WAR: the rules, and nothing else.
 *
 * Two players. The deck is shuffled and split, twenty-six cards each, face down. Each turn both players turn their top card
 * over; the higher takes both, aces high. When the two are the same rank it is war: each lays three cards face down and
 * turns a fourth over, and the higher of those two takes everything laid, and a tie goes to war again, as many times as it
 * takes. A player who cannot finish a war, with fewer than four cards to lay in it, loses; both unable, the one who runs
 * out first, with fewer cards, loses, and level it is a draw. The
 * winner of a turn puts the cards they won under their pile, shuffled, so a game cannot run in circles for ever. The game
 * ends when one player holds every card, or after the number of turns it was set up for, when the player holding more cards
 * wins and equal piles are shared.
 *
 * Pure: every function returns a new game and leaves the one given alone.
 */

/** The cards a player lays in a war before the one turned up. */
export const WAR_FACE_DOWN = 3;

/** How a rank counts at War: the ace highest, then king down to two. */
export function warRank(card: CardId): number {
  const rank = rankOf(card);
  return rank === 1 ? 14 : rank;
}

/** A new game of War for these two players at this size (how many turns it may last), dealt from the seed, or null for a table War is not offered for. `computers` says, one a seat, which seats a computer plays; the third argument is unused. */
export function startWar(size: number, players: readonly string[], _language?: unknown, dealt?: number, computers?: readonly boolean[]): WarGame | null {
  if (!(WAR_ROUNDS as readonly number[]).includes(size)) return null;
  if (players.length !== 2) return null;
  const seed = dealt ?? 1;
  const { hands } = dealRound(shuffledDeck(seed, 0), 2);
  const game: WarGame = {
    size,
    players: [...players],
    computers: computerSeats(2, computers),
    seed,
    moves: [],
    phase: "playing",
    hands,
    toPlay: 0,
    last: null,
    ended: null,
  };
  return { ...game, toPlay: seatToPlay(game) };
}

/** The seat the table waits on: the first person's, or seat 0 when computers hold both. */
function seatToPlay(game: Pick<WarGame, "computers">): number {
  const person = game.computers.findIndex((computer) => !computer);
  return person < 0 ? 0 : person;
}

/** Every move the table may make now: turning the cards over, until the game is over. */
export function warMoves(game: WarGame): WarMove[] {
  return game.phase === "over" ? [] : [{ turn: true }];
}

/** Whether something is the one move War has. */
export function isWarMove(value: unknown): value is WarMove {
  return typeof value === "object" && value !== null && (value as Record<string, unknown>).turn === true;
}

/** The salt a turn's winnings are shuffled with, so they are never shuffled the way the deck was. */
const WINNINGS_SALT = 7919;

/** The game after the cards are turned over: the whole turn, through however many wars it takes, or null for a move the rules refuse. */
export function playWar(game: WarGame, move: WarMove): WarGame | null {
  if (game.phase === "over" || !isWarMove(move)) return null;
  const hands = game.hands.map((hand) => [...hand]);
  const laid: WarLaid[] = [];
  let wars = 0;
  // The seat that took the cards, null where nobody did; and how the game ended if this turn ended it.
  let winner: number | null = null;
  let ended: WarEnd | null = null;
  const turnUp = (): [CardId, CardId] => {
    const cards = [0, 1].map((seat) => hands[seat].shift() as CardId) as [CardId, CardId];
    cards.forEach((card, seat) => laid.push({ seat, card, down: false }));
    return cards;
  };
  let [x, y] = turnUp();
  while (warRank(x) === warRank(y)) {
    // A war: each lays three face down and turns a fourth up; a player without four cards cannot finish it.
    wars += 1;
    const short = [0, 1].filter((seat) => hands[seat].length < WAR_FACE_DOWN + 1);
    if (short.length > 0) {
      // Neither able: the one who runs out first, with the fewer cards, loses; level, it is a draw.
      const level = short.length === 2 && hands[0].length === hands[1].length;
      ended = level ? "drawn" : "short";
      winner = level ? null : short.length === 1 ? 1 - (short[0] as number) : hands[0].length > hands[1].length ? 0 : 1;
      break;
    }
    for (const seat of [0, 1]) for (const card of hands[seat].splice(0, WAR_FACE_DOWN)) laid.push({ seat, card, down: true });
    [x, y] = turnUp();
  }
  if (ended === null) winner = warRank(x) > warRank(y) ? 0 : 1;

  const pot = laid.map((one) => one.card);
  if (ended === "short") {
    // The player who could not finish loses everything: the winner takes what lies on the table and what the loser still held.
    const loser = 1 - (winner as number);
    hands[winner as number].push(...pot, ...hands[loser]);
    hands[loser] = [];
  } else if (ended === "drawn") {
    // Both unable: each takes back what they laid, and the game is shared.
    for (const seat of [0, 1]) hands[seat].push(...laid.filter((one) => one.seat === seat).map((one) => one.card));
  } else hands[winner as number].push(...reshuffled(pot, game.seed, WINNINGS_SALT + game.moves.length));

  const moves = [...game.moves, move];
  if (ended === null && (hands[0].length === 0 || hands[1].length === 0)) ended = "cleared";
  if (ended === null && moves.length >= game.size) ended = "limit";
  const over = ended !== null;
  const next: WarGame = { ...game, moves, hands, phase: over ? "over" : "playing", ended, last: { laid, wars, winner }, toPlay: null };
  return { ...next, toPlay: over ? null : seatToPlay(next) };
}

/** The seats that won a game that is over: the player with more cards, both when the piles are level or the game was a draw; nobody while it goes on. */
export function warWinners(game: WarGame): number[] {
  if (game.phase !== "over") return [];
  if (game.ended === "drawn") return [0, 1];
  const top = Math.max(...game.hands.map((hand) => hand.length));
  return game.hands.flatMap((hand, seat) => (hand.length === top ? [seat] : []));
}
