// Pictures of the demo for a person to look at: `node e2e/shots.mjs <folder> <name>`. Not a test.
// `node e2e/shots.mjs docs readme` takes the two pictures the README shows.
import { join } from "node:path";
import process from "node:process";

import { chromium } from "@playwright/test";

import { serve } from "./demo.mjs";

const [folder = ".", name = "toranpu"] = process.argv.slice(2);
const browser = await chromium.launch();
async function shot({ width, height = 844, colorScheme, lang, query, path, fullPage = true, which = "" }) {
  const context = await browser.newContext({ viewport: { width, height }, colorScheme, reducedMotion: "reduce", locale: "en-US", deviceScaleFactor: 2 });
  const page = await context.newPage();
  await serve(page);
  await page.addInitScript(() => {
    window.toranpuDelay = 0;
  });
  await page.goto(`http://toranpu.test/${which}?lang=${lang}&${query}`);
  if (which === "") {
    await page.waitForFunction(() => !/thinking|考えています/.test(document.querySelector('[data-testid="status"]').textContent) && document.querySelector('[data-testid="status"]').textContent !== "");
    const first = page.locator('[data-testid="hand"] .card:not(:disabled)').first();
    if ((await first.count()) > 0) await first.click();
  }
  await page.screenshot({ path, fullPage, ...(path.endsWith(".jpg") ? { type: "jpeg", quality: 82 } : {}) });
  await context.close();
}
if (name === "readme") {
  await shot({ width: 1280, height: 1080, colorScheme: "light", lang: "en", query: "game=hearts&players=4&seed=2026", path: join(folder, "desktop.jpg"), fullPage: false });
  await shot({ width: 390, height: 844, colorScheme: "dark", lang: "ja", query: "game=goFish&players=3&seed=2026", path: join(folder, "phone.jpg"), fullPage: false });
} else {
  for (const width of [390, 1280]) for (const colorScheme of ["light", "dark"]) for (const lang of ["en", "ja"]) await shot({ width, colorScheme, lang, query: "game=hearts&players=4&seed=2026", path: join(folder, `${name}-${width}-${colorScheme}-${lang}.png`) });
  await shot({ width: 390, colorScheme: "light", lang: "en", query: "", which: "api.html", path: join(folder, `${name}-api-390.png`), fullPage: false });
  await shot({ width: 1280, colorScheme: "dark", lang: "ja", query: "", which: "api.html", path: join(folder, `${name}-api-1280.png`), fullPage: false });
}
await browser.close();
