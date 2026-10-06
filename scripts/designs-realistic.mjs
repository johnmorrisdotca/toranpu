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

/** How tall a number card's large pips are, as a share of the card's height: a printed deck's proportion. */
const PIP_SHARE = 0.12;
/** How far the field of pips is drawn in toward the card's middle, clear of the corner indices, as a printed deck lays them. */
const PIP_FIELD = 0.94;

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
  // A number card's pips are resized before the card is made small: the optimiser merges them into one shape.
  const numbered = id[0] !== "A";
  await page.setContent(`<body style="margin:0">${numbered ? source.replace(/<\?xml[^>]*\?>/, "") : small(source, id)}</body>`);
  const cleaned = await page.evaluate(({ numbered, PIP_SHARE, PIP_FIELD }) => {
    const svg = document.querySelector("svg");
    // Knoll draws his large pips about 22% of the card's height (his diamonds a sixth taller still), where a printed
    // deck's are about 16%: from the seven up they crowd each other and the corners, and John found the cards
    // strange (2026-10-01). Each large pip is made PIP_SHARE of the card's height about its own centre, its place on
    // the card unchanged, so every suit's pips are one size.
    if (numbered) {
      for (const pip of svg.querySelectorAll("path")) {
        const box = pip.getBBox();
        const local = pip.getCTM();
        const parent = pip.parentNode.getCTM();
        if (local === null || parent === null) continue;
        // A large pip is about 22% of the card's height; the corner pips and the border are far from it.
        const share = pip.getBoundingClientRect().height / svg.getBoundingClientRect().height;
        if (share < 0.17 || share > 0.28) continue;
        const point = svg.createSVGPoint();
        point.x = box.x + box.width / 2;
        point.y = box.y + box.height / 2;
        const centre = point.matrixTransform(parent.inverse().multiply(local));
        const scale = Math.round((PIP_SHARE / share) * 1000) / 1000;
        // The card's own middle, where the pip lies: the field of pips is drawn in toward it, clear of the corners.
        const [vx, vy, vw, vh] = svg.getAttribute("viewBox").split(/[\s,]+/).map(Number);
        const mid = svg.createSVGPoint();
        mid.x = vx + vw / 2;
        mid.y = vy + vh / 2;
        const middle = mid.matrixTransform(parent.inverse().multiply(svg.getCTM()));
        const to = { x: middle.x + (centre.x - middle.x) * PIP_FIELD, y: middle.y + (centre.y - middle.y) * PIP_FIELD };
        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("transform", `translate(${to.x} ${to.y}) scale(${scale}) translate(${-centre.x} ${-centre.y})`);
        pip.replaceWith(g);
        g.append(pip);
      }
    }
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
  }, { numbered, PIP_SHARE, PIP_FIELD });
  if (cleaned.outlines !== 1) throw new Error(`${file}: ${cleaned.outlines} outlines`);
  box ??= [cleaned.width, cleaned.height];
  if (Math.abs(box[0] - cleaned.width) > 0.1 || Math.abs(box[1] - cleaned.height) > 0.1) throw new Error(`${file}: another size`);
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
    'import type { CardDesign } from "../ui/card-faces.types.ts";',
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
