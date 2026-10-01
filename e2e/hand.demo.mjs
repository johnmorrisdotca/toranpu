// <toranpu-hand>, by real taps on the demo: turned face down all at once and one by one, face up
// again, scrunched into a bundle that shows nothing, spread out, and a closed hand opened by a tap.
import { expect, test } from "@playwright/test";

import { STRINGS } from "../dist/index.js";
import { arrangeCards, handLayout } from "../dist/element.js";
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
      // How far the middle of the cards lies from the middle of the hand, in pixels: a hand gathers and spreads about its own middle.
      offCentre: (() => {
        const box = hand.getBoundingClientRect();
        const rects = slots.map((slot) => slot.getBoundingClientRect());
        return Math.round((Math.min(...rects.map((r) => r.left)) + Math.max(...rects.map((r) => r.right))) / 2 - (box.left + box.width / 2));
      })(),
      html: hand.shadowRoot.innerHTML,
    };
  });
/** A layout's places across, laid in the middle of the room a full fan of `count` takes, as the hand lays every state. */
const centredXs = (count, open) => {
  const xs = handLayout(count, { open }).map((place) => place.x);
  const frame = Math.max(0, ...handLayout(count, { open: 1 }).map((place) => place.x));
  const span = Math.max(0, ...xs);
  return xs.map((x) => Math.round((x + (frame - span) / 2) * 1000) / 1000);
};
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
  await tap(page, at("hand-hide"));
  await settled(page, "hide-hand");
  await tap(page, at("hand-scrunch"));
  await settled(page, "hide-hand");
  let s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 3, faces: 0, down: 3, label: "a hand of cards, squared up face down" });
  expect(s.html).not.toMatch(/aria-label="[^"]*(spades|hearts|diamonds|clubs)/);
  // Squared up where the hand lies: the hand keeps its room, and the bundle sits in its middle, so nothing beside it moves.
  expect(s.width).toBe(before.width);
  expect(Math.abs(s.offCentre)).toBeLessThanOrEqual(2);
  // Another hand of another size scrunches to the same bundle.
  await tap(page, at("hand-spread"));
  await settled(page, "hide-hand");
  s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 7, faces: 0, down: 7 });
  expect(s.xs).toEqual(before.xs);
  expect(s.width).toBe(before.width);
  await sound(page, errors);
});

test("a scrunch only gathers: a hand face up stays face up, its top card showing, and spreads out face up", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  await tap(page, at("hand-scrunch"));
  await settled(page, "hide-hand");
  let s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 3, down: 0 });
  expect(s.label).toMatch(/^a hand of cards, squared up, .+ on top$/);
  await tap(page, at("hand-spread"));
  await settled(page, "hide-hand");
  s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 7, faces: 7, down: 0 });
  await sound(page, errors);
});

test("a card turned over by itself, then every card each to its other side; face down, nothing is left turned", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const hand = page.locator(at("hide-hand"));
  const cards = (await hand.getAttribute("cards")).split(" ");
  await page.selectOption(at("hand-card"), cards[1]);
  await tap(page, at("hand-toggle"));
  await settled(page, "hide-hand");
  let s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 7, faces: 6, down: 1 });
  await expect(hand).toHaveAttribute("turned", cards[1]);
  expect(s.label).toContain("a card, face down");
  await expect(page.locator(at("hide-code"))).toContainText(`hand.toggle("${cards[1]}");`);
  await tap(page, at("hand-toggle-all"));
  await settled(page, "hide-hand");
  s = await read(page, "hide-hand");
  expect(s).toMatchObject({ faces: 1, down: 6 });
  expect((await hand.getAttribute("turned")).split(" ").sort()).toEqual(cards.filter((card) => card !== cards[1]).sort());
  await tap(page, at("hand-hide"));
  await settled(page, "hide-hand");
  expect(await read(page, "hide-hand")).toMatchObject({ faces: 0, down: 7 });
  await expect(hand).not.toHaveAttribute("turned", /.*/);
  await sound(page, errors);
});

