/**
 * WHERE CARDS LIE: the arithmetic behind the elements, kept apart from the DOM
 * so that it is the same in every browser and is tested without one. A hand
 * fanned or squared up, a pile neat or messy, and a hand written as text.
 */
import { cardFromCode, cardId } from "../cards/deck.ts";
import { seededRandom } from "../random.ts";

/** One card's place: across and down in card widths from where the first lies, and its turn in degrees. */
export type CardPlace = { x: number; y: number; rotate: number };

/** How a hand is laid out. */
export type HandLayoutOptions = {
  /** How far open, from 0 (squared up: only the top card shows) to 1 (a clear fan). Unless said, 1. */
  open?: number;
  /** How far apart neighbours lie when the hand is open, in card widths. Unless said, 0.42. */
  step?: number;
  /** How far the cards turn across the whole fan when it is open, in degrees. Unless said, 4 a card, at most 40. */
  turn?: number;
  /** How much of each card under the top one still shows when the hand is squared up, in card widths. Unless said, 0.04. */
  peek?: number;
};

/**
 * Where each card of a hand of `count` lies: a fan when open, a squared-up
 * stack with a sliver of each card showing when closed, and every shape in
 * between. The middle card turns least; the first lies at x 0.
 */
export function handLayout(count: number, options: HandLayoutOptions = {}): CardPlace[] {
  const whole = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  const open = clamp01(options.open ?? 1);
  const step = Math.max(0, options.step ?? 0.42);
  const peek = Math.max(0, options.peek ?? 0.04);
  const turn = options.turn ?? Math.min(40, 4 * Math.max(0, whole - 1));
  const middle = (whole - 1) / 2;
  const each = peek + (step - peek) * open;
  return Array.from({ length: whole }, (_, at) => {
    const off = whole <= 1 ? 0 : (at - middle) / Math.max(1, whole - 1);
    const rotate = turn * off * open;
    // A fan's ends dip a little, as cards held in a hand do.
    const y = whole <= 1 ? 0 : 0.06 * (2 * off) ** 2 * open;
    return { x: round(at * each), y: round(y), rotate: round(rotate) };
  });
}

/** How a pile is laid out. */
export type PileLayoutOptions = {
  /** From 0 (squared up neatly) to 1 (very messy). Unless said, 0.3. */
  messiness?: number;
  /** The pile's own seed: the same seed always lays the same pile the same way. Unless said, 1. */
  seed?: number;
  /** How many cards under the top one are drawn at most, so a pile of fifty-two costs no more than one of ten. Unless said, 10. */
  depth?: number;
};

/**
 * Where each card of a pile of `count` lies, bottom first, the top card last:
 * at 0 messiness a neat stack whose edge shows a card's thickness for each
 * card under the top, and towards 1 a heap, each card nudged and turned a
 * little more. Seeded, so the same pile always looks the same, and adding a
 * card on top moves none of those under it. Only the top `depth` cards under
 * the top one are given places; a pile is never drawn deeper than that.
 */
export function pileLayout(count: number, options: PileLayoutOptions = {}): CardPlace[] {
  const whole = Math.max(0, Math.floor(Number.isFinite(count) ? count : 0));
  const mess = clamp01(options.messiness ?? 0.3);
  const depth = Math.max(0, Math.floor(options.depth ?? 10));
  const shown = Math.min(whole, depth + 1);
  const seed = Number.isFinite(options.seed) ? (options.seed as number) : 1;
  const places: CardPlace[] = [];
  for (let at = 0; at < shown; at++) {
    // The card's place in the whole pile, counted from the bottom, decides its nudge, so a card keeps its place as others land on it.
    const index = whole - shown + at;
    const random = seededRandom((seed * 2654435761 + index * 40503) >>> 0);
    const below = shown - 1 - at;
    // A neat pile still shows its thickness, down and to the right, a little for every card.
    const edge = 0.012 * below;
    const nudge = 0.09 * mess;
    const x = edge * 0.6 + (random() * 2 - 1) * nudge;
    const y = edge + (random() * 2 - 1) * nudge * 0.8;
    const rotate = (random() * 2 - 1) * 14 * mess ** 1.3;
    places.push({ x: round(x), y: round(y), rotate: round(rotate) });
  }
  return places;
}

/** The extras a hand may hold (`EXTRA_CARDS` in cardFaces.ts), and the most of each kind (`EXTRA_LIMITS`), spelled here so the layout needs no drawing. */
const EXTRAS: readonly string[] = ["RJ", "BJ", "R1", "R2", "BL"];

/** Whether a hand holds no more extras than one pack has: four jokers, two rules cards, two blanks. */
function withinLimits(ids: readonly string[]): boolean {
  const count = (test: (id: string) => boolean) => ids.filter(test).length;
  return count((id) => id === "RJ" || id === "BJ") <= 4 && count((id) => id === "R1" || id === "R2") <= 2 && count((id) => id === "BL") <= 2;
}

