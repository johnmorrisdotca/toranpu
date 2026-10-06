// Takes the pictures the README shows, from the built demo in `site/`: `pnpm screenshots:readme` (builds the demo, then runs this).
// The family's standard is in johnmorrisdotca/.github (README-STANDARD.md); the shared part is readme-pictures-lib.mjs.
// The page is served to a browser without a port, never fetched from the live site, and is the same each run: the deal is a seed
// (`?seed=`), the computers answer at once (`window.toranpuDelay = 0`) and motion is reduced. Output: docs/images/<subject>-<desk|phone>-<light|dark>.webp.
import { takePictures } from "./readme-pictures-lib.mjs";

const STATUS = '[data-testid="status"]';
const init = () => { window.toranpuDelay = 0; };
const settled = (page) => page.waitForFunction(() => !/thinking|考えています/.test(document.querySelector('[data-testid="status"]').textContent) && document.querySelector('[data-testid="status"]').textContent !== "");

/** Play `moves` of the game as a person would: tap the cards a move names, then its button, and let the computers answer. */
async function advance(page, moves) {
    for (let n = 0; n < moves; n += 1) {
    await settled(page);
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
  await settled(page);
}


const url = (game, players, lang = "en") => `/?lang=${lang}&game=${game}&players=${players}&seed=2026`;
/** A game of `game` a few moves in. */
const played = (moves) => async (page) => { await settled(page); await advance(page, moves); };
/** One section of the page, cropped. */
const section = (subject, target, prepare) => ({ subject, views: ["desk"], scale: 1, url: url("hearts", 4), init, ready: STATUS, target, prepare });

await takePictures({
  shots: [
    // The page from its top, so the header, the language chooser and the cloth patches show, with a hand of Hearts a few tricks in; on a
    // phone, in Japanese, scrolled to the table: a game of Go Fish a few asks in.
    {
      subject: "hero",
      views: ["desk", "phone"],
      height: 840,
      url: url("hearts", 4),
      init,
      ready: STATUS,
      async prepare(page, { view }) {
        if (view === "phone") {
          await page.goto(`http://toranpu.test${url("go-fish", 3, "ja")}`);
          await page.waitForSelector(STATUS);
          await played(4)(page);
          await page.locator('[data-testid="seats"]').evaluate((element) => window.scrollTo(0, element.getBoundingClientRect().top + window.scrollY - 16));
        } else {
          await played(8)(page);
          await page.evaluate(() => window.scrollTo(0, 0));
        }
      },
    },
    section("hearts", ".fam-felt.table", played(8)),
    { ...section("go-fish", ".fam-felt.table", played(4)), url: url("go-fish", 3) },
    { ...section("crazy-eights", ".fam-felt.table", played(6)), url: url("crazy-eights", 3) },
    section("designs", "#designs"),
    section("backs", "#backs"),
    section("branding", "#brand-panel"),
    section("one-card", "#one-card-panel"),
    section("hand-controls", "#hide-panel"),
    section("messy-piles", "#piles-panel"),
    section("whole-table", "#table-panel"),
    section("card-sounds", "#sounds"),
  ],
});