test("parted at a card, it lifts clear upright and the cards either side draw away; closed up, it is the fan again", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const before = await read(page, "hide-hand");
  const cards = (await page.locator(at("hide-hand")).getAttribute("cards")).split(" ");
  await page.selectOption(at("hand-card"), cards[3]);
  await tap(page, at("hand-part"));
  await settled(page, "hide-hand");
  const s = await read(page, "hide-hand");
  const lifted = await page.locator(at("hide-hand")).evaluate((hand) => {
    const slot = hand.shadowRoot.querySelector('.slot[data-at="3"]');
    return { y: Number(slot.style.getPropertyValue("--y")), r: slot.style.getPropertyValue("--r") };
  });
  expect(lifted).toEqual({ y: -0.2, r: "0deg" });
  // A whole card and the gap clear on each side: three groups, the left, it, and the right.
  expect(s.xs[3] - s.xs[2]).toBeCloseTo(1.12, 2);
  expect(s.xs[4] - s.xs[3]).toBeCloseTo(1.12, 2);
  // Seven cards close up enough to keep the hand's room.
  expect(s.width).toBe(before.width);
  await expect(page.locator(at("hide-hand"))).toHaveAttribute("parted", cards[3]);
  await tap(page, at("hand-unpart"));
  await settled(page, "hide-hand");
  expect((await read(page, "hide-hand")).xs).toEqual(before.xs);
  await sound(page, errors);
});

test("a marked card carries a dot face up and face down, and a screen reader hears it; marks clear", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const hand = page.locator(at("hide-hand"));
  const cards = (await hand.getAttribute("cards")).split(" ");
  const markers = () => hand.evaluate((one) => [...one.shadowRoot.querySelectorAll(".slot")].flatMap((slot, at) => (slot.querySelector(".marker") === null ? [] : [at])));
  await page.selectOption(at("hand-card"), cards[2]);
  await tap(page, at("hand-mark"));
  expect(await markers()).toEqual([2]);
  expect(await hand.getAttribute("aria-label")).toContain(", marked");
  await tap(page, at("hand-hide"));
  await settled(page, "hide-hand");
  expect(await markers()).toEqual([2]);
  expect(await hand.getAttribute("aria-label")).toContain("a card, face down, marked");
  await tap(page, at("hand-mix"));
  await settled(page, "hide-hand");
  const now = (await hand.getAttribute("cards")).split(" ");
  expect(await markers()).toEqual([now.indexOf(cards[2])]);
  await tap(page, at("hand-unmark"));
  expect(await markers()).toEqual([]);
  await sound(page, errors);
});

test("grouped into number cards and face cards", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const hand = page.locator(at("hide-hand"));
  await tap(page, at("hand-group-face"));
  await settled(page, "hide-hand");
  await expect(hand).toHaveAttribute("order", "face");
  const drawn = await hand.evaluate((one) => [...one.shadowRoot.querySelectorAll(".slot .face")].map((face) => face.dataset.card));
  expect(drawn).toEqual(arrangeCards((await hand.getAttribute("cards")).split(" "), "face"));
  const faceAt = drawn.findIndex((card) => "JQK".includes(card[0]));
  if (faceAt !== -1) expect(drawn.slice(faceAt).every((card) => "JQK".includes(card[0]))).toBe(true);
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

test.describe("a new deal, with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("given new cards, a hand gathers the old ones in and opens on the new, where it lay and the same size", async ({ page }) => {
    const errors = await open(page, "?seed=1");
    const hand = page.locator(at("hide-hand"));
    const before = await read(page, "hide-hand");
    const firstName = () => hand.evaluate((element) => element.shadowRoot.querySelector('.slot[data-at="0"] .face')?.dataset.card ?? null);
    const oldName = await firstName();
    expect(oldName).not.toBeNull();
    await hand.evaluate((element) => element.setAttribute("cards", "AH 2H 3H 4H 5H 6H 7H"));
    // Straight after: the OLD cards are on the table, moving, gathering into a stack.
    expect(await firstName()).toBe(oldName);
    expect(await hand.evaluate((element) => element.shadowRoot.querySelector('.hand[data-moving="true"]') !== null)).toBe(true);
    const gathering = await read(page, "hide-hand");
    expect(Math.max(...gathering.xs) - Math.min(...gathering.xs)).toBeLessThan(Math.max(...before.xs) - Math.min(...before.xs));
    // Then the new cards open out of the stack, and lie as a hand of seven always lies, in the same room.
    await expect.poll(firstName).toBe("AH");
    await settled(page, "hide-hand");
    const after = await read(page, "hide-hand");
    expect(after.xs).toEqual(before.xs);
    expect(after.width).toBe(before.width);
    expect(Math.abs(after.offCentre)).toBeLessThanOrEqual(2);
    await sound(page, errors);
  });
});

