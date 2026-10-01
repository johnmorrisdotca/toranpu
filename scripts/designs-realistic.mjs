// Writes src/designs/realistic.ts, the realistic design, from Byron Knoll's public-domain cards on
// Wikimedia Commons (see docs/credits.md). Run by hand, once:
//
//   node scripts/designs-realistic.mjs <a folder holding the downloaded .svg files>
//
// The folder holds Knoll's 39 cards that are wholly his, named as on Commons ("2 of spades.svg" …,
// "Ace of hearts.svg"): the number cards and the aces of hearts, diamonds and clubs. His ace of
// spades (based on Suzanne Tyson's artwork, whose licence is not stated) and his kings, queens and
// jacks (traced from a printed pack) are not taken: the design draws those from Fomin's CC0 English
// pattern (`fallback`). Each card is made smaller with svgo, its outline taken off (the card's paper
// is drawn by cardFaceSvg), and its ids given the card's own prefix. Nothing here runs in CI.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";
import { optimize } from "svgo";

const from = process.argv[2];
if (from === undefined) {
  console.error("Usage: node scripts/designs-realistic.mjs <folder of the downloaded cards>");
  process.exit(2);
}

const RANKS = { ace: "A", 2: "2", 3: "3", 4: "4", 5: "5", 6: "6", 7: "7", 8: "8", 9: "9", 10: "T" };
const SUITS = { spades: "S", hearts: "H", diamonds: "D", clubs: "C" };
const files = [];
for (const [suitName, suit] of Object.entries(SUITS))
  for (const [rankName, rank] of Object.entries(RANKS)) if (!(rank === "A" && suit === "S")) files.push({ id: `${rank}${suit}`, file: `${rankName[0].toUpperCase()}${rankName.slice(1)} of ${suitName}.svg` });

const small = (svg, id) =>
  optimize(svg, {
    multipass: true,
    floatPrecision: 1,
    plugins: [
      { name: "preset-default", params: { overrides: { cleanupIds: { minify: true } } } },
      "convertStyleToAttrs",
      "removeDimensions",
      { name: "prefixIds", params: { prefix: `tp-re-${id}`, delim: "-" } },
    ],
  }).data;
const inside = (svg) => svg.slice(svg.indexOf(">") + 1, svg.lastIndexOf("</svg>"));

const browser = await chromium.launch();
const page = await browser.newPage();
const art = {};
let before = 0;
let box = null;
for (const { id, file } of files) {
  const source = readFileSync(join(from, file), "utf8");
  before += source.length;
  await page.setContent(`<body style="margin:0">${small(source, id)}</body>`);
  const cleaned = await page.evaluate(() => {
    const svg = document.querySelector("svg");
    const [, , width, height] = svg.getAttribute("viewBox").split(/[\s,]+/).map(Number);
    let outlines = 0;
    // The card's outline: a shape as big as the card, which cardFaceSvg draws as its paper.
    for (const shape of svg.querySelectorAll("path, rect")) {
      const b = shape.getBBox();
      if (b.width >= width * 0.97 && b.height >= height * 0.97) {
        shape.remove();
        outlines += 1;
      }
    }
    return { svg: svg.outerHTML, outlines, width, height };
  });
  if (cleaned.outlines !== 1) throw new Error(`${file}: ${cleaned.outlines} outlines`);
  box ??= [cleaned.width, cleaned.height];
  if (Math.abs(box[0] - cleaned.width) > 0.01 || Math.abs(box[1] - cleaned.height) > 0.01) throw new Error(`${file}: another size`);
  art[id] = inside(small(cleaned.svg, id));
}
await browser.close();

const after = Object.values(art).reduce((sum, one) => sum + one.length, 0);
mkdirSync("src/designs", { recursive: true });
writeFileSync(
  "src/designs/realistic.ts",
  [
    "/**",
    " * The realistic design: Byron Knoll's number cards and aces, which he released into the public",
    " * domain (Wikimedia Commons), with the kings, queens, jacks, ace of spades and jokers of Dmitry",
    " * Fomin's CC0 English pattern. See docs/credits.md. Written by scripts/designs-realistic.mjs, never",
    " * by hand.",
    " *",
    " * ```ts",
    ' * import { cardFaceSvg, loadCardDesign } from "@johnmorrisdotca/toranpu/card-faces";',
    " *",
    ' * cardFaceSvg("7H", { design: await loadCardDesign("realistic") });',
    " * ```",
    " */",
    'import type { CardDesign } from "../ui/cardFaces.types.ts";',
    'import { ENGLISH_PATTERN } from "./english.ts";',
    "",
    `/** The realistic design: Knoll's 39 cards in a box ${box[0]} by ${box[1]}, and Fomin's English pattern for every other card. */`,
    "export const REALISTIC: CardDesign = {",
    '  name: "realistic",',
    `  box: [${box[0]}, ${box[1]}],`,
    "  fallback: ENGLISH_PATTERN,",
    "  art: {",
    ...Object.entries(art).map(([id, markup]) => `    ${JSON.stringify(id)}: ${JSON.stringify(markup)},`),
    "  },",
    "};",
    "",
  ].join("\n"),
);
console.log(`src/designs/realistic.ts: ${Object.keys(art).length} cards, ${before} bytes of SVG made ${after}.`);
