// <toranpu-hand>, by real taps on the demo: turned face down all at once and one by one, face up
// again, scrunched into a bundle that shows nothing, spread out, and a closed hand opened by a tap.
import { expect, test } from "@playwright/test";

import { STRINGS } from "../dist/index.js";
import { handLayout } from "../dist/element.js";
import { at, open, sound, tap } from "./demo.mjs";

/** The hand as the page holds it: what it says, and what is drawn in it. */
const read = (page, id) =>
  page.locator(at(id)).evaluate((hand) => {
    const slots = [...hand.shadowRoot.querySelectorAll(".slot")];
    return {
      label: hand.getAttribute("aria-label"),
      expanded: hand.getAttribute("aria-expanded"),
      count: slots.length,
      faces: slots.filter((slot) => slot.querySelector(".face").innerHTML !== "").length,
      down: slots.filter((slot) => slot.dataset.down === "true").length,
      xs: slots.map((slot) => Number(slot.style.getPropertyValue("--x"))),
      delays: slots.map((slot) => slot.style.getPropertyValue("--delay")),
      width: Math.round(hand.getBoundingClientRect().width),
      html: hand.shadowRoot.innerHTML,
    };
  });
const settled = (page, id) => page.waitForFunction((testid) => !document.querySelector(`[data-testid="${testid}"]`).shadowRoot.querySelector('.hand[data-moving="true"]'), id);

test("face down all at once and face up again: while down, no face is in the page", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  let s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 7, faces: 7, down: 0 });
  expect(s.label.startsWith("Hand: ")).toBe(true);

  await tap(page, at("hand-hide"));
  await settled(page, "hide-hand");
  s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 7, faces: 0, down: 7, label: "a hand face down, cards: 7" });
  await expect(page.locator(at("hide-code"))).toContainText("hand.hide();");

  await tap(page, at("hand-show"));
  await settled(page, "hide-hand");
  s = await read(page, "hide-hand");
  expect(s).toMatchObject({ faces: 7, down: 0 });
  await sound(page, errors);
});

test("scrunched, the hand is one bundle that says neither its cards nor how many; spread out, it is the hand again", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const before = await read(page, "hide-hand");
  await tap(page, at("hand-scrunch"));
  await settled(page, "hide-hand");
  let s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 3, faces: 0, down: 3, label: "a hand of cards, squared up face down" });
  expect(s.html).not.toMatch(/aria-label="[^"]*(spades|hearts|diamonds|clubs)/);
  expect(s.width).toBeLessThan(before.width / 2);
  // Another hand of another size scrunches to the same bundle.
  await tap(page, at("hand-spread"));
  await settled(page, "hide-hand");
  s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 7, faces: 7, down: 0 });
  expect(s.xs).toEqual(before.xs);
  await sound(page, errors);
});

test.describe("with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("one by one, each card turns a gap after the one before, and their faces leave once all are down", async ({ page }) => {
    const errors = await open(page, "?seed=1");
    // What the hand looks like the moment it starts to move, caught in the page however slow the machine.
    await page.locator(at("hide-hand")).evaluate((hand) => {
      new MutationObserver((_, watcher) => {
        const moving = hand.shadowRoot.querySelector('.hand[data-moving="true"]');
        if (moving === null) return;
        const slots = [...moving.querySelectorAll(".slot")];
        window.caught = { delays: slots.map((slot) => slot.style.getPropertyValue("--delay")), faces: slots.filter((slot) => slot.querySelector(".face").innerHTML !== "").length };
        watcher.disconnect();
      }).observe(hand.shadowRoot, { subtree: true, attributes: true, childList: true });
    });
    await tap(page, at("hand-one-by-one"));
    await page.waitForFunction(() => window.caught !== undefined);
    const moving = await page.evaluate(() => window.caught);
    expect(moving.delays).toEqual(["0ms", "110ms", "220ms", "330ms", "440ms", "550ms", "660ms"]);
    expect(moving.faces, "turning, the faces are still there to be seen turning").toBe(7);
    await settled(page, "hide-hand");
    expect(await read(page, "hide-hand")).toMatchObject({ faces: 0, down: 7 });
    await expect(page.locator(at("hide-code"))).toContainText("hand.hide({ oneByOne: true, gap: 110 });");
    await sound(page, errors);
  });
});

test("a closed hand opens into a fan with a tap, and closes with another; the slider sets how closed", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  let s = await read(page, "reveal-hand");
  expect(s.expanded).toBe("false");
  expect(s.count).toBe(5);
  const closedXs = s.xs;
  expect(closedXs).toEqual(handLayout(5, { open: 0.1 }).map((place) => place.x));

  await tap(page, at("reveal-hand"));
  await settled(page, "reveal-hand");
  s = await read(page, "reveal-hand");
  expect(s.expanded).toBe("true");
  expect(s.xs).toEqual([0, 0.42, 0.84, 1.26, 1.68]);

  await tap(page, at("reveal-hand"));
  await settled(page, "reveal-hand");
  expect((await read(page, "reveal-hand")).xs).toEqual(closedXs);

  await page.locator(at("closed-amount")).fill("0.5");
  await expect(page.locator(at("reveal-hand"))).toHaveAttribute("closed", "0.5");
  expect((await read(page, "reveal-hand")).xs).toEqual(handLayout(5, { open: 0.5 }).map((place) => place.x));
  await expect(page.locator(at("reveal-code"))).toContainText('closed="0.5" reveal');

  await page.locator(at("reveal-hand")).focus();
  await page.keyboard.press("Enter");
  await settled(page, "reveal-hand");
  expect((await read(page, "reveal-hand")).expanded).toBe("true");
  await sound(page, errors);
});

test("the hands speak Japanese", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  await tap(page, '[data-lang="ja"]');
  await tap(page, at("hand-hide"));
  await settled(page, "hide-hand");
  expect((await read(page, "hide-hand")).label).toBe("伏せた手札（7枚）");
  await tap(page, at("hand-scrunch"));
  await settled(page, "hide-hand");
  expect((await read(page, "hide-hand")).label).toBe(STRINGS.ja.handScrunched);
  await expect(page.locator(at("hand-one-by-one"))).toHaveText("1枚ずつ伏せる");
  await sound(page, errors);
});
