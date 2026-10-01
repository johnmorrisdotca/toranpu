import { RANK_DISPLAY, SUIT_DISPLAY } from "./cards/cards.constants.ts";
import type { CardGameKind } from "./games/cardGames.constants.ts";
import type { CardId, CardRank, CardSuit } from "./games/cardGames.types.ts";
import { cardOfId, isCard, rankOf, rankWords, suitOf } from "./games/cards.ts";
import type { MoveOf } from "./play.ts";
import { STRINGS, fillIn, type Language, type ToranpuStrings } from "./strings.ts";

/**
 * THE GAMES, THE CARDS AND THE MOVES IN WORDS, in English or Japanese: what a
 * table prints on a button, in a log and in a record of a game. Everything
 * here reads `STRINGS` and draws nothing.
 */

const NAME_KEYS: Record<CardGameKind, keyof ToranpuStrings> = {
  hearts: "gameHearts",
  spades: "gameSpades",
  euchre: "gameEuchre",
  cribbage: "gameCribbage",
  ohHell: "gameOhHell",
  crazyEights: "gameCrazyEights",
  goFish: "gameGoFish",
  bigTwo: "gameBigTwo",
  president: "gamePresident",
  ginRummy: "gameGinRummy",
  war: "gameWar",
};

const SAYS_KEYS: Record<CardGameKind, keyof ToranpuStrings> = {
  hearts: "saysHearts",
  spades: "saysSpades",
  euchre: "saysEuchre",
  cribbage: "saysCribbage",
  ohHell: "saysOhHell",
  crazyEights: "saysCrazyEights",
  goFish: "saysGoFish",
  bigTwo: "saysBigTwo",
  president: "saysPresident",
  ginRummy: "saysGinRummy",
  war: "saysWar",
};

const SUIT_KEYS: Record<CardSuit, keyof ToranpuStrings> = { S: "suitS", H: "suitH", D: "suitD", C: "suitC" };
const SUIT_SYMBOLS: Record<CardSuit, string> = { S: SUIT_DISPLAY.spades.symbol, H: SUIT_DISPLAY.hearts.symbol, D: SUIT_DISPLAY.diamonds.symbol, C: SUIT_DISPLAY.clubs.symbol };

/** A game's name: "Hearts", or "ハーツ" in Japanese. */
export function gameName(kind: CardGameKind, language: Language = "en"): string {
  return STRINGS[language][NAME_KEYS[kind]];
}

/** A game in a line: what it is about, for a list of games. */
export function gameSays(kind: CardGameKind, language: Language = "en"): string {
  return STRINGS[language][SAYS_KEYS[kind]];
}

/** A suit's name: "spades", or "スペード" in Japanese. */
export function suitName(suit: CardSuit, language: Language = "en"): string {
  return STRINGS[language][SUIT_KEYS[suit]];
}

/** A suit's symbol: ♠ ♥ ♦ ♣. */
export function suitSymbol(suit: CardSuit): string {
  return SUIT_SYMBOLS[suit];
}

/** A rank as a sentence names one card of it: "queen", "seven"; in Japanese "クイーン", "7". */
export function rankName(rank: CardRank, language: Language = "en"): string {
  if (language === "en") return RANK_DISPLAY[rank].name;
  if (rank === 1 || rank >= 11) return STRINGS.ja[`rank${rank}` as "rank1" | "rank11" | "rank12" | "rank13"];
  return String(rank);
}

/** A card's name in full: "queen of spades", or "スペードのクイーン" in Japanese. What a screen reader should say. */
export function cardText(card: CardId, language: Language = "en"): string {
  return fillIn(STRINGS[language].cardName, { rank: rankName(rankOf(card), language), suit: suitName(suitOf(card), language) });
}

/** A card as a corner shows it: "Q♠", "10♦". The same in every language. */
export function cardShort(card: CardId): string {
  const { rank, suit } = cardOfId(card);
  return `${RANK_DISPLAY[rank].short}${SUIT_DISPLAY[suit].symbol}`;
}

/** Cards as corners show them, with a space between: "Q♠ 10♦ A♥". */
export function cardsShort(cards: readonly CardId[]): string {
  return cards.map(cardShort).join(" ");
}

/** Names in a list: "Ann, Ben", or "Ann、Ben" in Japanese. */
export function namesList(names: readonly string[], language: Language = "en"): string {
  return names.join(STRINGS[language].listJoin);
}

/** How a move is put into words. */
export type MoveTextOptions = {
  /** English unless said. */
  language?: Language;
  /**
   * `"offer"` is a button's words for the player to move ("Play Q♠"), which is
   * what is given unless said. `"did"` is what a record says after a name
   * ("plays Q♠"). `"hidden"` is `"did"` as another player at the table saw
   * it: cards passed, given or laid away face down are counted, not named.
   */
  form?: "offer" | "did" | "hidden";
  /** The players' names by seat, for a move that names one (Go Fish's ask). A seat without a name is "Seat 2". */
  players?: readonly string[];
};

/**
 * A move in words, for any of the eleven games: `moveText("hearts", { play: "QS" })`
 * is "Play Q♠", and with `{ form: "did" }` it is "plays Q♠". `kind` is needed
 * because a bid of nought is "nil" in Spades and "0" in Oh Hell.
 */
export function moveText<K extends CardGameKind>(kind: K, move: MoveOf<K>, options: MoveTextOptions = {}): string {
  const language = options.language ?? "en";
  const form = options.form ?? "offer";
  const t = STRINGS[language];
  const say = (name: string, values: Record<string, string | number> = {}) => fillIn(t[`${form === "offer" ? "offer" : "did"}${name}` as keyof ToranpuStrings], values);
  const hid = (name: "PassCards" | "Crib" | "Give", cards: readonly CardId[]) => (form === "hidden" ? fillIn(t[`hid${name}`], { n: cards.length }) : say(name, { cards: cardsShort(cards) }));
  const given = move as Record<string, unknown>;
  const cards = (value: unknown): CardId[] => (Array.isArray(value) ? value.filter(isCard) : isCard(value) ? [value] : []);
  if (Array.isArray(given.pass)) return hid("PassCards", cards(given.pass));
  if ("crib" in given) return hid("Crib", cards(given.crib));
  if ("give" in given) return hid("Give", cards(given.give));
  if ("play" in given) {
    const suit = given.suit as CardSuit | undefined;
    return suit === undefined ? say("Play", { cards: cardsShort(cards(given.play)) }) : say("PlaySuit", { cards: cardsShort(cards(given.play)), suit: suitName(suit, language) });
  }
  if ("turn" in given) return say("Turn");
  if ("pass" in given) return say("Pass");
  if ("draw" in given) return given.draw === "discard" ? say("TakeDiscard") : say("Draw");
  if ("discard" in given) return say("Discard", { cards: cardsShort(cards(given.discard)) });
  if ("knock" in given) return say("Knock", { cards: cardsShort(cards(given.knock)) });
  if ("order" in given) return say("Order");
  if ("call" in given) return say("Call", { suit: suitName(given.call as CardSuit, language) });
  if ("bid" in given) return given.bid === 0 && kind === "spades" ? say("BidNil") : say("Bid", { n: given.bid as number });
  if ("ask" in given) {
    const seat = given.ask as number;
    const rank = given.rank as CardRank;
    return say("Ask", { player: options.players?.[seat] ?? fillIn(t.seatName, { n: seat + 1 }), rank: language === "en" ? rankWords(rank) : rankName(rank, language) });
  }
  return JSON.stringify(move);
}
