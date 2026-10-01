// The card designs panel, by real taps: plain, four colour, the English pattern fetched when it is
// chosen and not before, the way back to plain, and the jokers' words in Japanese.
import { expect, test } from "@playwright/test";

import { JOKERS, cardFaceSvg } from "../dist/card-faces.js";
import { FULL_DECK } from "../dist/index.js";
import { ENGLISH_PATTERN } from "../dist/designs/english.js";
import { at, open, sound, tap } from "./demo.mjs";

const spread = (page) => page.locator(at("design-spread")).evaluate((box) => ({ design: box.dataset.design, cards: [...box.querySelectorAll(".face")].map((face) => face.dataset.card), labels: [...box.querySelectorAll("svg")].map((svg) => svg.getAttribute("aria-label")) }));

test("every face of every design is SVG a browser reads without complaint", async ({ page }) => {
  await open(page, "?seed=1");
  const all = [...FULL_DECK, ...JOKERS].flatMap((card) => [cardFaceSvg(card), cardFaceSvg(card, { design: "four-colour" }), cardFaceSvg(card, { design: ENGLISH_PATTERN })]);
  const bad = await page.evaluate((svgs) => svgs.filter((svg) => new DOMParser().parseFromString(svg, "image/svg+xml").querySelector("parsererror") !== null).length, all);
  expect(all).toHaveLength(54 * 3);
  expect(bad).toBe(0);
});

test("choose a design: the spread and its code follow, and the English pattern is fetched only when chosen", async ({ page }) => {
  const fetched = [];
  page.on("request", (request) => fetched.push(new URL(request.url()).pathname));
  const errors = await open(page, "?seed=1");
  await expect(page.locator(at("design-plain"))).toHaveAttribute("aria-pressed", "true");
  let s = await spread(page);
  expect(s).toMatchObject({ design: "plain", cards: ["AS", "KS", "QH", "JD", "TC", "7D", "2H", "RJ", "BJ", "R1", "R2", "BL"] });
  expect(s.labels[1]).toBe("king of spades");
  expect(fetched.some((path) => path.endsWith("designs/english.js")), "nothing of the English pattern before it is chosen").toBe(false);

  await tap(page, at("design-four-colour"));
  await expect(page.locator(at("design-spread"))).toHaveAttribute("data-design", "four-colour");
  expect(await page.locator(`${at("design-spread")} [data-card="JD"]`).innerHTML()).toContain("#1f5fbf");
  await expect(page.locator(at("design-code"))).toContainText('cardFaceSvg("KS", { design: "four-colour" })');

  await tap(page, at("design-english"));
  await expect(page.locator(at("design-spread"))).toHaveAttribute("data-design", "english");
  expect(fetched.some((path) => path.endsWith("designs/english.js"))).toBe(true);
  expect(await page.locator(`${at("design-spread")} [data-card="KS"]`).innerHTML()).toContain("scale(0.25926)");
  await expect(page.locator(at("design-code"))).toContainText('loadCardDesign("english")');
  expect(new URL(page.url()).search).toContain("design=english");
  await sound(page, errors);

  // And back to plain, which the address then forgets.
  await tap(page, at("design-plain"));
  await expect(page.locator(at("design-spread"))).toHaveAttribute("data-design", "plain");
  expect(new URL(page.url()).search).not.toContain("design=");
  s = await spread(page);
  expect(s.labels[7]).toBe("red joker");
});

test("in Japanese the cards are named in Japanese, and the jokers say ジョーカー", async ({ page }) => {
  const errors = await open(page, "?seed=1&design=english");
  await expect(page.locator(at("design-spread"))).toHaveAttribute("data-design", "english");
  await tap(page, '[data-lang="ja"]');
  await expect(page.locator(`${at("design-spread")} [data-card="KS"] svg`)).toHaveAttribute("aria-label", "スペードのキング");
  await expect(page.locator(`${at("design-spread")} [data-card="BJ"] svg`)).toHaveAttribute("aria-label", "黒のジョーカー");
  expect(await page.locator(`${at("design-spread")} [data-card="RJ"]`).innerHTML()).toContain(">ジ</text>");
  await expect(page.locator(at("design-english"))).toHaveText("イングリッシュ・パターン");
  await sound(page, errors);
});
