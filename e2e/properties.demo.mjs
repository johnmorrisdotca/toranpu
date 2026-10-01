// A framework sets a PROPERTY, not an attribute, on a custom element that has one of the name (React 19, Vue 3 and Svelte 5
// do: `<toranpu-card flip>` is `card.flip = true`). Every attribute that is also a method or a read-only value must then
// reach the attribute, and the method must go on working.
import { expect, test } from "@playwright/test";

import { serve, tap } from "./demo.mjs";

async function bare(page, html) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.route("http://toranpu.test/bare.html", (route) => route.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>${html}<script type="module" src="dist/table-define.js"></script></body></html>` }));
  await page.goto("http://toranpu.test/bare.html");
  await page.waitForFunction(() => customElements.get("toranpu-table") !== undefined);
  return errors;
}

const ELEMENTS = '<toranpu-card id="c" card="QS"></toranpu-card><toranpu-hand id="h" cards="AS KH"></toranpu-hand><toranpu-pile id="p" cards="3C 9D"></toranpu-pile><toranpu-table id="t" game="hearts" delay="100000"></toranpu-table>';

test("assigning an attribute's name sets the attribute, for the ones that are methods or read-only too", async ({ page }) => {
  const errors = await bare(page, ELEMENTS);
  await page.evaluate(() => {
    const [card, hand, pile, table] = ["c", "h", "p", "t"].map((id) => document.getElementById(id));
    card.flip = true;
    hand.cards = "2S 3H 4D";
    hand.mark = "SITE";
    pile.cards = "5C 6D";
    pile.count = 12;
    table.game = "go-fish";
  });
  await expect(page.locator("#c")).toHaveAttribute("flip", "");
  await expect(page.locator("#h")).toHaveAttribute("cards", "2S 3H 4D");
  await expect(page.locator("#h")).toHaveAttribute("mark", "SITE");
  await expect(page.locator("#p")).toHaveAttribute("cards", "5C 6D");
  await expect(page.locator("#p")).toHaveAttribute("count", "12");
  await expect(page.locator("#t")).toHaveAttribute("game", "go-fish");
  expect(await page.locator("#h").evaluate((hand) => hand.cards)).toEqual(["2S", "3H", "4D"]);
  expect(await page.locator("#p").evaluate((pile) => pile.cards)).toEqual(["5C", "6D"]);
  // A card set flippable that way turns over when tapped; the table dealt the game it was given.
  await tap(page, "#c");
  await expect(page.locator("#c")).toHaveAttribute("aria-label", "a card, face down");
  await expect(page.locator("#t")).toHaveAttribute("data-game", "goFish");
  // An array is as good as text for a hand, and false takes a flag away.
  await page.evaluate(() => {
    document.getElementById("h").cards = ["KS", "QS"];
    document.getElementById("c").flip = false;
    document.getElementById("c").flip = null;
  });
  await expect(page.locator("#h")).toHaveAttribute("cards", "KS QS");
  await expect(page.locator("#c")).not.toHaveAttribute("flip", /.*/);
  expect(errors).toEqual([]);
});

test("the methods those names also are still work, and so do the readings", async ({ page }) => {
  const errors = await bare(page, ELEMENTS);
  const kinds = await page.evaluate(() => [["c", "flip"], ["h", "mark"], ["h", "cards"], ["p", "count"], ["t", "game"]].map(([id, name]) => `${id}.${name}:${typeof document.getElementById(id)[name]}`));
  expect(kinds).toEqual(["c.flip:function", "h.mark:function", "h.cards:object", "p.count:number", "t.game:object"]);
  await page.evaluate(() => document.getElementById("c").flip());
  await expect(page.locator("#c")).toHaveAttribute("aria-label", "a card, face down");
  await page.evaluate(() => document.getElementById("h").mark("KH"));
  await expect(page.locator("#h")).toHaveAttribute("marked", "KH");
  expect(await page.locator("#p").evaluate((pile) => pile.count)).toBe(2);
  expect(await page.locator("#t").evaluate((table) => table.game.hands.length)).toBe(4);
  expect(errors).toEqual([]);
});

test("every attribute an element watches can be set as a property without throwing", async ({ page }) => {
  const errors = await bare(page, ELEMENTS);
  const failed = await page.evaluate(() => {
    const trouble = [];
    for (const element of document.querySelectorAll("#c, #h, #p, #t")) {
      for (const name of element.constructor.observedAttributes) {
        try {
          const before = element.getAttribute(name);
          element[name.replace(/-(\w)/g, (_, letter) => letter.toUpperCase())] = before ?? "x";
        } catch (error) {
          trouble.push(`${element.localName}.${name}: ${error}`);
        }
      }
    }
    return trouble;
  });
  expect(failed).toEqual([]);
  expect(errors).toEqual([]);
});
