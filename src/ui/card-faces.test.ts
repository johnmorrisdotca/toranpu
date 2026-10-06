import { describe, expect, it } from "vitest";

import { FULL_DECK } from "../games/cards.ts";
import { ENGLISH_PATTERN } from "../designs/english.ts";
import { CARD_DESIGNS, JOKERS, cardFaceSvg, cardFaceUrl, faceName, isCardFace, loadCardDesign, pipPlaces } from "./card-faces.ts";

const EVERY = [...FULL_DECK, ...JOKERS];

/** Every tag opened is closed, in order. */
function wellFormed(svg: string): boolean {
  const open: string[] = [];
  for (const [, closing, name, , selfClosing] of svg.matchAll(/<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z:-]+="[^"]*")*)\s*(\/?)>/g)) {
    if (selfClosing === "/") continue;
    if (closing === "/") {
      if (open.pop() !== name) return false;
    } else open.push(name as string);
  }
  return open.length === 0;
}

describe("the card faces", () => {
  it("are drawn for all fifty-two cards and both jokers in every design, well formed, in the card's box", () => {
    expect(EVERY).toHaveLength(54);
    for (const design of ["plain", "four-colour", ENGLISH_PATTERN] as const) {
      for (const card of EVERY) {
        const svg = cardFaceSvg(card, { design }) as string;
        expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"'), card).toBe(true);
        expect(wellFormed(svg), `${card} ${typeof design === "string" ? design : design.name}`).toBe(true);
      }
    }
  });

  it("refuse what is not a card", () => {
    for (const bad of ["", "1S", "QX", "XJ", "QSS", "rj"]) {
      expect(isCardFace(bad), bad).toBe(false);
      expect(cardFaceSvg(bad), bad).toBeNull();
      expect(cardFaceUrl(bad), bad).toBeNull();
    }
  });

  it("lay the pips as a real deck does: as many as the card is worth, the lower half upside down", () => {
    for (let count = 1; count <= 10; count++) {
      const places = pipPlaces(count);
      expect(places, String(count)).toHaveLength(count);
      for (const pip of places) expect(pip.down).toBe(pip.y > 70);
      // Never two pips in one place, and every one inside the card.
      expect(new Set(places.map((pip) => `${pip.x},${pip.y}`)).size).toBe(count);
      for (const pip of places) expect(pip.x > 20 && pip.x < 80 && pip.y > 20 && pip.y < 120).toBe(true);
    }
    const nine = (cardFaceSvg("9H") as string).match(/<path d="M50 90C28/g) ?? [];
    expect(nine.length).toBe(9 + 2);
  });

  it("colour the suits: red and black, or four colours", () => {
    expect(cardFaceSvg("TD")).toContain("var(--toranpu-card-red,#c2272d)");
    expect(cardFaceSvg("TC")).toContain("var(--toranpu-card-ink,#1b1b1b)");
    expect(cardFaceSvg("TD", { design: "four-colour" })).toContain("var(--toranpu-card-blue,#1f5fbf)");
    expect(cardFaceSvg("TC", { design: "four-colour" })).toContain("var(--toranpu-card-green,#1f7a3a)");
    expect(cardFaceSvg("TH", { design: "four-colour" })).toContain("var(--toranpu-card-red,#c2272d)");
  });

  it("say the card's name to a screen reader, in either language, or nothing when asked", () => {
    expect(cardFaceSvg("QS")).toContain('role="img" aria-label="queen of spades"');
    expect(cardFaceSvg("QS", { language: "ja" })).toContain('aria-label="スペードのクイーン"');
    expect(cardFaceSvg("RJ")).toContain('aria-label="red joker"');
    expect(cardFaceSvg("BJ", { language: "ja" })).toContain('aria-label="黒のジョーカー"');
    expect(cardFaceSvg("QS", { title: "" })).toContain('aria-hidden="true"');
    expect(cardFaceSvg("QS", { title: 'a "card"' })).toContain('aria-label="a &quot;card&quot;"');
    expect([faceName("TD"), faceName("RJ", "ja")]).toEqual(["ten of diamonds", "赤のジョーカー"]);
  });

  it("write a joker's corner word in the language asked for, the long mark standing upright", () => {
    expect(cardFaceSvg("RJ")).toContain(">J</text>");
    const ja = cardFaceSvg("RJ", { language: "ja", design: ENGLISH_PATTERN }) as string;
    expect(ja).toContain(">ジ</text>");
    expect(ja).toMatch(/transform="rotate\(90 10 [\d.]+\)"[^>]*>ー<\/text>/);
  });

  it("fit the English pattern to the card's box, every card of it with ids of its own", () => {
    expect(Object.keys(ENGLISH_PATTERN.art).sort()).toEqual([...EVERY].sort());
    expect(ENGLISH_PATTERN.box).toEqual([360, 540]);
    expect(cardFaceSvg("KS", { design: ENGLISH_PATTERN })).toContain('<g transform="translate(3.333 0) scale(0.25926)">');
    const ids = Object.values(ENGLISH_PATTERN.art).flatMap((art) => [...art.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^tp-en-/);
  });

  it("draw a card plain where a design has no drawing for it", () => {
    const partial = { name: "two", box: [100, 140] as const, art: { AS: '<circle cx="50" cy="70" r="9"/>' } };
    expect(cardFaceSvg("AS", { design: partial })).toContain('<circle cx="50" cy="70" r="9"/>');
    expect(cardFaceSvg("KH", { design: partial })).toBe(cardFaceSvg("KH"));
  });

  it("load the English pattern and the realistic design by name, and need no loading for the two drawn here", async () => {
    expect(CARD_DESIGNS).toEqual(["plain", "four-colour", "english", "realistic"]);
    expect(await loadCardDesign("english")).toBe(ENGLISH_PATTERN);
    const realistic = await loadCardDesign("realistic");
    expect(realistic?.name).toBe("realistic");
    // Knoll's own cards from his set; his ace of spades and the courts from Fomin's, through the fallback.
    expect(cardFaceSvg("7H", { design: realistic! })).not.toBe(cardFaceSvg("7H", { design: ENGLISH_PATTERN }));
    expect(cardFaceSvg("7H", { design: realistic! })).not.toBe(cardFaceSvg("7H"));
    for (const card of ["AS", "KD", "QC", "JH", "RJ"]) expect(cardFaceSvg(card, { design: realistic! }), card).toBe(cardFaceSvg(card, { design: ENGLISH_PATTERN }));
    expect(await loadCardDesign("plain")).toBeNull();
    expect(await loadCardDesign("nonsense")).toBeNull();
  });

  it("take a size, and come as a data URL", () => {
    expect(cardFaceSvg("2C", { width: 50 })).toContain('width="50" height="70"');
    const url = cardFaceUrl("2C") as string;
    expect(decodeURIComponent(url.slice(url.indexOf(",") + 1))).toBe(cardFaceSvg("2C"));
  });

  it("are small, drawn plain", () => {
    for (const card of EVERY) expect((cardFaceSvg(card) as string).length, card).toBeLessThan(6000);
  });
});
