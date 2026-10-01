import { describe, expect, it } from "vitest";

import { CARD_GAME_LIST, CARD_GAME_TABLES } from "./games/cardGames.constants.ts";
import { FULL_DECK, cardWords } from "./games/cards.ts";
import { newGame, playComputers } from "./play.ts";
import { STRINGS, fillIn, languageOf } from "./strings.ts";
import { cardShort, cardText, cardsShort, gameName, gameSays, moveText, namesList, rankName, suitName, suitSymbol } from "./words.ts";

describe("the games in words", () => {
  it("names every game in both languages", () => {
    expect(CARD_GAME_LIST.map((kind) => gameName(kind))).toEqual(["Hearts", "Spades", "Euchre", "Cribbage", "Oh Hell", "Crazy Eights", "Go Fish", "Big Two", "President", "Gin Rummy", "War"]);
    expect(CARD_GAME_LIST.map((kind) => gameName(kind, "ja"))).toEqual(["ハーツ", "スペード", "ユーカー", "クリベッジ", "オー・ヘル", "クレイジーエイト", "ゴーフィッシュ", "ビッグツー", "大富豪", "ジン・ラミー", "戦争"]);
    for (const kind of CARD_GAME_LIST) for (const language of ["en", "ja"] as const) expect(gameSays(kind, language).length).toBeGreaterThan(20);
  });
});

describe("the cards in words", () => {
  it("names a card in full and in short", () => {
    expect(cardText("QS")).toBe("queen of spades");
    expect(cardText("TD")).toBe("ten of diamonds");
    expect(cardText("QS", "ja")).toBe("スペードのクイーン");
    expect(cardText("TD", "ja")).toBe("ダイヤの10");
    expect(cardText("AH", "ja")).toBe("ハートのエース");
    expect(cardShort("QS")).toBe("Q♠");
    expect(cardShort("TD")).toBe("10♦");
    expect(cardsShort(["AH", "2C"])).toBe("A♥ 2♣");
  });

  it("the English names are the ones the games already said", () => {
    for (const card of FULL_DECK) expect(cardText(card)).toBe(cardWords(card));
  });

  it("suits, ranks and lists", () => {
    expect((["S", "H", "D", "C"] as const).map((suit) => suitName(suit))).toEqual(["spades", "hearts", "diamonds", "clubs"]);
    expect((["S", "H", "D", "C"] as const).map((suit) => suitName(suit, "ja"))).toEqual(["スペード", "ハート", "ダイヤ", "クラブ"]);
    expect((["S", "H", "D", "C"] as const).map(suitSymbol)).toEqual(["♠", "♥", "♦", "♣"]);
    expect([1, 7, 11, 12, 13].map((rank) => rankName(rank as 1))).toEqual(["ace", "seven", "jack", "queen", "king"]);
    expect([1, 7, 11, 12, 13].map((rank) => rankName(rank as 1, "ja"))).toEqual(["エース", "7", "ジャック", "クイーン", "キング"]);
    expect(namesList(["Ann", "Ben"])).toBe("Ann, Ben");
    expect(namesList(["Ann", "Ben"], "ja")).toBe("Ann、Ben");
  });
});

