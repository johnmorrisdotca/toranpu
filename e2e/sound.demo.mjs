// The card sounds on the demo, by real taps: the panel plays each kind, and the table's switch is
// off until pressed, remembered, and heard as the game goes. What the page asks of the Web Audio
// API is counted, since a test cannot listen.
import { expect, test } from "@playwright/test";

import { CARD_SOUND_KINDS } from "../dist/card-sounds.js";
import { STRINGS } from "../dist/index.js";
import { at, make, open, settled, sound, tap } from "./demo.mjs";
import { newGame, playComputers, rulesFor } from "../dist/index.js";

/** Count every audio context made, every sound started and every recording decoded. */
async function listen(page) {
  await page.addInitScript(() => {
    const heard = { contexts: 0, started: 0, decoded: 0, refused: 0 };
    window.heard = heard;
    const Real = window.AudioContext;
    window.AudioContext = class extends Real {
      constructor(...args) {
        super(...args);
        heard.contexts += 1;
      }
      decodeAudioData(data, ...rest) {
        const made = super.decodeAudioData(data, ...rest);
        made.then(() => (heard.decoded += 1), () => (heard.refused += 1));
        return made;
      }
    };
    const start = AudioBufferSourceNode.prototype.start;
    AudioBufferSourceNode.prototype.start = function (...args) {
      heard.started += 1;
      return start.apply(this, args);
    };
  });
}
const heard = (page) => page.evaluate(() => ({ ...window.heard }));

test("the panel plays each kind of sound on a tap, and fetches nothing before", async ({ page }) => {
  await listen(page);
  const errors = await open(page, "?game=hearts&seed=2026");
  await settled(page);
  expect(await heard(page), "a silent page makes no audio context").toMatchObject({ contexts: 0, started: 0 });
  await expect(page.locator(`${at("sound-kinds")} button`)).toHaveText(CARD_SOUND_KINDS.map((kind) => STRINGS.en[`pageSound${kind[0].toUpperCase()}${kind.slice(1)}`]));
  let before = 0;
  for (const kind of CARD_SOUND_KINDS) {
    await tap(page, at(`sound-${kind}`));
    await page.waitForFunction((n) => window.heard.started > n, before);
    before = (await heard(page)).started;
  }
  const after = await heard(page);
  expect(after.contexts).toBe(1);
  // The thirteen recordings are decoded where the browser can read AAC; where it cannot, a sound made in the page stands in, and still sounds.
  expect(after.decoded + after.refused).toBe(13);
  await sound(page, errors);
});

test("the table's Sound is off until pressed, then heard as the game goes, and remembered", async ({ page }) => {
  await listen(page);
  const errors = await open(page, "?game=crazy-eights&players=2&seed=3");
  await settled(page);
  await expect(page.locator(at("sound"))).toHaveAttribute("aria-pressed", "false");
  const rules = rulesFor("crazyEights");
  let game = playComputers("crazyEights", newGame("crazyEights", { players: ["You", "Aiko"], seed: 3, computers: [false, true] })).game;
  let move = rules.moves(game)[0];
  await make(page, move);
  game = playComputers("crazyEights", rules.play(game, move)).game;
  expect((await heard(page)).contexts, "no sound while it is off").toBe(0);

  await tap(page, at("sound"));
  await expect(page.locator(at("sound"))).toHaveAttribute("aria-pressed", "true");
  await page.waitForFunction(() => window.heard.started > 0);
  const before = (await heard(page)).started;
  move = rules.moves(game)[0];
  await make(page, move);
  await page.waitForFunction((n) => window.heard.started > n, before);

  await page.reload();
  await settled(page);
  await expect(page.locator(at("sound"))).toHaveAttribute("aria-pressed", "true");
  await tap(page, at("sound"));
  await expect(page.locator(at("sound"))).toHaveAttribute("aria-pressed", "false");
  await sound(page, errors);
});

test("the sounds speak Japanese, and the switch keeps its size in either language", async ({ page }) => {
  const errors = await open(page, "?game=hearts&seed=2026");
  await settled(page);
  const width = () => page.locator(at("sound")).evaluate((button) => Math.round(button.getBoundingClientRect().width));
  const english = await width();
  await tap(page, '[data-lang="ja"]');
  await expect(page.locator(`${at("sound")} [data-say]`)).toHaveText("音");
  await expect(page.locator(at("sound-flip"))).toHaveText("めくる");
  expect(await width()).toBe(english);
  await sound(page, errors);
});