/**
 * A hand written as text, as its cards: the two-letter ids separated by spaces
 * or commas (`"AS KH 10D TC RJ"`, with `10` for ten as well as `T`), or the
 * deck's one-letter codes run together (`"pvOZ"`). The extras by their ids or
 * their words: `JOKER` (each the next of red and black), `RULES`, `BLANK`.
 * `null` for anything else, or for more extras than one pack holds.
 */
export function readHand(text: string | null | undefined): string[] | null {
  const words = String(text ?? "").trim().toUpperCase().split(/[\s,;+]+/).filter(Boolean);
  if (words.length === 0) return [];
  // The extras by their words: each JOKER the next of red and black, each RULES the next rules card, BLANK the blank.
  let jokers = 0;
  let rules = 0;
  const ids = words.map((word) => {
    if (word === "JOKER" || word === "JK") return jokers++ % 2 === 0 ? "RJ" : "BJ";
    if (word === "RULES") return rules++ % 2 === 0 ? "R1" : "R2";
    if (word === "BLANK") return "BL";
    return word.replace(/^10(?=[SHDC]$)/, "T");
  });
  if (ids.every((id) => /^[A2-9TJQK][SHDC]$/.test(id) || EXTRAS.includes(id))) return withinLimits(ids) ? ids : null;
  const raw = String(text ?? "").trim();
  if (/^[A-Za-z]+$/.test(raw)) {
    const cards: string[] = [];
    for (const code of raw) {
      const card = cardFromCode(code);
      if (card === null) return null;
      cards.push(cardId(card));
    }
    return cards;
  }
  return null;
}

function clamp01(value: number): number {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
}

/** A number kept to three places, so a layout reads the same everywhere. */
function round(value: number): number {
  const kept = Math.round(value * 1000) / 1000;
  return Object.is(kept, -0) ? 0 : kept;
}

/** How a hand's cards are laid out: as they were dealt, by rank, or grouped by suit. */
export type CardOrder = "dealt" | "rank" | "suit";

/** The ranks low to high, the ace high, as a sorted hand reads left to right. */
const RANKS = "23456789TJQKA";
/** The suits in the order a grouped hand lays them: spades, hearts, clubs, diamonds, so no two of a colour lie side by side. */
const SUITS = "SHCD";

/**
 * A hand laid out another way, as a new list (the one given is left alone): `"rank"` sorts it low to
 * high, the ace high, a rank's cards in suit order; `"suit"` groups it by suit, spades, hearts, clubs,
 * diamonds, each in rank order; `"dealt"` keeps the order given. The extras (jokers, rules cards, the
 * blank) come last, in the order dealt. Cards of the same id keep their order, so a sort is stable.
 *
 * ```ts
 * arrangeCards(["QH", "2S", "AH", "2H"], "rank"); // ["2S", "2H", "QH", "AH"]
 * arrangeCards(["QH", "2S", "AH", "2H", "KS"], "suit"); // ["2S", "KS", "2H", "QH", "AH"]
 * ```
 */
export function arrangeCards(cards: readonly string[], by: CardOrder): string[] {
  if (by !== "rank" && by !== "suit") return [...cards];
  const key = (card: string, at: number): [number, number, number] => {
    const rank = RANKS.indexOf(card[0] ?? "");
    const suit = SUITS.indexOf(card[1] ?? "");
    if (card.length !== 2 || rank === -1 || suit === -1) return [1, 0, at];
    return [0, by === "rank" ? rank * 4 + suit : suit * 13 + rank, at];
  };
  return cards
    .map((card, at) => ({ card, key: key(card, at) }))
    .sort((a, b) => a.key[0] - b.key[0] || a.key[1] - b.key[1] || a.key[2] - b.key[2])
    .map((each) => each.card);
}

/**
 * A hand mixed up, as a new list: the same cards in another order, never the order given (where a hand
 * has two cards or more that differ), so a mix is always seen to change something. `random` is any
 * source of numbers in [0, 1); unless given, `Math.random`.
 */
export function mixCards(cards: readonly string[], random: () => number = Math.random): string[] {
  const mixed = [...cards];
  if (new Set(cards).size < 2) return mixed;
  do {
    for (let at = mixed.length - 1; at > 0; at--) {
      const other = Math.floor(random() * (at + 1));
      [mixed[at], mixed[other]] = [mixed[other] as string, mixed[at] as string];
    }
  } while (mixed.join(" ") === cards.join(" "));
  return mixed;
}

/** A hand without one card, as a new list: the first of that card taken out, or the hand unchanged where it holds none. */
export function tossCard(cards: readonly string[], card: string): string[] {
  const at = cards.indexOf(card);
  return at === -1 ? [...cards] : [...cards.slice(0, at), ...cards.slice(at + 1)];
}

/** Where a card a hand is given goes: to the front, or the end. */
export type CardLands = "front" | "end";

/** A hand with one card tossed out and another given in its stead, at the front or the end: as a new list. Unchanged where it holds no such card. */
export function replaceCard(cards: readonly string[], card: string, next: string, lands: CardLands = "end"): string[] {
  if (!cards.includes(card)) return [...cards];
  const rest = tossCard(cards, card);
  return lands === "front" ? [next, ...rest] : [...rest, next];
}
