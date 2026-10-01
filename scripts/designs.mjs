// Writes src/designs/english.ts, the English pattern design, from Dmitry Fomin's CC0 cards on
// Wikimedia Commons (see docs/credits.md). Run by hand, once:
//
//   node scripts/designs.mjs <a folder holding the downloaded .svg files>
//
// The folder holds the 52 files named as on Commons (English_pattern_king_of_spades.svg …) and the
// two jokers (Atlas_deck_joker_red.svg, Atlas_deck_joker_black.svg). Each card is made smaller
// with svgo (one decimal place in its 360 by 540 box), its outline is taken off (the card's paper
// is drawn by cardFaceSvg), and each id is given the card's own prefix, so that any number of
// cards can share a page. The jokers' corner lettering, the Russian word джокер, is taken off: it
// is the shapes lying wholly in the side strips, measured in a browser; cardFaceSvg draws the
// word JOKER in its place. Nothing here runs in CI or is published.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";
import { optimize } from "svgo";

const from = process.argv[2];
if (from === undefined) {
  console.error("Usage: node scripts/designs.mjs <folder of the downloaded cards>");
  process.exit(2);
}

const RANKS = { ace: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "T", jack: "J", queen: "Q", king: "K" };
const SUITS = { spades: "S", hearts: "H", diamonds: "D", clubs: "C" };
const files = [];
for (const [suitName, suit] of Object.entries(SUITS)) for (const [rankName, rank] of Object.entries(RANKS)) files.push({ id: `${rank}${suit}`, file: `English_pattern_${rankName}_of_${suitName}.svg` });
files.push({ id: "RJ", file: "Atlas_deck_joker_red.svg", joker: true }, { id: "BJ", file: "Atlas_deck_joker_black.svg", joker: true });

/** A card made small, with ids of its own. */
const small = (svg, id) =>
  optimize(svg, {
    multipass: true,
    floatPrecision: 1,
    plugins: [
      { name: "preset-default", params: { overrides: { cleanupIds: { minify: true } } } },
      "convertStyleToAttrs",
      "removeDimensions",
      { name: "prefixIds", params: { prefix: `tp-en-${id}`, delim: "-" } },
    ],
  }).data;

/** What is inside the <svg>. */
const inside = (svg) => svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));

const browser = await chromium.launch();
const page = await browser.newPage();
const art = {};
let before = 0;
for (const { id, file, joker } of files) {
  const source = readFileSync(join(from, file), "utf8");
  before += source.length;
  // In a browser: take off the card's outline (the one shape as big as the card), and for a joker
  // every shape lying wholly within 50 units of either side, which is its lettering.
  await page.setContent(`<body style="margin:0">${small(source, id)}</body>`);
  const cleaned = await page.evaluate((joker) => {
    const svg = document.querySelector("svg");
    // Drawn at its own size, so that a shape's place on the page is its place in the card's box.
    svg.setAttribute("width", "360");
    svg.setAttribute("height", "540");
    const origin = svg.getScreenCTM().inverse();
    let outlines = 0;
    for (const shape of svg.querySelectorAll("path, rect, circle, ellipse, polygon")) {
      const box = shape.getBBox();
      const matrix = origin.multiply(shape.getScreenCTM());
      const left = matrix.a * box.x + matrix.e;
      const right = matrix.a * (box.x + box.width) + matrix.e;
      if (box.width >= 355 && box.height >= 535) {
        shape.remove();
        outlines += 1;
      } else if (joker && (right < 50 || left > 310)) shape.remove();
    }
    svg.removeAttribute("width");
    svg.removeAttribute("height");
    return { svg: svg.outerHTML, outlines };
  }, joker === true);
  if (cleaned.outlines !== 1) throw new Error(`${file}: ${cleaned.outlines} outlines`);
  const made = small(cleaned.svg, id);
  art[id] = inside(made);
}
await browser.close();

const after = Object.values(art).reduce((sum, one) => sum + one.length, 0);
mkdirSync("src/designs", { recursive: true });
writeFileSync(
  "src/designs/english.ts",
  [
    "/**",
    " * The English pattern: the traditional deck with its kings, queens and",
    " * jacks, as vectors by Dmitry Fomin, who dedicated them to the public",
    " * domain (CC0) on Wikimedia Commons; the jokers",
    " * are his too, from his Atlas deck, with the corner word drawn afresh. See",
    " * docs/credits.md. Written by scripts/designs.mjs, never by hand.",
    " *",
    " * ```ts",
    ' * import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";',
    ' * import { ENGLISH_PATTERN } from "@johnmorrisdotca/toranpu/card-faces/english";',
    " *",
    ' * cardFaceSvg("KS", { design: ENGLISH_PATTERN });',
    " * ```",
    " */",
    'import type { CardDesign } from "../ui/cardFaces.types.ts";',
    "",
    "/** The English pattern, every card and two jokers, drawn in a box 360 by 540. About 700 kB, so it is its own entry point and is loaded only by a page that uses it. */",
    "export const ENGLISH_PATTERN: CardDesign = {",
    '  name: "english",',
    "  box: [360, 540],",
    "  art: {",
    ...Object.entries(art).map(([id, markup]) => `    ${JSON.stringify(id)}: ${JSON.stringify(markup)},`),
    "  },",
    "};",
    "",
  ].join("\n"),
);
console.log(`src/designs/english.ts: ${Object.keys(art).length} cards, ${before} bytes of SVG made ${after}.`);