describe("a move in words", () => {
  it("as a button offers it", () => {
    expect(moveText("hearts", { play: "QS" })).toBe("Play Q♠");
    expect(moveText("hearts", { pass: ["QS", "AH", "KH"] })).toBe("Pass Q♠ A♥ K♥");
    expect(moveText("spades", { bid: 0 })).toBe("Bid nil");
    expect(moveText("ohHell", { bid: 0 })).toBe("Bid 0");
    expect(moveText("spades", { bid: 4 })).toBe("Bid 4");
    expect(moveText("euchre", { order: true })).toBe("Order it up");
    expect(moveText("euchre", { pass: true })).toBe("Pass");
    expect(moveText("euchre", { call: "H" })).toBe("Call hearts");
    expect(moveText("euchre", { discard: "9C" })).toBe("Discard 9♣");
    expect(moveText("cribbage", { crib: ["5H", "KD"] })).toBe("Lay 5♥ K♦ in the crib");
    expect(moveText("crazyEights", { play: "8S", suit: "D" })).toBe("Play 8♠, calling diamonds");
    expect(moveText("crazyEights", { draw: true })).toBe("Draw");
    expect(moveText("goFish", { ask: 1, rank: 7 }, { players: ["You", "Aiko"] })).toBe("Ask Aiko for sevens");
    expect(moveText("goFish", { ask: 1, rank: 6 })).toBe("Ask Seat 2 for sixes");
    expect(moveText("bigTwo", { play: ["3D", "3C"] })).toBe("Play 3♦ 3♣");
    expect(moveText("president", { give: ["2S", "AS"] })).toBe("Give 2♠ A♠");
    expect(moveText("ginRummy", { draw: "stock" })).toBe("Draw");
    expect(moveText("ginRummy", { draw: "discard" })).toBe("Take the discard");
    expect(moveText("ginRummy", { knock: "KD" })).toBe("Knock, discarding K♦");
  });

  it("as a record says it, and as the rest of the table saw it", () => {
    expect(moveText("hearts", { play: "QS" }, { form: "did" })).toBe("plays Q♠");
    expect(moveText("hearts", { pass: ["QS", "AH", "KH"] }, { form: "did" })).toBe("passes Q♠ A♥ K♥");
    expect(moveText("hearts", { pass: ["QS", "AH", "KH"] }, { form: "hidden" })).toBe("passes cards: 3");
    expect(moveText("cribbage", { crib: ["5H", "KD"] }, { form: "hidden" })).toBe("lays cards in the crib: 2");
    expect(moveText("president", { give: ["2S"] }, { form: "hidden" })).toBe("gives cards: 1");
    expect(moveText("hearts", { play: "QS" }, { form: "hidden" })).toBe("plays Q♠");
    expect(moveText("spades", { bid: 0 }, { form: "did" })).toBe("bids nil");
  });

  it("in Japanese", () => {
    expect(moveText("hearts", { play: "QS" }, { language: "ja" })).toBe("Q♠を出す");
    expect(moveText("hearts", { play: "QS" }, { language: "ja", form: "did" })).toBe("Q♠を出しました");
    expect(moveText("hearts", { pass: ["QS", "AH", "KH"] }, { language: "ja", form: "hidden" })).toBe("カードを3枚渡しました");
    expect(moveText("crazyEights", { play: "8S", suit: "D" }, { language: "ja" })).toBe("8♠を出してダイヤを指定する");
    expect(moveText("goFish", { ask: 1, rank: 12 }, { language: "ja", players: ["あなた", "愛子"] })).toBe("愛子にクイーンを聞く");
    expect(moveText("goFish", { ask: 1, rank: 7 }, { language: "ja" })).toBe("席2に7を聞く");
    expect(moveText("spades", { bid: 0 }, { language: "ja" })).toBe("ニルをビッドする");
  });

  it.each(CARD_GAME_LIST)("%s: every move a whole game makes has words, in every form and both languages", (kind) => {
    const players = Array.from({ length: CARD_GAME_TABLES[kind].defaultPlayers }, (_, seat) => `P${seat}`);
    const { moves } = playComputers(kind, newGame(kind, { players, seed: 9, computers: players.map(() => true) })!);
    for (const move of moves) {
      for (const language of ["en", "ja"] as const) {
        for (const form of ["offer", "did", "hidden"] as const) {
          const text = moveText(kind, move as never, { language, form, players });
          expect(text.startsWith("{"), `${JSON.stringify(move)} has no words`).toBe(false);
          expect(text).not.toMatch(/\{\w+\}/);
        }
      }
    }
  });
});

describe("the table of strings", () => {
  it("has a Japanese line for every English one, and keeps every place to fill in", () => {
    expect(Object.keys(STRINGS.ja)).toEqual(Object.keys(STRINGS.en));
    const places = (text: string) => [...new Set([...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]))].sort();
    for (const key of Object.keys(STRINGS.en) as (keyof typeof STRINGS.en)[]) {
      expect(places(STRINGS.ja[key]), key).toEqual(places(STRINGS.en[key]));
      expect(STRINGS.ja[key].trim(), key).not.toBe("");
    }
  });

  it("fills in, and tells Japanese from the rest", () => {
    expect(fillIn("Bid {n}", { n: 3 })).toBe("Bid 3");
    expect(fillIn("{a} and {b}", { a: "x" })).toBe("x and {b}");
    expect([languageOf("ja-JP"), languageOf("JA"), languageOf("en-US"), languageOf("fr"), languageOf(null), languageOf(undefined)]).toEqual(["ja", "ja", "en", "en", "en", "en"]);
  });
});
