import { describe, expect, it } from "vitest";

import { cardFromId, cardIndex } from "../../cards/deck.ts";
import { allFaceUp, dealKlondike, dealOfSeed, deckOf, decodeMoves, encodeMoves, fitsColumn, klondikeWon, playKlondike, rankOf, recyclesLeft } from "../../klondike.ts";
import type { KlondikeColumn, KlondikeMove, KlondikeTable } from "../../klondike.ts";

const card = (id: string) => cardIndex(cardFromId(id)!);
const column = (down: number, ...ids: string[]): KlondikeColumn => ({ down, cards: ids.map(card) });
const empty: KlondikeColumn = { down: 0, cards: [] };
const carry = (from: string, to: string): KlondikeMove => ({ kind: "carry", from, to }) as KlondikeMove;

/** A table laid out by hand: the columns given (the rest empty), and nothing in the stock or home unless said. */
function table(columns: KlondikeColumn[], extra: Partial<KlondikeTable> = {}): KlondikeTable {
  return {
    rules: { draw: 1, passes: Infinity },
    tableau: [...columns, ...Array.from({ length: 7 - columns.length }, () => empty)],
    stock: [],
    waste: [],
    foundation: [0, 0, 0, 0],
    recycles: 0,
    ...extra,
  };
}

describe("Klondike's deal", () => {
  it("lays one to seven cards in the columns, the top of each face up, and the other twenty-four in the stock", () => {
    const dealt = dealKlondike(deckOf(dealOfSeed(12))!, { draw: 1, passes: Infinity });
    expect(dealt.tableau.map((each) => each.cards.length)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(dealt.tableau.map((each) => each.down)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(dealt.stock).toHaveLength(24);
    const every = [...dealt.tableau.flatMap((each) => each.cards), ...dealt.stock];
    expect(new Set(every).size).toBe(52);
  });

  it("deals along each row, as a dealer does: the first card to the first column, the second to the second", () => {
    const deck = deckOf(dealOfSeed(3))!;
    const dealt = dealKlondike(deck, { draw: 1, passes: Infinity });
    expect(dealt.tableau[0].cards[0]).toBe(deck[0]);
    expect(dealt.tableau[1].cards[0]).toBe(deck[1]);
    expect(dealt.tableau[6].cards[0]).toBe(deck[6]);
    expect(dealt.tableau[1].cards[1]).toBe(deck[7]);
    // The stock's next card to turn is the first card left after the deal.
    expect(dealt.stock.at(-1)).toBe(deck[28]);
  });
});

describe("Klondike's moves", () => {
  it("builds a column down in alternating colours, and only a King fills an empty one", () => {
    const onto = column(0, "8S");
    expect(fitsColumn(card("7H"), onto)).toBe(true);
    expect(fitsColumn(card("7D"), onto)).toBe(true);
    expect(fitsColumn(card("7C"), onto)).toBe(false);
    expect(fitsColumn(card("6H"), onto)).toBe(false);
    expect(fitsColumn(card("KH"), empty)).toBe(true);
    expect(fitsColumn(card("QH"), empty)).toBe(false);
  });

  it("carries a whole run onto a column, and turns over the card it uncovers", () => {
    const start = table([column(1, "2C", "9H", "8S", "7D"), column(0, "TC")]);
    const after = playKlondike(start, carry("1", "2"))!;
    expect(after.tableau[1].cards).toEqual(["TC", "9H", "8S", "7D"].map(card));
    expect(after.tableau[0]).toEqual({ down: 0, cards: [card("2C")] });
    // The table it came from is left alone.
    expect(start.tableau[0].cards).toHaveLength(4);
  });

  it("carries only the part of a run that fits, which is the one card one below the target", () => {
    const after = playKlondike(table([column(0, "9H", "8S", "7D"), column(0, "9D")]), carry("1", "2"))!;
    expect(after.tableau[0].cards).toEqual([card("9H")]);
    expect(after.tableau[1].cards).toEqual(["9D", "8S", "7D"].map(card));
  });

  it("sends a top card home only onto its own suit, from the Ace up, and brings it back down onto a column", () => {
    const start = table([column(0, "AH"), column(0, "3C")], { foundation: [0, 0, 0, 0] });
    expect(playKlondike(start, carry("1", "S"))).toBeNull();
    const home = playKlondike(start, carry("1", "H"))!;
    expect(home.foundation).toEqual([0, 1, 0, 0]);
    const two = table([column(0, "2H"), column(0, "3C")], { foundation: [0, 1, 0, 0] });
    const up = playKlondike(two, carry("1", "H"))!;
    expect(up.foundation[1]).toBe(2);
    const down = playKlondike(up, carry("H", "2"))!;
    expect(down.foundation[1]).toBe(1);
    expect(down.tableau[1].cards.map(rankOf)).toEqual([3, 2]);
  });

  it("turns one card or three from the stock, and turns the waste back only as the passes allow", () => {
    const deck = deckOf(dealOfSeed(5))!;
    const three = dealKlondike(deck, { draw: 3, passes: 1 });
    const turned = playKlondike(three, { kind: "draw" })!;
    expect(turned.waste).toHaveLength(3);
    // The last card turned is on top: the third from the stock's top.
    expect(turned.waste.at(-1)).toBe(three.stock.at(-3));
    let run = turned;
    while (run.stock.length > 0) run = playKlondike(run, { kind: "draw" })!;
    expect(run.waste).toHaveLength(24);
    expect(recyclesLeft(run)).toBe(0);
    expect(playKlondike(run, { kind: "recycle" })).toBeNull();

    const passes = dealKlondike(deck, { draw: 1, passes: 3 });
    let cycled = passes;
    for (let round = 0; round < 2; round += 1) {
      while (cycled.stock.length > 0) cycled = playKlondike(cycled, { kind: "draw" })!;
      cycled = playKlondike(cycled, { kind: "recycle" })!;
      expect(cycled.stock).toEqual(passes.stock);
    }
    while (cycled.stock.length > 0) cycled = playKlondike(cycled, { kind: "draw" })!;
    expect(playKlondike(cycled, { kind: "recycle" })).toBeNull();
  });

  it("refuses what the rules do not allow", () => {
    const start = table([column(0, "8S"), column(0, "8H")]);
    expect(playKlondike(start, carry("1", "2"))).toBeNull();
    expect(playKlondike(start, carry("1", "1"))).toBeNull();
    expect(playKlondike(start, carry("w", "1"))).toBeNull();
    expect(playKlondike(start, { kind: "draw" })).toBeNull();
    expect(playKlondike(start, carry("1", "w"))).toBeNull();
  });

  it("knows a game won, and a table whose every card is face up", () => {
    expect(klondikeWon(table([], { foundation: [13, 13, 13, 13] }))).toBe(true);
    expect(allFaceUp(table([column(0, "KS")]))).toBe(true);
    expect(allFaceUp(table([column(1, "KS", "QH")]))).toBe(false);
  });
});

describe("a game written down", () => {
  it("reads its moves back exactly, and refuses one that is not written as a move", () => {
    const moves: KlondikeMove[] = [{ kind: "draw" }, carry("w", "3"), carry("7", "H"), { kind: "recycle" }, carry("S", "1")];
    expect(encodeMoves(moves)).toBe("dw37Hr" + "S1");
    expect(decodeMoves(encodeMoves(moves))).toEqual(moves);
    expect(decodeMoves("w")).toBeNull();
    expect(decodeMoves("x1")).toBeNull();
  });
});
