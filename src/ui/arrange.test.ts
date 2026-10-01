import { describe, expect, it } from "vitest";

import { arrangeCards, handLayout, mixCards, partedHandLayout, replaceCard, tossCard } from "./layout.ts";

/** A hand sorted by rank, grouped by suit, or as it was dealt; the extras last; nothing given is changed. */
describe("arrangeCards", () => {
  const dealt = ["QH", "2S", "RJ", "AH", "TC", "2H", "KS", "9D", "BL"];

  it("sorts by rank, low to high with the ace high, a rank's cards in suit order", () => {
    expect(arrangeCards(dealt, "rank")).toEqual(["2S", "2H", "9D", "TC", "QH", "KS", "AH", "RJ", "BL"]);
  });

  it("groups by suit, spades, hearts, clubs, diamonds, each in rank order", () => {
    expect(arrangeCards(dealt, "suit")).toEqual(["2S", "KS", "2H", "QH", "AH", "TC", "9D", "RJ", "BL"]);
  });

  it("groups the number cards, ace to ten, apart from the face cards, each in rank order", () => {
    expect(arrangeCards(dealt, "face")).toEqual(["AH", "2S", "2H", "9D", "TC", "QH", "KS", "RJ", "BL"]);
    expect(arrangeCards(["KD", "JS", "AS", "QC", "AH"], "face")).toEqual(["AS", "AH", "JS", "QC", "KD"]);
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

/** A hand parted at one card: that card clear of the rest, the others drawn into a group on each side. */
describe("partedHandLayout", () => {
  const widest = (places: { x: number }[]) => Math.max(...places.map((place) => place.x));

  it("lifts the parted card upright, a whole card and the gap clear of each neighbour", () => {
    const parted = partedHandLayout(7, 3);
    expect(parted[3]!.x - parted[2]!.x).toBeCloseTo(1.12);
    expect(parted[3]).toMatchObject({ y: -0.2, rotate: 0 });
    expect(parted[4]!.x - parted[3]!.x).toBeCloseTo(1.12);
  });

  it("closes each group up so that a long hand keeps the room its fan takes", () => {
    expect(widest(partedHandLayout(13, 6))).toBeCloseTo(widest(handLayout(13)), 3);
    const inside = partedHandLayout(13, 6);
    expect(inside[1]!.x - inside[0]!.x).toBeLessThan(handLayout(13)[1]!.x);
  });

  it("parts a first or last card into two groups, and a short hand takes a little more room", () => {
    const first = partedHandLayout(5, 0);
    expect(first[1]!.x).toBeCloseTo(1.12);
    const last = partedHandLayout(5, 4);
    expect(last[4]!.x - last[3]!.x).toBeCloseTo(1.12);
    expect(widest(partedHandLayout(3, 1))).toBeGreaterThan(widest(handLayout(3)));
  });

  it("is the fan itself where the card is not in the hand", () => {
    expect(partedHandLayout(5, 9)).toEqual(handLayout(5));
    expect(partedHandLayout(5, -1)).toEqual(handLayout(5));
  });
});
