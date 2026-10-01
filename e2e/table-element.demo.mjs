// <toranpu-table>, on the demo's own panel: any game, ready to play, in the cloth chosen on the header and the
// look chosen on the page, with the tag that puts the same table elsewhere.
import { expect, test } from "@playwright/test";

import { at, open, sound } from "./demo.mjs";

const table = (page) => page.locator(at("table-demo"));
const inside = (page, id) => table(page).locator(`[data-testid="${id}"]`);

test("a game of Crazy Eights, played: a card picked and laid, or one drawn, and the computers answer", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  await expect(table(page)).toHaveAttribute("data-game", "crazyEights");
  await expect(inside(page, "table-seat")).toHaveCount(3);
  await expect(inside(page, "table-stock")).toHaveAttribute("face-down", "");
  const stock = Number(await inside(page, "table-stock").getAttribute("count"));
  const hand = table(page).locator(".hand .card");
  const before = await hand.count();
  const playable = table(page).locator(".hand .card:not([disabled])");
  if ((await playable.count()) > 0) await playable.first().click();
  await inside(page, "table-move").first().click();
  // The person's turn comes round again, the computers having played theirs.
  await expect(inside(page, "table-status")).toContainText("Your turn");
  const after = await hand.count();
  const drawn = Number(await inside(page, "table-stock").getAttribute("count"));
  expect(after !== before || drawn !== stock).toBe(true);
  await sound(page, errors);
});

test("another game and table chosen: the table deals it, and the tag says so", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  await page.locator(at("table-game")).selectOption("hearts");
  await expect(table(page)).toHaveAttribute("data-game", "hearts");
  await expect(inside(page, "table-seat")).toHaveCount(4);
  await expect(inside(page, "table-status")).toContainText("pick 3 cards to pass");
  await page.locator(at("table-players")).selectOption("3");
  await expect(inside(page, "table-seat")).toHaveCount(3);
  await expect(page.locator(at("table-code"))).toContainText('<toranpu-table game="hearts" players="3"');
  await expect(page.locator(at("table-code"))).toContainText("table-define.js");
  await sound(page, errors);
});

test("the table wears the cloth of the header's patches, and its piles the messiness of the page", async ({ page }) => {
  const errors = await open(page, "?seed=1&cloth=red");
  await expect(table(page)).toHaveAttribute("cloth", "red");
  const felt = table(page).locator(".felt");
  expect(await felt.evaluate((element) => getComputedStyle(element).getPropertyValue("--felt").trim())).toBe("#a3342e");
  await page.locator('button[data-cloth="wood"]').click();
  await expect(table(page)).toHaveAttribute("cloth", "wood");
  await expect(page.locator(at("table-code"))).toContainText('cloth="wood"');
  await page.locator(at("messiness")).fill("1");
  await expect(inside(page, "table-stock")).toHaveAttribute("messiness", "1");
  await page.locator('button[data-cloth="green"]').click();
  await expect(table(page)).not.toHaveAttribute("cloth", /./);
  await sound(page, errors);
});

test("War on the table element: two piles face down, the turn the game is at, and a button that turns the cards over", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  await page.locator(at("table-game")).selectOption("war");
  await expect(table(page)).toHaveAttribute("data-game", "war");
  await expect(inside(page, "table-seat")).toHaveCount(2);
  await expect(inside(page, "table-war-0")).toHaveAttribute("count", "26");
  await expect(table(page).locator(".hand .card")).toHaveCount(0);
  await inside(page, "table-move").first().click();
  await expect(table(page)).toContainText(/takes \d+ cards/);
  await expect(table(page)).toContainText("Turn");
  const held = await Promise.all([0, 1].map((seat) => inside(page, `table-war-${seat}`).getAttribute("count")));
  expect(Number(held[0]) + Number(held[1])).toBeLessThanOrEqual(52);
  await expect(page.locator(at("table-code"))).toContainText('<toranpu-table game="war" players="2"');
  await sound(page, errors);
});
