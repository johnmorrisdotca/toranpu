import { afterEach, describe, expect, it } from "vitest";

import { cardBackNames, cardBackSvg, cardBackUrl } from "./cardBacks.ts";
import { cardFaceFromArt, cardFaceSvg, faceName, isCardFace, loadCardDesign } from "./cardFaces.ts";
import type { CardDesign } from "./cardFaces.types.ts";
import { cleanMarkup, safeImageUrl } from "./markup.ts";
import { readHand } from "./layout.ts";
import { customCardKnown, registerBack, registerDesign, registeredBack, registeredBackNames, registeredDesign, registeredDesignNames, unregisterBack, unregisterDesign } from "./registry.ts";

/** A territory card of an invented game: the place's name on the card, and a soldier, horse or cannon (drawn here, ours). */
const territories: CardDesign = {
  name: "frontier-lands",
  box: [100, 140],
  art: { wild: '<rect x="20" y="30" width="60" height="80" fill="#c98b2b"/>' },
  draw: (card, { language }) => {
    const found = /^land-(ridge|harbour|marsh)-(soldier|horse|cannon)$/.exec(card);
    if (found === null) return null;
    return `<text x="50" y="40" text-anchor="middle" font-size="12">${language === "ja" ? "地" : found[1]}</text><circle cx="50" cy="90" r="20" data-kind="${found[2]}"/>`;
  },
  label: (card, language) => (card === "wild" ? (language === "ja" ? "ワイルド" : "Wild card") : card === "QS" ? null : `Territory ${card}`),
};

afterEach(() => {
  for (const name of registeredDesignNames()) unregisterDesign(name);
  for (const name of registeredBackNames()) unregisterBack(name);
});

describe("a page's own picture addresses and markup", () => {
  it("accepts a picture's address and refuses anything that could run", () => {
    for (const good of ["data:image/png;base64,AAAA", "data:image/svg+xml,%3Csvg width='9'/%3E", "https://example.test/a.png", "/logo.svg", "./logo.svg", "../a/b.webp", "logo.png"]) expect(safeImageUrl(good), good).toBe(good);
    for (const bad of ["javascript:alert(1)", "data:text/html,<b>", 'x" onload="y', "vbscript:x", "file:///etc/passwd", "a b.png", "", 7, null]) expect(safeImageUrl(bad), String(bad)).toBeNull();
  });

  it("takes scripts, handlers, frames and unsafe addresses out of markup, and leaves the drawing", () => {
    const dirty = `<g><script>alert(1)</script><circle onload="x()" r="5" onclick='y()'/><foreignObject><div>hi</div></foreignObject><a href="javascript:alert(1)"><rect width="3"/></a><use href="#part"/><image href="data:image/png;base64,AAAA"/><iframe src="x"></iframe><style>@import 'x'</style></g>`;
    const clean = cleanMarkup(dirty);
    for (const gone of ["script", "onload", "onclick", "foreignObject", "javascript:", "iframe", "<style"]) expect(clean, gone).not.toContain(gone);
    for (const kept of ['<circle r="5"', '<rect width="3"', 'href="#part"', 'href="data:image/png;base64,AAAA"']) expect(clean, kept).toContain(kept);
    expect(cleanMarkup(7)).toBe("");
  });
});

