// <toranpu-pile>, by real taps on the demo: a stock and a discard pile as messy as the slider says,
// laid out from their seed, and a card drawn from one onto the other; and the table's own piles.
import { expect, test } from "@playwright/test";

import { cardId, shuffledDeck } from "../dist/deck.js";
import { faceName } from "../dist/card-faces.js";
import { pileLayout } from "../dist/element.js";
import { at, open, sound, tap } from "./demo.mjs";

const read = (page, id) =>
  page.locator(at(id)).evaluate((pile) => {
    const layers = [...pile.shadowRoot.querySelectorAll(".layer")];
    return {
      label: pile.getAttribute("aria-label"),
      layers: layers.map((layer) => ({ x: Number(layer.style.getPropertyValue("--x")), y: Number(layer.style.getPropertyValue("--y")), rotate: layer.style.getPropertyValue("--r") })),
      faces: layers.filter((layer) => layer.innerHTML.includes("--toranpu-card")).length,
      width: Math.round(pile.getBoundingClientRect().width),
    };
  });

test("the stock lies face down and the discard face up, each laid out from its seed as messy as asked", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const deck = shuffledDeck(7).map(cardId);
  let stock = await read(page, "stock-demo");
  let discard = await read(page, "discard-demo");
  expect(stock.label).toBe("a pile face down, cards: 49");
  expect(stock.faces).toBe(0);
  expect(stock.layers.map((layer) => `${layer.rotate}`)).toEqual(pileLayout(49, { messiness: 0.3, seed: 7 }).map((place) => `${place.rotate}deg`));
  expect(discard.label).toBe(`a pile, ${faceName(deck[2])} on top, cards: 3`);
  expect(discard.layers).toHaveLength(3);

  await page.locator(at("messiness")).fill("1");
  stock = await read(page, "stock-demo");
  expect(stock.layers.map((layer) => layer.rotate)).toEqual(pileLayout(49, { messiness: 1, seed: 7 }).map((place) => `${place.rotate}deg`));
  expect(new URL(page.url()).search).toContain("mess=1");
  await page.locator(at("messiness")).fill("0");
  for (const layer of (await read(page, "stock-demo")).layers) expect(layer.rotate).toBe("0deg");
  await page.locator(at("messiness")).fill("0.6");

  // A card drawn: the stock is one fewer, the discard one more, and the cards already there do not move.
  const before = await read(page, "discard-demo");
  await tap(page, at("draw-card"));
  discard = await read(page, "discard-demo");
  expect((await read(page, "stock-demo")).label).toBe("a pile face down, cards: 48");
  expect(discard.layers).toHaveLength(4);
  expect(discard.layers.slice(0, 3).map((layer) => layer.rotate)).toEqual(before.layers.map((layer) => layer.rotate));
  expect(discard.label).toBe(`a pile, ${faceName(deck[3])} on top, cards: 4`);
  await expect(page.locator(at("discard-demo"))).toHaveAttribute("cards", deck.slice(0, 4).join(" "));
  await expect(page.locator(at("piles-code"))).toContainText(`<toranpu-pile count="48" face-down messiness="0.6" seed="7">`);

  // Another seed is another pile; the same seed again is the same pile.
  await page.locator(at("pile-seed")).fill("8");
  await page.locator(at("pile-seed")).press("Enter");
  const eight = await read(page, "stock-demo");
  await page.locator(at("pile-seed")).fill("7");
  await page.locator(at("pile-seed")).press("Enter");
  expect((await read(page, "stock-demo")).layers).not.toEqual(eight.layers);
  await sound(page, errors);
});

test("a pile is one box whatever its messiness: squared up or scattered, the piles and the table round them keep their size", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const box = (selector) => page.locator(selector).evaluate((element) => { const r = element.getBoundingClientRect(); return [Math.round(r.width), Math.round(r.height)]; });
  const table = () => page.locator(at("stock-demo")).evaluate((pile) => Math.round(pile.parentElement.closest("section, article, div").getBoundingClientRect().height));
  const sizes = async () => ({ stock: await box(at("stock-demo")), discard: await box(at("discard-demo")), table: await table() });
  await page.locator(at("messiness")).fill("0");
  const neat = await sizes();
  for (const messiness of ["0.4", "1", "0"]) {
    await page.locator(at("messiness")).fill(messiness);
    expect(await sizes(), `messiness ${messiness}`).toEqual(neat);
  }
  await sound(page, errors);
});

test("a pile keeps its size as cards come and go, and says so in Japanese", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const width = (await read(page, "discard-demo")).width;
  for (let draws = 0; draws < 4; draws++) await tap(page, at("draw-card"));
  expect((await read(page, "discard-demo")).width).toBe(width);
  await tap(page, '[data-lang="ja"]');
  await expect(page.locator(at("stock-demo"))).toHaveAttribute("aria-label", "伏せた山（45枚）");
  await sound(page, errors);
});

test("the table's stock and discard are piles too, in the look chosen", async ({ page }) => {
  const errors = await open(page, "?game=gin-rummy&players=2&seed=3&back=classic-blue&mess=0.5");
  const stock = page.locator(at("stock-pile"));
  await expect(stock).toHaveAttribute("face-down", "");
  await expect(stock).toHaveAttribute("back", "classic-blue");
  await expect(stock).toHaveAttribute("messiness", "0.5");
  await expect(stock).toHaveAttribute("aria-label", /^a pile face down, cards: \d+$/);
  await expect(page.locator(at("discard-pile"))).toHaveAttribute("aria-label", /^a pile, .+ on top, cards: 1$/);
  await sound(page, errors);
});

test("the deck's rest lies beside its seats, face down and a little untidy, as many as are left", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const rest = page.locator(at("deck-stock"));
  await expect(rest).toHaveAttribute("count", "32");
  await expect(rest).toHaveAttribute("face-down", "");
  await expect(rest).toHaveAttribute("aria-label", /32/);
  await page.locator(at("deck-hands")).selectOption("3");
  await page.locator(at("deck-each")).selectOption("10");
  await expect(rest).toHaveAttribute("count", "22");
  await expect(page.locator(at("deck-left"))).toContainText("22");
  await sound(page, errors);
});
