// The README's HTML examples, run as written in a real browser: each block is put in a page with
// only its CDN address pointed at the package just built.
import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import { serve } from "./demo.mjs";

const readme = readFileSync(new URL("../README.md", import.meta.url), "utf8");
const CDN = "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/";
/** The README's ```html block that holds `holding`. */
const block = (holding) => [...readme.matchAll(/```html\n([\s\S]*?)```/g)].map((m) => m[1]).find((one) => one.includes(holding));

async function run(page, html) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.route("http://toranpu.test/readme.html", (route) => route.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>${html.replaceAll(CDN, "http://toranpu.test/dist/")}</body></html>` }));
  await page.goto("http://toranpu.test/readme.html");
  return errors;
}

test("One card: the script tag and the element give a king of spades that turns over on a tap", async ({ page }) => {
  const html = block('<toranpu-card card="KS"');
  expect(html).toContain(CDN);
  const errors = await run(page, html);
  const card = page.locator("toranpu-card");
  await expect(card).toHaveAttribute("aria-label", "king of spades");
  await card.click();
  await expect(card).toHaveAttribute("aria-label", "a card, face down");
  expect(errors).toEqual([]);
});

test("Hand controls: hidden one by one, shown, scrunched and spread, two cards turned, parted, marked and spun", async ({ page }) => {
  const html = block('<toranpu-hand id="mine"');
  await page.addInitScript(() => {
    window.seen = [];
    document.addEventListener("toranpu-hand", (event) => window.seen.push(event.detail));
  });
  const errors = await run(page, html);
  const hand = page.locator("#mine");
  // The example ends spread out and face up, after passing through every state.
  // The example ends face up and spread, two cards turned over by themselves, parted at the queen, the king marked.
  await expect(hand).toHaveAttribute("aria-label", "Hand: ace of spades, a card, face down, marked, a card, face down, jack of clubs, ten of spades");
  await expect.poll(() => page.evaluate(() => window.seen.length)).toBe(6);
  const lies = (faceDown, scrunched, turned = [], parted = null) => ({ faceDown, scrunched, open: 1, turned, parted });
  expect(await page.evaluate(() => window.seen)).toEqual([lies(true, false), lies(false, false), lies(false, true), lies(false, false), lies(false, false, ["KH", "QD"]), lies(false, false, ["KH", "QD"], "QD")]);
  await expect.poll(() => hand.evaluate((one) => one.shadowRoot.querySelectorAll(".slot").length)).toBe(5);
  expect(await hand.evaluate((one) => one.hasAttribute("scrunched") || one.hasAttribute("face-down"))).toBe(false);
  expect(errors).toEqual([]);
});

test("A closed hand: the example lies closed, opens on a tap and tells the page", async ({ page }) => {
  const html = block('<toranpu-hand id="yours"');
  await page.addInitScript(() => {
    window.opened = [];
    const log = console.log;
    console.log = (...said) => {
      window.opened.push(said[0]);
      log(...said);
    };
  });
  const errors = await run(page, html);
  const hand = page.locator("#yours");
  await expect(hand).toHaveAttribute("aria-expanded", "false");
  await hand.click();
  await expect(hand).toHaveAttribute("aria-expanded", "true");
  await expect.poll(() => page.evaluate(() => window.opened)).toEqual([1]);
  expect(errors).toEqual([]);
});

test("Messy piles: the two piles of the example, face down and face up, from one seed", async ({ page }) => {
  const errors = await run(page, `${block('<toranpu-pile count="24"')}<script type="module" src="${CDN}element-define.js"></script>`);
  const piles = page.locator("toranpu-pile");
  await expect(piles.nth(0)).toHaveAttribute("aria-label", "a pile face down, cards: 24");
  await expect(piles.nth(1)).toHaveAttribute("aria-label", "a pile, seven of hearts on top, cards: 4");
  expect(errors).toEqual([]);
});

test("Embed a hand: the iframe and the one tag of the example each show the five cards", async ({ page }) => {
  const SITE = "https://johnmorrisdotca.github.io/toranpu/";
  const frame = block("<iframe");
  const tag = block('<toranpu-hand cards="AS KH QD JC 10S" size="medium">');
  expect(frame).toContain(SITE);
  const errors = await run(page, `${frame.replaceAll(SITE, "http://toranpu.test/")}${tag}`);
  const named = "Hand: ace of spades, king of hearts, queen of diamonds, jack of clubs, ten of spades";
  await expect(page.frameLocator("iframe").locator("toranpu-hand")).toHaveAttribute("aria-label", named);
  await expect(page.locator("body > toranpu-hand")).toHaveAttribute("aria-label", named);
  expect(errors).toEqual([]);
});