describe("a design the page registers", () => {
  it("is kept under a kebab-case name, never over the package's own, and forgotten on request", () => {
    registerDesign(territories);
    expect(registeredDesign("frontier-lands")).toBe(territories);
    expect(registeredDesignNames()).toEqual(["frontier-lands"]);
    for (const own of ["plain", "four-colour", "english", "realistic"]) expect(() => registerDesign({ ...territories, name: own })).toThrow(RangeError);
    for (const bad of ["Frontier", "two words", "", "a--b", "-a"]) expect(() => registerDesign({ ...territories, name: bad }), bad).toThrow(RangeError);
    expect(() => registerDesign({ ...territories, box: [0, 10] })).toThrow(TypeError);
    unregisterDesign("frontier-lands");
    expect(registeredDesign("frontier-lands")).toBeUndefined();
  });

  it("draws cards no deck has, by art or by a function, in the page's language", () => {
    registerDesign(territories);
    const wild = cardFaceSvg("wild", { design: "frontier-lands" });
    expect(wild).toContain('fill="#c98b2b"');
    expect(wild).toContain("var(--toranpu-card,#fffdf8)");
    const ridge = cardFaceSvg("land-ridge-horse", { design: "frontier-lands" }) as string;
    expect(ridge).toContain(">ridge<");
    expect(ridge).toContain('data-kind="horse"');
    expect(cardFaceSvg("land-ridge-horse", { design: "frontier-lands", language: "ja" })).toContain(">地<");
    expect(ridge.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"')).toBe(true);
  });

  it("draws nothing for a card it has no drawing for, and still draws the standard cards plain", () => {
    registerDesign(territories);
    expect(cardFaceSvg("land-nowhere-horse", { design: "frontier-lands" })).toBeNull();
    expect(cardFaceSvg("wild")).toBeNull();
    expect(cardFaceSvg("QS", { design: "frontier-lands" })).toBe(cardFaceSvg("QS"));
    expect(isCardFace("wild")).toBe(false);
  });

  it("names its cards for a screen reader, in either language, and a card of no design by its id", () => {
    registerDesign(territories);
    expect(faceName("wild", "en", territories)).toBe("Wild card");
    expect(faceName("wild", "ja", territories)).toBe("ワイルド");
    expect(cardFaceSvg("wild", { design: "frontier-lands", language: "ja" })).toContain('aria-label="ワイルド"');
    expect(faceName("QS", "en", territories)).toBe("queen of spades");
    expect(faceName("mystery", "en")).toBe("mystery");
  });

  it("can fill the card, leaving the paper out, and can draw its own faces over the standard ids", () => {
    registerDesign({ name: "full-bleed", box: [100, 140], art: { QS: '<rect width="100" height="140" fill="navy"/>' }, frame: "none" });
    const queen = cardFaceSvg("QS", { design: "full-bleed" }) as string;
    expect(queen).toContain('fill="navy"');
    expect(queen).not.toContain("--toranpu-card,");
  });

  it("cleans a registered design's art, but draws the package's own as it is", async () => {
    registerDesign({ name: "dirty", box: [100, 140], art: { x1: '<circle r="5" onload="steal()"/><script>steal()</script>' } });
    const face = cardFaceSvg("x1", { design: "dirty" }) as string;
    expect(face).toContain('<circle r="5"');
    expect(face).not.toContain("steal");
    expect(await loadCardDesign("dirty")).toBe(registeredDesign("dirty"));
  });

  it("is read by a hand written as text, whose own cards keep their spelling", () => {
    registerDesign(territories);
    expect(customCardKnown("wild")).toBe(true);
    expect(customCardKnown("land-ridge-horse")).toBe(true);
    expect(customCardKnown("land-nowhere-horse")).toBe(false);
    expect(readHand("AS wild land-marsh-cannon 10D")).toEqual(["AS", "wild", "land-marsh-cannon", "TD"]);
    expect(readHand("AS nothing")).toBeNull();
    unregisterDesign("frontier-lands");
    expect(readHand("land-ridge-horse")).toBeNull();
  });

  it("draws a single card from art alone, with no design registered, and uses a whole <svg> as it is", () => {
    const small = cardFaceFromArt('<circle cx="50" cy="70" r="30" onclick="x()"/>');
    expect(small).toContain('<circle cx="50" cy="70" r="30"');
    expect(small).not.toContain("onclick");
    expect(small).toContain("var(--toranpu-card,#fffdf8)");
    expect(cardFaceFromArt('<svg viewBox="0 0 10 10"><path d="M0 0"/></svg>')).toBe('<svg viewBox="0 0 10 10"><path d="M0 0"/></svg>');
  });
});

describe("a back the page registers", () => {
  it("is kept by name, listed beside the package's own, and drawn by name", () => {
    registerBack("frontier", { colour: "#2f4a3a", ink: "#e7d9a8", base: "classic-blue", mark: "FT" });
    expect(registeredBack("frontier")?.base).toBe("classic-blue");
    expect(cardBackNames()).toEqual(["classic-red", "classic-blue", "ink-dots", "frontier"]);
    const svg = cardBackSvg("frontier");
    expect(svg).toContain('fill="#2f4a3a"');
    expect(svg).toContain(">FT<");
    expect(cardBackSvg("frontier", { colour: "#000000" })).toContain('fill="#000000"');
    expect(() => registerBack("classic-red", {})).toThrow(RangeError);
    expect(() => registerBack("Not Kebab", {})).toThrow(RangeError);
    unregisterBack("frontier");
    expect(cardBackSvg("frontier")).toBe(cardBackSvg("classic-red"));
  });

  it("takes artwork of its own for the whole back, and a logo on it with no plate", () => {
    const svg = cardBackSvg("classic-red", { art: '<rect x="4" y="4" width="92" height="132" fill="#123456" onclick="x()"/>', logo: '<circle cx="50" cy="50" r="40" fill="gold"/>' });
    expect(svg).toContain('fill="#123456"');
    expect(svg).not.toContain("onclick");
    expect(svg).toContain('fill="gold"');
    expect(svg).not.toContain("<pattern");
    expect(svg).not.toContain("<ellipse");
    // No plate of the paper's colour under a logo that sits on the page's own art: one paper rect is all there is.
    expect((svg.match(/<circle/g) ?? []).length).toBe(1);
  });

  it("takes a picture for the whole back and refuses an address that is not one", () => {
    const svg = cardBackSvg("classic-red", { image: "https://example.test/back.jpg" });
    expect(svg).toContain('<image href="https://example.test/back.jpg"');
    expect(svg).toContain("clip-path");
    expect(svg).not.toContain("<pattern");
    const bad = cardBackSvg("classic-red", { image: "javascript:alert(1)" });
    // The pattern's id differs with the address asked for, and nothing else does.
    const same = (svg: string) => svg.replace(/toranpu-back-classic-red-\w+/g, "ID");
    expect(same(bad)).toBe(same(cardBackSvg("classic-red")));
  });

  it("puts a logo on a plate over the lattice, as a picture or as markup, sized as asked", () => {
    const picture = cardBackSvg("classic-blue", { logo: "/logo.png", logoSize: 50 });
    expect(picture).toContain('<image href="/logo.png"');
    expect(picture).toContain('width="50"');
    expect(picture).toContain("<pattern");
    expect(cardBackSvg("ink-dots", { logo: '<path d="M0 0L9 9"/>' })).toContain('<path d="M0 0L9 9"/>');
    expect(cardBackSvg("classic-red", { logo: "javascript:alert(1)" })).toContain("<pattern");
    expect(cardBackSvg("classic-red", { logo: "javascript:alert(1)" })).not.toContain("<image");
    expect(cardBackUrl("classic-red", { logo: '<path d="M0 0L9 9"/>' }).startsWith("data:image/svg+xml;charset=utf-8,")).toBe(true);
  });

  it("changes nothing about the backs that ask for none of this", () => {
    expect(cardBackSvg("classic-red")).toContain("toranpu-back-classic-red-");
    expect(cardBackSvg("classic-blue", { mark: "五つ" })).toContain(">五つ<");
  });
});
