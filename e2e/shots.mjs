// Pictures of the demo for a person to look at: `node e2e/shots.mjs <folder> <name>`. Not a test.
// The README's pictures are not made here: `pnpm screenshots:readme` takes them (scripts/readme-pictures.mjs).
import { join } from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";

import { serve } from "./demo.mjs";

const [folder = ".", name = "toranpu"] = process.argv.slice(2);
const browser = await chromium.launch();
/** Play `moves` of the game as a person would: tap the cards a move names, then its button, and let the computers answer. */
async function advance(page, moves) {
  const settled = () => page.waitForFunction(() => !/thinking|考えています/.test(document.querySelector('[data-testid="status"]').textContent) && document.querySelector('[data-testid="status"]').textContent !== "");
  for (let n = 0; n < moves; n += 1) {
    await settled();
    const offered = await page.locator('[data-testid="move"]').evaluateAll((buttons) => buttons.map((button) => button.dataset.move));
    if (offered.length > 0) {
      const move = JSON.parse(offered[0]);
      const cards = Object.values(move).flatMap((value) => (Array.isArray(value) ? value : [value])).filter((value) => typeof value === "string" && /^[A2-9TJQK][SHDC]$/.test(value));
      for (const card of cards) {
        const one = page.locator(`[data-testid="hand"] [data-card="${card}"]`).first();
        if ((await one.getAttribute("aria-pressed")) !== "true") await one.click();
      }
      await page.locator(`[data-testid="move"][data-move='${offered[0]}']`).click();
    } else {
      // Nothing to press yet: pick another card (a pass of three cards takes three picks).
      const usable = page.locator('[data-testid="hand"] .card:not(:disabled):not([aria-pressed="true"])');
      if ((await usable.count()) === 0) break;
      await usable.first().click();
    }
  }
  await settled();
}

async function shot({ width, height = 844, colorScheme, lang, query, path, fullPage = true, which = "", moves = 0, scrollTo = "" }) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2 });
  const page = await context.newPage();
  await serve(page);
  await page.addInitScript(() => {
    window.toranpuDelay = 0;
  });
  await page.goto(`http://toranpu.test/${which}?lang=${lang}&${query}`);
  if (which === "") {
    await page.waitForFunction(() => !/thinking|考えています/.test(document.querySelector('[data-testid="status"]').textContent) && document.querySelector('[data-testid="status"]').textContent !== "");
    if (moves > 0) await advance(page, moves);
    else {
      const first = page.locator('[data-testid="hand"] .card:not(:disabled)').first();
      if ((await first.count()) > 0) await first.click();
    }
  }
  if (scrollTo) await page.locator(scrollTo).evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
  await page.screenshot({ path, fullPage, ...(path.endsWith(".jpg") ? { type: "jpeg", quality: 76 } : {}) });
  await context.close();
}
  for (const width of [390, 1280]) for (const colorScheme of ["light", "dark"]) for (const lang of ["en", "ja"]) await shot({ width, colorScheme, lang, query: "game=hearts&players=4&seed=2026", path: join(folder, `${name}-${width}-${colorScheme}-${lang}.png`) });
  await shot({ width: 390, colorScheme: "light", lang: "en", query: "", which: "api.html", path: join(folder, `${name}-api-390.png`), fullPage: false });
  await shot({ width: 1280, colorScheme: "dark", lang: "ja", query: "", which: "api.html", path: join(folder, `${name}-api-1280.png`), fullPage: false });
await browser.close();
