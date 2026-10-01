import { describe, expect, it } from "vitest";

import { CARD_BACKS, CARD_BACK_LOOK, cardBackSvg, cardBackUrl } from "./cardBacks.ts";
import { isColour } from "./svg.ts";

/** Every tag opened is closed, in order: enough to know the drawing is well formed without a browser. */
function wellFormed(svg: string): boolean {
  const open: string[] = [];
  for (const [, closing, name, , selfClosing] of svg.matchAll(/<(\/?)([a-zA-Z]+)((?:\s+[a-zA-Z:-]+="[^"]*")*)\s*(\/?)>/g)) {
    if (selfClosing === "/") continue;
    if (closing === "/") {
      if (open.pop() !== name) return false;
    } else open.push(name as string);
  }
  return open.length === 0 && !/<[^>]*<|&(?!amp;|lt;|gt;|quot;|#39;)/.test(svg);
}

describe("the card backs", () => {
  it("are three, each a whole SVG in the card's box, well formed and with the back's own colours", () => {
    expect(CARD_BACKS).toEqual(["classic-red", "classic-blue", "ink-dots"]);
    for (const name of CARD_BACKS) {
      const svg = cardBackSvg(name);
      expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"'), name).toBe(true);
      expect(wellFormed(svg), name).toBe(true);
      expect(svg, name).toContain(`var(--toranpu-back,${CARD_BACK_LOOK[name].field})`);
      expect(svg, name).toContain('aria-hidden="true"');
    }
  });

  it("draw the classic red for a name they do not know, and for none", () => {
    expect(cardBackSvg("tartan")).toBe(cardBackSvg("classic-red"));
    expect(cardBackSvg()).toBe(cardBackSvg("classic-red"));
  });

  it("take a colour, an ink and a paper, and refuse anything that is not a colour", () => {
    const svg = cardBackSvg("ink-dots", { colour: "#8f2826", ink: "rgb(240, 230, 210)", paper: "ivory" });
    expect(svg).toContain('fill="#8f2826"');
    expect(svg).toContain('fill="rgb(240, 230, 210)"');
    expect(svg).toContain('fill="ivory"');
    expect(svg).not.toContain("var(--toranpu-back,");
    const sneaky = cardBackSvg("classic-blue", { colour: '"/><script>alert(1)</script>' });
    expect(sneaky).not.toContain("<script");
    expect(sneaky).toContain("var(--toranpu-back,#1f4e8c)");
    for (const good of ["#abc", "#aabbccdd", "navy", "hsl(10 50% 40%)", "oklch(0.5 0.1 30)"]) expect(isColour(good), good).toBe(true);
    for (const bad of ["", "url(#x)", "red;fill:blue", "var(--x)", "#12", 7, null]) expect(isColour(bad), String(bad)).toBe(false);
  });

  it("give each set of colours its own pattern, so two backs on one page never share one by mistake", () => {
    const id = (svg: string) => /pattern id="([^"]+)"/.exec(svg)?.[1];
    expect(id(cardBackSvg("classic-red"))).toBe(id(cardBackSvg("classic-red")));
    expect(id(cardBackSvg("classic-red"))).not.toBe(id(cardBackSvg("classic-blue")));
    expect(id(cardBackSvg("ink-dots", { colour: "#8f2826" }))).not.toBe(id(cardBackSvg("ink-dots", { colour: "#3d4d38" })));
  });

  it("put words in the middle, escaped, in place of the ornament", () => {
    const svg = cardBackSvg("ink-dots", { mark: "五つ" });
    expect(svg).toContain(">五つ</text>");
    expect(cardBackSvg("classic-red", { mark: "<b>&" })).toContain(">&lt;b&gt;&amp;</text>");
    expect(cardBackSvg("classic-red", { mark: "   " })).toBe(cardBackSvg("classic-red"));
    expect(wellFormed(cardBackSvg("classic-blue", { mark: "Itsutsu & co" }))).toBe(true);
  });

  it("take a size and a name for screen readers", () => {
    expect(cardBackSvg("classic-blue", { width: 70 })).toContain('width="70" height="98"');
    expect(cardBackSvg("classic-blue", { width: -3 })).toContain('viewBox="0 0 100 140" aria-hidden');
    const named = cardBackSvg("classic-blue", { title: 'A card, face "down"' });
    expect(named).toContain('role="img" aria-label="A card, face &quot;down&quot;"');
    expect(named).not.toContain("aria-hidden");
  });

  it("come as a data URL holding the same drawing", () => {
    const url = cardBackUrl("ink-dots", { mark: "一つ" });
    expect(url.startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
    expect(decodeURIComponent(url.slice(url.indexOf(",") + 1))).toBe(cardBackSvg("ink-dots", { mark: "一つ" }));
  });

  it("are small", () => {
    for (const name of CARD_BACKS) expect(cardBackSvg(name).length, name).toBeLessThan(5000);
  });
});
