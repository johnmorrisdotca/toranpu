// Embedding, by real taps: the embed page at each size, in Japanese, with a closed hand and with one
// card; framed in a page of another site, which it tells of its height and of each change; and the
// demo's panel that writes both ways of putting a hand on a page.
import { expect, test } from "@playwright/test";

import { at, open, serve, sound, tap } from "./demo.mjs";

async function embed(page, query) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.goto(`http://toranpu.test/embed/?${query}`);
  return errors;
}
const card = (page, selector) => page.locator(selector).evaluate((one) => Math.round(one.shadowRoot.querySelector(".slot, .card")?.offsetWidth ?? 0));

for (const [size, width] of [["small", 46], ["medium", 70], ["large", 104]]) {
  test(`at ${size}, the hand's cards are ${width} pixels wide where there is room, and nothing pokes out`, async ({ page }) => {
    const errors = await embed(page, `hand=AS+KH+QD&size=${size}`);
    await expect(page.locator("toranpu-hand")).toHaveAttribute("aria-label", "Hand: ace of spades, king of hearts, queen of diamonds");
    expect(await card(page, "toranpu-hand")).toBe(width);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    await expect(page.locator("#turn")).toBeVisible({ visible: size === "large" });
    expect(errors).toEqual([]);
  });
}

test("large: the cards are named, and the button turns the hand face down one by one and back", async ({ page }) => {
  const errors = await embed(page, "hand=2C+3D&size=large&lang=ja&back=classic-blue&design=four-colour");
  await expect(page.locator("#names")).toHaveText("クラブの2、ダイヤの3");
  await expect(page.locator("#turn")).toHaveText("裏返す");
  await tap(page, "#turn");
  await expect(page.locator("toranpu-hand")).toHaveAttribute("aria-label", "伏せた手札（2枚）");
  await expect(page.locator("#names")).toHaveText("");
  await tap(page, "#turn");
  await expect(page.locator("#names")).toHaveText("クラブの2、ダイヤの3");
  await expect(page.locator("toranpu-hand")).toHaveAttribute("back", "classic-blue");
  expect(errors).toEqual([]);
});

test("a closed hand opens on a tap; one card turns over on a tap; what is not a hand is said plainly", async ({ page }) => {
  let errors = await embed(page, "hand=AS+KH+QD+JC&closed=0.9");
  const hand = page.locator("toranpu-hand");
  await expect(hand).toHaveAttribute("aria-expanded", "false");
  await tap(page, hand);
  await expect(hand).toHaveAttribute("aria-expanded", "true");
  expect(errors).toEqual([]);

  errors = await embed(page, "card=QS&design=english");
  const one = page.locator("toranpu-card");
  await expect(one).toHaveAttribute("aria-label", "queen of spades");
  await tap(page, one);
  await expect(one).toHaveAttribute("aria-label", "a card, face down");

  await embed(page, "hand=AS+ZZ&lang=en");
  await expect(page.locator(".bad")).toHaveText("Those are not cards. Write them as AS KH 10D (and JOKER, RULES or BLANK), or in the deck's one-letter codes. A hand holds at most four jokers, two rules cards and two blanks.");
  await expect(page.locator("toranpu-hand")).toHaveCount(0);
  // Only what looks like a colour is taken as one.
  await embed(page, 'hand=AS&back-colour=red"><script>&felt=12345z');
  await expect(page.locator("toranpu-hand")).not.toHaveAttribute("back-colour", /.*/);
});

test("framed by another site, the page tells it its height and each change", async ({ page }) => {
  await serve(page);
  await page.route("http://another.test/", (route) => route.fulfill({ contentType: "text/html", body: `<!doctype html><meta charset="utf-8"><script>window.told = []; addEventListener("message", (event) => window.told.push(event.data));</script><iframe src="http://toranpu.test/embed/?hand=AS+KH&size=large" width="360" height="360" style="border:0"></iframe>` }));
  await page.goto("http://another.test/");
  await expect.poll(() => page.evaluate(() => window.told.find((one) => one.toranpu === "height")?.height ?? 0)).toBeGreaterThan(150);
  await page.frameLocator("iframe").locator("#turn").click();
  await expect.poll(() => page.evaluate(() => window.told.filter((one) => one.toranpu === "hand"))).toEqual([{ toranpu: "hand", faceDown: true, scrunched: false, open: 1, turned: [], parted: null }]);
});

test("the demo's panel writes the iframe and the tag for the hand typed, at the size chosen", async ({ page }) => {
  const errors = await open(page, "?seed=1&back=classic-blue");
  await page.locator(at("embed-cards")).fill("10h jd qs");
  await tap(page, at("embed-large"));
  await expect(page.locator(at("embed-large"))).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(at("embed-frame-code"))).toContainText('src="https://johnmorrisdotca.github.io/toranpu/embed/?hand=TH+JD+QS&size=large&back=classic-blue"');
  await expect(page.locator(at("embed-frame-code"))).toContainText('height="360"');
  await expect(page.locator(at("embed-tag-code"))).toContainText('<toranpu-hand cards="TH JD QS" size="large" back="classic-blue"></toranpu-hand>');
  await expect(page.locator(at("embed-frame"))).toHaveAttribute("src", "embed/?hand=TH+JD+QS&size=large&back=classic-blue");
  await expect(page.frameLocator(at("embed-frame")).locator("toranpu-hand")).toHaveAttribute("cards", "TH JD QS");

  await page.locator(at("embed-cards")).fill("not cards");
  await expect(page.locator(at("embed-error"))).toHaveText("Those are not cards. Write them as AS KH 10D (and JOKER, RULES or BLANK), or in the deck's one-letter codes. A hand holds at most four jokers, two rules cards and two blanks.");
  await expect(page.locator(at("embed-cards"))).toHaveAttribute("aria-invalid", "true");
  await page.locator(at("embed-cards")).fill("AS");
  await expect(page.locator(at("embed-error"))).toHaveText("");
  // A joker, the way it is written on the box: the hand takes it, with the rules card and the blank a pack is sold with.
  await page.locator(at("embed-cards")).fill("AS KH QD JC JOKER");
  await expect(page.locator(at("embed-error"))).toHaveText("");
  await expect(page.locator(at("embed-tag-code"))).toContainText('cards="AS KH QD JC RJ"');
  await page.locator(at("embed-cards")).fill("JOKER JOKER RULES BLANK");
  await expect(page.frameLocator(at("embed-frame")).locator("toranpu-hand")).toHaveAttribute("aria-label", /red joker, black joker, rules card, Hearts(,| and) blank card/);
  await page.locator(at("embed-cards")).fill("JOKER JOKER JOKER JOKER JOKER");
  await expect(page.locator(at("embed-cards"))).toHaveAttribute("aria-invalid", "true");
  await sound(page, errors);
});
