import { describe, expect, it } from "vitest";

import { arrangeCards, mixCards, replaceCard, tossCard } from "./layout.ts";

/** A hand sorted by rank, grouped by suit, or as it was dealt; the extras last; nothing given is changed. */
describe("arrangeCards", () => {
  const dealt = ["QH", "2S", "RJ", "AH", "TC", "2H", "KS", "9D", "BL"];

  it("sorts by rank, low to high with the ace high, a rank's cards in suit order", () => {
    expect(arrangeCards(dealt, "rank")).toEqual(["2S", "2H", "9D", "TC", "QH", "KS", "AH", "RJ", "BL"]);
  });

  it("groups by suit, spades, hearts, clubs, diamonds, each in rank order", () => {
    expect(arrangeCards(dealt, "suit")).toEqual(["2S", "KS", "2H", "QH", "AH", "TC", "9D", "RJ", "BL"]);
  });

  it("keeps the order dealt, and never changes the list it was given", () => {
    const given = [...dealt];
    expect(arrangeCards(given, "dealt")).toEqual(dealt);
    arrangeCards(given, "rank");
    expect(given).toEqual(dealt);
  });

  it("is stable: the extras keep the order they were dealt in, and two jokers too", () => {
    expect(arrangeCards(["BJ", "3S", "RJ", "R2", "R1"], "suit")).toEqual(["3S", "BJ", "RJ", "R2", "R1"]);
  });
});

describe("mixCards, tossCard and replaceCard", () => {
  it("mixes into another order of the same cards, never the one given, and leaves alone a hand that cannot change", () => {
    let seed = 1;
    const random = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
    const hand = ["AS", "KH", "QD", "JC", "TS"];
    for (let round = 0; round < 50; round++) {
      const mixed = mixCards(hand, random);
      expect(mixed).not.toEqual(hand);
      expect([...mixed].sort()).toEqual([...hand].sort());
    }
    expect(mixCards(["AS"])).toEqual(["AS"]);
    expect(mixCards(["RJ", "RJ"])).toEqual(["RJ", "RJ"]);
  });

  it("tosses the first of a card out, and nothing for a card not held", () => {
    expect(tossCard(["AS", "RJ", "KH", "RJ"], "RJ")).toEqual(["AS", "KH", "RJ"]);
    expect(tossCard(["AS"], "KH")).toEqual(["AS"]);
  });

  it("replaces a card, the new one at the end unless asked for the front", () => {
    expect(replaceCard(["AS", "KH", "QD"], "KH", "2C")).toEqual(["AS", "QD", "2C"]);
    expect(replaceCard(["AS", "KH", "QD"], "KH", "2C", "front")).toEqual(["2C", "AS", "QD"]);
    expect(replaceCard(["AS"], "KH", "2C")).toEqual(["AS"]);
  });
});
