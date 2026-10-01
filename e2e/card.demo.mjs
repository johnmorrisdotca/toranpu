// <toranpu-card>, by real taps: on the demo, and on a page of its own with nothing but the element.
import { expect, test } from "@playwright/test";

import { cardFaceSvg } from "../dist/card-faces.js";
import { at, open, serve, sound, tap } from "./demo.mjs";

/** A page holding only what is given, with the elements registered from the built package. */
async function bare(page, html, { lang = "en" } = {}) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.route("http://toranpu.test/bare.html", (route) => route.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body>${html}<script type="module" src="dist/element-define.js"></script></body></html>` }));
  await page.goto("http://toranpu.test/bare.html");
  await page.waitForFunction(() => customElements.get("toranpu-card") !== undefined);
  return errors;
}
const inside = (page, selector) => page.locator(selector).evaluate((card) => ({ label: card.getAttribute("aria-label"), role: card.getAttribute("role"), down: card.hasAttribute("face-down"), face: card.shadowRoot.querySelector(".face").innerHTML, back: card.shadowRoot.querySelector(".back").innerHTML, width: Math.round(card.getBoundingClientRect().width) }));

test("a tap turns the card over and back; while it is down its face is not in the page", async ({ page }) => {
  const errors = await bare(page, '<toranpu-card id="c" card="QS" flip></toranpu-card>');
  const turns = [];
  await page.exposeFunction("turned", (detail) => turns.push(detail));
  await page.evaluate(() => document.addEventListener("toranpu-flip", (event) => window.turned(event.detail)));
  let s = await inside(page, "#c");
  expect(s).toMatchObject({ label: "queen of spades", role: "button", down: false, back: "" });
  // The face is the package's plain queen of spades: a Q in the corners and the frame, all in the spades' ink.
  expect(s.face.match(/>Q<\/text>/g)).toHaveLength(3);
  expect(s.face).toContain("var(--toranpu-card-ink,#1b1b1b)");
  expect(s.face.length).toBeGreaterThan(cardFaceSvg("QS").length * 0.9);

  await tap(page, "#c");
  await expect(page.locator("#c")).toHaveAttribute("aria-label", "a card, face down");
  s = await inside(page, "#c");
  expect(s.down).toBe(true);
  expect(s.face, "the face is gone once the card lies face down").toBe("");
  expect(s.back).toContain("var(--toranpu-back,#b3262d)");

  await page.locator("#c").focus();
  await page.keyboard.press("Enter");
  await expect(page.locator("#c")).toHaveAttribute("aria-label", "queen of spades");
  await page.keyboard.press(" ");
  await expect(page.locator("#c")).toHaveAttribute("aria-label", "a card, face down");
  expect(turns).toEqual([{ card: "QS", faceDown: true }, { card: "QS", faceDown: false }, { card: "QS", faceDown: true }]);
  expect(errors).toEqual([]);
});

test("without flip a card is a picture: a tap does nothing; it takes a size, a width, a back and Japanese", async ({ page }) => {
  const errors = await bare(
    page,
    '<toranpu-card id="a" card="TD"></toranpu-card><toranpu-card id="b" card="RJ" size="small"></toranpu-card><toranpu-card id="c" card="2C" width="150" face-down back="ink-dots" mark="五つ"></toranpu-card><toranpu-card id="d" card="KS" lang="ja"></toranpu-card><toranpu-card id="e" card="ZZ"></toranpu-card>',
  );
  await tap(page, "#a");
  const a = await inside(page, "#a");
  expect(a).toMatchObject({ label: "ten of diamonds", role: "img", down: false, width: 70 });
  expect((await inside(page, "#b")).width).toBe(46);
  const c = await inside(page, "#c");
  expect(c).toMatchObject({ width: 150, down: true, face: "", label: "a card, face down" });
  expect(c.back).toContain(">五つ</text>");
  expect((await inside(page, "#d")).label).toBe("スペードのキング");
  expect((await inside(page, "#e")).label).toBe("");
  expect(errors).toEqual([]);
});

test("the English pattern is fetched the first time a card asks for it, and drawn when it comes", async ({ page }) => {
  const errors = await bare(page, '<toranpu-card id="k" card="KS" design="english"></toranpu-card>');
  await expect.poll(async () => (await inside(page, "#k")).face).toContain("scale(0.25926)");
  expect(errors).toEqual([]);
});

test("on the demo: the card takes the look chosen above, turns on a tap, and its picture is on the site", async ({ page }) => {
  const errors = await open(page, "?seed=1&design=four-colour&back=classic-blue");
  await page.locator(at("one-card-pick")).selectOption("JD");
  await expect(page.locator(at("one-card"))).toHaveAttribute("card", "JD");
  await expect(page.locator(at("one-card"))).toHaveAttribute("design", "four-colour");
  await expect(page.locator(at("one-card"))).toHaveAttribute("back", "classic-blue");
  await expect(page.locator(at("one-card-code"))).toContainText('<toranpu-card card="JD" design="four-colour" back="classic-blue" flip>');
  await tap(page, at("one-card"));
  await expect(page.locator(at("one-card"))).toHaveAttribute("face-down", "");
  expect((await inside(page, at("one-card"))).back).toContain("#1f4e8c");
  await expect(page.locator(at("one-card-img"))).toHaveAttribute("src", "cards/four-colour/JD.svg");
  await expect.poll(() => page.locator(at("one-card-img")).evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  await expect(page.locator(at("one-card-url"))).toContainText("https://johnmorrisdotca.github.io/toranpu/cards/four-colour/JD.svg");
  await sound(page, errors);

  await tap(page, '[data-lang="ja"]');
  await expect(page.locator(`${at("one-card-pick")} option[value="JD"]`)).toHaveText("ダイヤのジャック");
  await expect(page.locator(at("one-card"))).toHaveAttribute("aria-label", "伏せたカード");
  await sound(page, errors);
});
