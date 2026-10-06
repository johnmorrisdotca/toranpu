import { describe, expect, it } from "vitest";

import { CARD_BACKS, cardBackSvg } from "./card-backs.ts";
import { ENGLISH_PATTERN } from "../designs/english.ts";
import { cardFaceSvg } from "./card-faces.ts";

/**
 * A CARD IS NEVER TEXT TO SELECT. A drag across a hand, or a long press on a phone, must never
 * highlight a card's letters and pips: every drawing carries `user-select: none` on its root, and
 * every element its host (`unselectable.elements.test.js`).
 */
describe("a card's letters cannot be selected", () => {
  it("in every face, of every design, and every back", () => {
    for (const design of ["plain", "four-colour", ENGLISH_PATTERN] as const) {
      for (const id of ["AS", "KH", "QD", "JC", "TS", "2H", "RJ", "BJ"]) expect(cardFaceSvg(id, { design }), `${typeof design === "string" ? design : "english"} ${id}`).toMatch(/^<svg [^>]*style="user-select:none;-webkit-user-select:none"/);
    }
    for (const back of CARD_BACKS) expect(cardBackSvg(back)).toMatch(/^<svg [^>]*style="user-select:none;-webkit-user-select:none"/);
  });

});
