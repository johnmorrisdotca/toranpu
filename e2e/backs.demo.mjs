// The card backs panel, by real taps: choose a back, colour it, write in its middle, and the drawing,
// the code under it and the address all follow. Every back is parsed by the browser as SVG.
import { expect, test } from "@playwright/test";

import { CARD_BACKS, cardBackSvg } from "../dist/card-backs.js";
import { STRINGS } from "../dist/index.js";
import { at, open, sound, tap } from "./demo.mjs";

const shown = (page) => page.locator(`${at("back-show")} svg`).evaluate((svg) => svg.outerHTML);

test("every back is SVG a browser reads without complaint", async ({ page }) => {
  await open(page, "?seed=1");
  const read = await page.evaluate((all) => all.map((svg) => {
    const parsed = new DOMParser().parseFromString(svg, "image/svg+xml");
    return parsed.querySelector("parsererror") === null && parsed.documentElement.tagName === "svg";
  }), CARD_BACKS.flatMap((name) => [cardBackSvg(name), cardBackSvg(name, { mark: "五つ & <co>", colour: "#123456", width: 70 })]));
  expect(read).toEqual(CARD_BACKS.flatMap(() => [true, true]));
});

test("choose a back, colour it and write in its middle: the drawing, the code and the address follow", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  await expect(page.locator(`${at("back-picks")} button`)).toHaveCount(3);
  await expect(page.locator(at("back-classic-red"))).toHaveAttribute("aria-pressed", "true");
  expect(await shown(page)).toContain("var(--toranpu-back,#b3262d)");

  await tap(page, at("back-classic-blue"));
  await expect(page.locator(at("back-classic-blue"))).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(at("back-classic-red"))).toHaveAttribute("aria-pressed", "false");
  expect(await shown(page)).toContain("var(--toranpu-back,#1f4e8c)");
  await expect(page.locator(at("back-code"))).toContainText('cardBackSvg("classic-blue")');

  await page.locator(at("back-mark")).fill("五つ");
  await expect(page.locator(`${at("back-show")} text`)).toHaveText("五つ");
  await expect(page.locator(at("back-code"))).toContainText('cardBackSvg("classic-blue", { mark: "五つ" })');

  await page.locator(at("back-colour")).fill("#3d4d38");
  expect(await shown(page)).toContain('fill="#3d4d38"');
  await expect(page.locator(at("back-code"))).toContainText('colour: "#3d4d38"');
  expect(new URL(page.url()).search).toContain("back=classic-blue&back-colour=3d4d38&mark=%E4%BA%94%E3%81%A4");
  await sound(page, errors);

  // The way back: its own colour again, no words, and the address forgets them.
  await tap(page, at("back-own"));
  await page.locator(at("back-mark")).fill("");
  expect(await shown(page)).toContain("var(--toranpu-back,#1f4e8c)");
  await expect(page.locator(at("back-own"))).toBeDisabled();
  expect(new URL(page.url()).search).not.toContain("back-colour");
  expect(new URL(page.url()).search).not.toContain("mark=");

  // A link carries the look.
  await page.goto("http://toranpu.test/?back=ink-dots&mark=%E4%B8%80%E3%81%A4");
  await expect(page.locator(at("back-ink-dots"))).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(`${at("back-show")} text`)).toHaveText("一つ");
  await sound(page, errors);
});

test("the backs' words in Japanese", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  await tap(page, '[data-lang="ja"]');
  await expect(page.locator(`${at("back-ink-dots")} span`)).toHaveText(STRINGS.ja.pageBackInkDots);
  await expect(page.locator("#backs-title")).toHaveText(STRINGS.ja.pageBacks);
  await expect(page.locator(at("back-own"))).toHaveText(STRINGS.ja.pageBackOwnColour);
  await sound(page, errors);
});
