import { describe, expect, it } from "vitest";

import { FULL_DECK } from "../games/cards.ts";
import { writeCards, freshDeck } from "../cards/deck.ts";
import { defineToranpuElements, ToranpuCard } from "../element.ts";
import { handLayout, pileLayout, readHand } from "./layout.ts";

describe("a hand's layout", () => {
  it("fans open: each card a step along, the ends turned and dipped, the middle level", () => {
    const fan = handLayout(5);
    expect(fan.map((place) => place.x)).toEqual([0, 0.42, 0.84, 1.26, 1.68]);
    expect(fan.map((place) => place.rotate)).toEqual([-8, -4, 0, 4, 8]);
    expect(fan[2]?.y).toBe(0);
    expect(fan[0]?.y).toBeGreaterThan(0);
    expect(fan[0]?.y).toBe(fan[4]?.y);
  });

  it("squares up when closed, so only the top card shows and a sliver of each under it", () => {
    const shut = handLayout(5, { open: 0 });
    expect(shut.map((place) => place.x)).toEqual([0, 0.04, 0.08, 0.12, 0.16]);
    for (const place of shut) expect([place.rotate, place.y]).toEqual([0, 0]);
    const half = handLayout(5, { open: 0.5 });
    expect(half[4]?.x).toBeGreaterThan(shut[4]?.x as number);
    expect(half[4]?.x).toBeLessThan(handLayout(5)[4]?.x as number);
  });

  it("turns at most forty degrees, whatever the hand, and takes a step and a turn of its own", () => {
    const big = handLayout(20);
    expect(big[0]?.rotate).toBe(-20);
    expect(big[19]?.rotate).toBe(20);
    expect(handLayout(3, { step: 1, turn: 0 }).map((place) => [place.x, place.rotate])).toEqual([[0, 0], [1, 0], [2, 0]]);
  });

  it("lays out nothing for no cards, one card flat, and refuses nonsense quietly", () => {
    expect(handLayout(0)).toEqual([]);
    expect(handLayout(1)).toEqual([{ x: 0, y: 0, rotate: 0 }]);
    expect(handLayout(Number.NaN)).toEqual([]);
    expect(handLayout(3, { open: Number.NaN })).toEqual(handLayout(3));
    expect(handLayout(3, { open: 7 })).toEqual(handLayout(3));
  });
});

describe("a pile's layout", () => {
  it("is the same pile every time for the same seed, and another for another", () => {
    expect(pileLayout(8, { seed: 7, messiness: 0.6 })).toEqual(pileLayout(8, { seed: 7, messiness: 0.6 }));
    expect(pileLayout(8, { seed: 7, messiness: 0.6 })).not.toEqual(pileLayout(8, { seed: 8, messiness: 0.6 }));
  });

  it("at no messiness is a neat stack: nothing turned, each card a card's thickness over the one under it", () => {
    const neat = pileLayout(5, { messiness: 0 });
    for (const place of neat) expect(place.rotate).toBe(0);
    expect(neat.map((place) => place.y)).toEqual([0.048, 0.036, 0.024, 0.012, 0]);
  });

  it("gets messier as asked, never turning a card more than fourteen degrees", () => {
    const spread = (mess: number) => Math.max(...pileLayout(30, { messiness: mess, seed: 3, depth: 30 }).map((place) => Math.abs(place.rotate)));
    expect(spread(0.2)).toBeLessThan(spread(0.6));
    expect(spread(0.6)).toBeLessThan(spread(1));
    expect(spread(1)).toBeLessThanOrEqual(14);
  });

  it("draws no deeper than asked, and a card keeps its place when another lands on it", () => {
    expect(pileLayout(52)).toHaveLength(11);
    expect(pileLayout(52, { depth: 3 })).toHaveLength(4);
    const before = pileLayout(4, { seed: 9, messiness: 0.7, depth: 10 });
    const after = pileLayout(5, { seed: 9, messiness: 0.7, depth: 10 });
    // The same cards, one card further from the top each: only their thickness changes, never their nudge.
    before.forEach((place, at) => {
      expect(place.rotate).toBe(after[at]?.rotate);
      expect(Math.abs((after[at]?.x as number) - place.x - 0.0072)).toBeLessThan(0.002);
    });
    expect(pileLayout(0)).toEqual([]);
  });
});

describe("a hand written as text", () => {
  it("reads ids separated by spaces or commas, ten as T or 10, the jokers too", () => {
    expect(readHand("AS KH 10D, tc RJ")).toEqual(["AS", "KH", "TD", "TC", "RJ"]);
    expect(readHand("  ")).toEqual([]);
    expect(readHand(null)).toEqual([]);
  });

  it("reads the deck's one-letter codes", () => {
    expect(readHand(writeCards(freshDeck()))).toEqual([...FULL_DECK]);
  });

  it("refuses what is neither", () => {
    for (const bad of ["AS KX", "1S", "AS!", "<b>"]) expect(readHand(bad), bad).toBeNull();
  });
});

describe("the elements on a server", () => {
  it("import without a DOM, and registering them does nothing there", () => {
    expect(typeof ToranpuCard).toBe("function");
    expect(() => defineToranpuElements()).not.toThrow();
  });
});