test("a closed hand opens into a fan with a tap, and closes with another; the slider sets how closed", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  let s = await read(page, "reveal-hand");
  expect(s.expanded).toBe("false");
  expect(s.count).toBe(5);
  const closedXs = s.xs;
  expect(closedXs).toEqual(centredXs(5, 0.1));
  const closedWidth = s.width;
  expect(Math.abs(s.offCentre)).toBeLessThanOrEqual(2);

  await tap(page, at("reveal-hand"));
  await settled(page, "reveal-hand");
  s = await read(page, "reveal-hand");
  expect(s.expanded).toBe("true");
  expect(s.xs).toEqual([0, 0.42, 0.84, 1.26, 1.68]);
  // Opened from where it lay, and closed back there: the hand is the same size open and closed.
  expect(s.width).toBe(closedWidth);

  await tap(page, at("reveal-hand"));
  await settled(page, "reveal-hand");
  s = await read(page, "reveal-hand");
  expect(s.xs).toEqual(closedXs);
  expect(s.width).toBe(closedWidth);

  await page.locator(at("closed-amount")).fill("0.5");
  await expect(page.locator(at("reveal-hand"))).toHaveAttribute("closed", "0.5");
  expect((await read(page, "reveal-hand")).xs).toEqual(centredXs(5, 0.5));
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

test.describe("the deck's seats, dealt again with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("shuffled, the seats gather and open in turn, a seat after the one before, each on its new cards", async ({ page }) => {
    const errors = await open(page, "?seed=1");
    const seats = page.locator('[data-testid="fan"]');
    await expect(seats).toHaveCount(4);
    await expect(page.locator(at("deck-gap"))).toHaveValue("150");
    const shown = () => seats.evaluateAll((hands) => hands.map((hand) => ({ moving: hand.shadowRoot.querySelector('.hand[data-moving="true"]') !== null, first: hand.shadowRoot.querySelector('.slot[data-at="0"] .face')?.dataset.card ?? null, cards: hand.getAttribute("cards") })));
    const before = await shown();
    await tap(page, at("shuffle"));
    const now = await shown();
    // The first seat is on its way; the last still shows its old cards, waiting its turn.
    expect(now[0].moving).toBe(true);
    expect(now[3].moving).toBe(false);
    expect(now[3].first).toBe(before[3].first);
    expect(now[3].cards).not.toBe(before[3].cards);
    // In the end every seat lies on its new cards.
    await expect.poll(async () => (await shown()).every((seat) => !seat.moving && seat.first === seat.cards.split(" ")[0]), { timeout: 5000 }).toBe(true);
    await sound(page, errors);
  });
});

test("a scrunched hand turned face up stays squared, its top card showing and still no count; spread out, it is face up", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const before = await read(page, "hide-hand");
  const cards = (await page.locator(at("hide-hand")).getAttribute("cards")).split(" ");
  await tap(page, at("hand-scrunch"));
  await settled(page, "hide-hand");
  await tap(page, at("hand-show"));
  await settled(page, "hide-hand");
  let s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 3, down: 0 });
  expect(s.label).toMatch(/^a hand of cards, squared up, .+ on top$/);
  expect(s.width).toBe(before.width);
  const top = await page.locator(at("hide-hand")).evaluate((hand) => hand.shadowRoot.querySelector('.slot[data-at="2"] .face').dataset.card);
  expect(top).toBe(cards[cards.length - 1]);
  // Face down again, it is the bundle that says nothing.
  await tap(page, at("hand-hide"));
  await settled(page, "hide-hand");
  s = await read(page, "hide-hand");
  expect(s).toMatchObject({ count: 3, faces: 0, down: 3, label: "a hand of cards, squared up face down" });
  await tap(page, at("hand-show"));
  await settled(page, "hide-hand");
  await tap(page, at("hand-spread"));
  await settled(page, "hide-hand");
  expect(await read(page, "hide-hand")).toMatchObject({ count: 7, faces: 7, down: 0 });
  await sound(page, errors);
});

