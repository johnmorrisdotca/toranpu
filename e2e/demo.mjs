// What every demo test starts from: the built demo in `site/`, served to the
// page without a port, and the table's state read off the page.
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { expect, test } from "@playwright/test";

const site = join(dirname(fileURLToPath(import.meta.url)), "..", "site");
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json" };

/** Serve `site/` to a page at http://toranpu.test/. */
export async function serve(page) {
  if (!existsSync(join(site, "index.html"))) throw new Error("site/ is not built: run `pnpm site` first (`pnpm test:demo` does)");
  await page.route("http://toranpu.test/**", (route) => {
    const { pathname } = new URL(route.request().url());
    const file = join(site, pathname === "/" ? "index.html" : pathname);
    if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
    return route.fulfill({ body: readFileSync(file), contentType: TYPES[file.slice(file.lastIndexOf("."))] ?? "application/octet-stream" });
  });
}

/** Open the demo with a query, the computers moving at once, and collect anything the page complains of. */
export async function open(page, query = "", path = "") {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  await serve(page);
  await page.addInitScript(() => {
    window.toranpuDelay = 0;
  });
  await page.goto(`http://toranpu.test/${path}${query}`);
  if (path === "") await expect(page.locator('[data-testid="status"]')).not.toBeEmpty();
  return errors;
}

export const at = (id) => `[data-testid="${id}"]`;

/** Tap, as a finger would where the page is touched and as a mouse where it is not. */
export async function tap(page, selector) {
  const target = typeof selector === "string" ? page.locator(selector).first() : selector;
  await target.scrollIntoViewIfNeeded();
  if (test.info().project.use.hasTouch === true) await target.tap();
  else await target.click();
}

/** Wait until a person is to play, or the game is over: the computers have finished moving. */
export async function settled(page) {
  await page.waitForFunction(() => {
    const status = document.querySelector('[data-testid="status"]').textContent;
    return !/thinking|考えています/.test(status);
  });
}

/** Make a move as a person does: tap the cards it names, then the button that says it. */
export async function make(page, move) {
  const cards = Object.values(move).flatMap((value) => (Array.isArray(value) ? value : [value])).filter((value) => typeof value === "string" && /^[A2-9TJQK][SHDC]$/.test(value));
  for (const card of cards) await tap(page, `${at("hand")} [data-card="${card}"]`);
  await tap(page, `${at("move")}[data-move='${JSON.stringify(move)}']`);
  await settled(page);
}

/** The table as the page shows it. */
export function state(page) {
  return page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const all = (s) => [...document.querySelectorAll(s)];
    const text = (id) => q(`[data-testid="${id}"]`).textContent;
    return {
      lang: document.documentElement.lang,
      game: q('[data-testid="games"] [aria-pressed="true"]').dataset.testid.replace("game-", ""),
      players: Number(q('[data-testid="players"]').value),
      seed: Number(q('[data-testid="seed"]').value),
      status: text("status"),
      seats: all('[data-testid="seats"] .seat').map((seat) => ({ who: seat.querySelector(".who").textContent, meta: seat.querySelector(".meta").textContent, turn: seat.dataset.turn === "true" })),
      hand: all('[data-testid="hand"] .card').map((card) => card.dataset.card),
      usable: all('[data-testid="hand"] .card:not(:disabled)').map((card) => card.dataset.card),
      moves: all('[data-testid="move"]').map((button) => button.textContent),
      offered: all('[data-testid="move"]').map((button) => JSON.parse(button.dataset.move)),
      log: all('[data-testid="log"] li').map((li) => li.textContent),
      kept: text("kept"),
      error: text("read-error"),
      blurb: text("blurb"),
      pitch: q('[data-say="pitch"]').textContent,
      unreviewed: !q("#unreviewed").hidden,
      fans: all('[data-testid="fan"]').map((fan) => [...fan.querySelectorAll(".card")].map((card) => card.dataset.card)),
      deckCode: text("deck-code"),
      deckLeft: text("deck-left"),
      address: location.search,
    };
  });
}

/** What holds in every state a page can be in: nothing wider than the screen, nothing too small to tap, nothing complained of. */
export async function sound(page, errors) {
  const found = await page.evaluate(() => {
    const all = (s) => [...document.querySelectorAll(s)];
    const box = (e) => e.getBoundingClientRect();
    return {
      pageWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth,
      // Anything to be tapped that is smaller than a fingertip. Links in running text are words, not targets.
      small: all("main button, main input, main select, nav a, footer .family a, .api-contents a")
        .filter((e) => box(e).width > 0 && !e.hidden && (box(e).height < 43.5 || box(e).width < 43.5))
        .map((e) => `${e.dataset.testid ?? e.textContent}: ${Math.round(box(e).width)}×${Math.round(box(e).height)}`),
      // Anything that pokes out of the page sideways.
      wide: all("main *")
        .filter((e) => box(e).width > 0 && box(e).right > window.innerWidth + 0.5 && !e.closest(".fam-table-box, pre, .log"))
        .map((e) => `${e.tagName} ${e.className}`),
    };
  });
  expect(found.pageWidth, "the page is no wider than the window").toBe(found.windowWidth);
  expect(found.wide, "nothing pokes out sideways").toEqual([]);
  expect(found.small, "every target is at least 44px").toEqual([]);
  expect(errors, "the page complained of nothing").toEqual([]);
}
