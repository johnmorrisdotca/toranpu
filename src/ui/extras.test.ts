import { describe, expect, it } from "vitest";

import { ENGLISH_PATTERN } from "../designs/english.ts";
import { EXTRA_CARDS, EXTRA_LIMITS, cardFaceSvg, faceName, isCardFace } from "./cardFaces.ts";
import { readHand } from "./layout.ts";

/**
 * THE EXTRAS OF A REAL DECK: jokers, two rules cards and a blank, which no
 * game deals but any hand on a page may hold.
 */
describe("a hand reads the extras", () => {
  it("reads JOKER as the next of red and black, up to four, beside the ids", () => {
    expect(readHand("AS KH QD JC JOKER")).toEqual(["AS", "KH", "QD", "JC", "RJ"]);
    expect(readHand("joker joker jk JOKER")).toEqual(["RJ", "BJ", "RJ", "BJ"]);
    expect(readHand("RJ BJ RJ BJ")).toEqual(["RJ", "BJ", "RJ", "BJ"]);
  });

  it("reads RULES as the two rules cards in turn, and BLANK as the blank", () => {
    expect(readHand("RULES RULES BLANK 10D")).toEqual(["R1", "R2", "BL", "TD"]);
    expect(readHand("R1 R2 BL")).toEqual(["R1", "R2", "BL"]);
  });

  it("refuses more extras than one pack holds: a fifth joker, a third rules card, a third blank", () => {
    expect(EXTRA_LIMITS).toEqual({ jokers: 4, rules: 2, blanks: 2 });
    expect(readHand("JOKER JOKER JOKER JOKER JOKER")).toBeNull();
    expect(readHand("RULES RULES RULES")).toBeNull();
    expect(readHand("BLANK BLANK BLANK")).toBeNull();
  });
});

describe("every extra is drawn and named", () => {
  it("is a card a face is drawn for, in every design, never selectable, and named in both languages", () => {
    for (const card of EXTRA_CARDS) {
      expect(isCardFace(card)).toBe(true);
      for (const design of ["plain", "four-colour", ENGLISH_PATTERN] as const) expect(cardFaceSvg(card, { design }), card).toMatch(/^<svg [^>]*user-select:none/);
      expect(faceName(card, "en")).not.toBe(card);
      expect(faceName(card, "ja")).not.toBe(faceName(card, "en"));
    }
    expect(faceName("R1")).toBe("rules card, Hearts");
    expect(faceName("BL", "ja")).toBe("白紙のカード");
  });

  it("writes a rules card's game and its rules on it, in the language asked", () => {
    expect(cardFaceSvg("R1")).toContain(">HEARTS<");
    expect(cardFaceSvg("R2")).toContain("Spades are always trumps");
    expect(cardFaceSvg("R1", { language: "ja" })).toContain(">ハーツ<");
    // The blank has nothing on it to read.
    expect(cardFaceSvg("BL")).not.toContain("<text");
  });
});