test("a hand sorted by rank, grouped by suit, and laid out as dealt again", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const hand = page.locator(at("hide-hand"));
  const dealt = (await hand.getAttribute("cards")).split(" ");
  const shownOrder = () => hand.evaluate((element) => [...element.shadowRoot.querySelectorAll(".slot .face")].map((face) => face.dataset.card));
  const { arrangeCards } = await import("../dist/element.js");
  await tap(page, at("hand-sort"));
  await settled(page, "hide-hand");
  expect(await shownOrder()).toEqual(arrangeCards(dealt, "rank"));
  await expect(hand).toHaveAttribute("order", "rank");
  await tap(page, at("hand-group"));
  await settled(page, "hide-hand");
  expect(await shownOrder()).toEqual(arrangeCards(dealt, "suit"));
  await expect(page.locator(at("hide-code"))).toContainText('order="rank"');
  await tap(page, at("hand-unsort"));
  await settled(page, "hide-hand");
  expect(await shownOrder()).toEqual(dealt);
  await expect(hand).not.toHaveAttribute("order", /./);
  await sound(page, errors);
});

test.describe("a hand sorted, with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("sorted, each card slides from where it lay to its new place", async ({ page }) => {
    const errors = await open(page, "?seed=1");
    const hand = page.locator(at("hide-hand"));
    const before = await read(page, "hide-hand");
    const dealt = (await hand.getAttribute("cards")).split(" ");
    // Where each card is drawn on the screen, by card: before the sort, and the moment the cards start to move.
    const lefts = () =>
      hand.evaluate((element) => Object.fromEntries([...element.shadowRoot.querySelectorAll(".slot")].map((slot) => [slot.querySelector(".face").dataset.card, Math.round(slot.getBoundingClientRect().left)])));
    const lay = await lefts();
    await hand.evaluate((element) => {
      new MutationObserver((_, watcher) => {
        const moving = element.shadowRoot.querySelector('.hand[data-moving="true"]');
        if (moving === null) return;
        window.sortCaught = Object.fromEntries([...moving.querySelectorAll(".slot")].map((slot) => [slot.querySelector(".face").dataset.card, Math.round(slot.getBoundingClientRect().left)]));
        watcher.disconnect();
      }).observe(element.shadowRoot, { subtree: true, attributes: true, childList: true });
    });
    await tap(page, at("hand-sort"));
    await page.waitForFunction(() => window.sortCaught !== undefined);
    const start = await page.evaluate(() => window.sortCaught);
    // Each card starts where it lay when dealt, not where it is going…
    for (const card of dealt) expect(Math.abs(start[card] - lay[card]), card).toBeLessThanOrEqual(2);
    const { arrangeCards } = await import("../dist/element.js");
    expect(dealt.some((card, at) => arrangeCards(dealt, "rank").indexOf(card) !== at), "the sort moves something").toBe(true);
    await settled(page, "hide-hand");
    // …and ends in the hand's same places, now in rank order.
    const after = await read(page, "hide-hand");
    expect(after.xs).toEqual(before.xs);
    expect(after.width).toBe(before.width);
    await sound(page, errors);
  });
});

test("mixed up, the hand holds the same cards in another order; a card tossed is gone; a card replaced lands at the front or the end", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const hand = page.locator(at("hide-hand"));
  const cards = async () => (await hand.getAttribute("cards")).split(" ");
  const shown = () => hand.evaluate((element) => [...element.shadowRoot.querySelectorAll(".slot .face")].map((face) => face.dataset.card));
  const dealt = await cards();
  await tap(page, at("hand-mix"));
  await settled(page, "hide-hand");
  const mixed = await cards();
  expect(mixed).not.toEqual(dealt);
  expect([...mixed].sort()).toEqual([...dealt].sort());
  expect(await shown()).toEqual(mixed);

  // Toss and replace act on the card chosen, which stays chosen while the hand holds it.
  const middle = await page.locator(at("hand-card")).inputValue();
  expect(mixed).toContain(middle);
  await tap(page, at("hand-toss"));
  await expect.poll(cards).toEqual(mixed.filter((card) => card !== middle));
  await settled(page, "hide-hand");
  expect(await shown()).toEqual(await cards());
  await expect(page.locator(at("hide-code"))).toContainText(`hand.toss("${middle}");`);

  // At the end, unless asked; then at the front.
  let before = await cards();
  let out = await page.locator(at("hand-card")).inputValue();
  await tap(page, at("hand-replace"));
  await expect.poll(async () => (await cards()).length).toBe(before.length);
  let after = await cards();
  expect(after.slice(0, -1)).toEqual(before.filter((card) => card !== out));
  expect(before).not.toContain(after[after.length - 1]);
  await page.locator(at("hand-receive")).selectOption("front");
  await expect(hand).toHaveAttribute("receive", "front");
  before = after;
  out = await page.locator(at("hand-card")).inputValue();
  await tap(page, at("hand-replace"));
  await expect.poll(async () => (await cards())[0]).not.toBe(before[0]);
  after = await cards();
  expect(after.slice(1)).toEqual(before.filter((card) => card !== out));
  await settled(page, "hide-hand");
  expect(await shown()).toEqual(after);
  await sound(page, errors);
});

test.describe("a card tossed, with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("lifts away before the hand closes up after it", async ({ page }) => {
    const errors = await open(page, "?seed=1");
    const hand = page.locator(at("hide-hand"));
    const count = (await hand.getAttribute("cards")).split(" ").length;
    // Watched in the page from before the tap, however slow the machine: the card lifts while the hand still holds it.
    await hand.evaluate((element) => {
      window.lift = null;
      new MutationObserver((_, watcher) => {
        const lifting = [...element.shadowRoot.querySelectorAll(".slot")].filter((slot) => slot.style.opacity === "0").length;
        if (lifting === 0) return;
        window.lift = { lifting, cards: element.getAttribute("cards").split(" ").length };
        watcher.disconnect();
      }).observe(element.shadowRoot, { subtree: true, attributes: true, attributeFilter: ["style"] });
    });
    await tap(page, at("hand-toss"));
    await page.waitForFunction(() => window.lift !== null);
    expect(await page.evaluate(() => window.lift)).toEqual({ lifting: 1, cards: count });
    await expect.poll(async () => (await hand.getAttribute("cards")).split(" ").length).toBe(count - 1);
    await settled(page, "hide-hand");
    await sound(page, errors);
  });
});

test.describe("a card spun, with motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("spins the way chosen, whole turns, and comes to rest as it lay", async ({ page }) => {
    const errors = await open(page, "?seed=1");
    const hand = page.locator(at("hide-hand"));
    const cards = (await hand.getAttribute("cards")).split(" ");
    await page.selectOption(at("hand-card"), cards[4]);
    await page.selectOption(at("hand-spin-way"), "anticlockwise");
    await tap(page, at("hand-spin"));
    const spinning = await hand.evaluate((one) =>
      [...one.shadowRoot.querySelectorAll(".slot .spin")].flatMap((spin, at) => spin.getAnimations().map((run) => ({ at, to: run.effect.getKeyframes().at(-1).transform }))),
    );
    expect(spinning).toEqual([{ at: 4, to: "rotate(-1080deg)" }]);
    await expect(page.locator(at("hide-code"))).toContainText(`hand.spin("${cards[4]}", { direction: "anticlockwise" });`);
    await tap(page, at("hand-spin-all"));
    expect(await hand.evaluate((one) => [...one.shadowRoot.querySelectorAll(".slot .spin")].filter((spin) => spin.getAnimations().length > 0).length)).toBe(7);
    await expect.poll(() => hand.evaluate((one) => one.shadowRoot.getAnimations?.().length ?? [...one.shadowRoot.querySelectorAll(".spin")].filter((spin) => spin.getAnimations().length > 0).length), { timeout: 6000 }).toBe(0);
    await sound(page, errors);
  });
});
