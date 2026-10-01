// Keeping a game and reading one back, the deck on its own, the two languages, and the API page.
import { expect, test } from "@playwright/test";

import { STRINGS, newGame, playComputers, rulesFor, toCSV, toCode, toJSON, toText } from "../dist/index.js";
import { cardId, shuffledDeck, writeCards } from "../dist/deck.js";
import { at, open, settled, sound, state, tap } from "./demo.mjs";

const finished = (kind, players, seed) => playComputers(kind, newGame(kind, { players, seed, computers: players.map(() => true) })).game;

test("a game is kept four ways", async ({ page }) => {
  const errors = await open(page, "?game=go-fish&seed=2026");
  await settled(page);
  const players = ["You", "Aiko", "Ben"];
  const game = playComputers("goFish", newGame("goFish", { players, seed: 2026, computers: [false, true, true] })).game;
  expect((await state(page)).kept).toBe(toCode("goFish", game));
  await tap(page, at("as-json"));
  expect((await state(page)).kept).toBe(toJSON("goFish", game));
  await tap(page, at("as-text"));
  expect((await state(page)).kept).toBe(toText("goFish", game));
  await tap(page, at("as-csv"));
  expect((await state(page)).kept).toBe(toCSV("goFish", game).replaceAll("\r\n", "\n"));
  await sound(page, errors);
  await tap(page, at("copy"));
  await expect(page.locator(at("copy"))).toHaveText(/^(Copied|Select it and copy)$/);
  await expect(page.locator(at("copy"))).toHaveText("Copy");
});

test("a game pasted in is played through the rules and put on the table", async ({ page }) => {
  const errors = await open(page, "?game=hearts&seed=1");
  await settled(page);
  const game = finished("euchre", ["North", "East", "South", "West"], 42);
  await page.locator(at("paste")).fill(toCode("euchre", game));
  await tap(page, at("read"));
  let s = await state(page);
  expect(s).toMatchObject({ game: "euchre", players: 4, seed: 42, error: "", status: "Game over. Won by North, South." });
  expect(s.seats.map((seat) => seat.who)).toEqual(["North", "East", "South", "West"]);
  expect(s.kept).toBe(toCode("euchre", game));
  expect(s.log).toHaveLength(game.moves.length + 1);

  // Its JSON reads too, and a game in the middle carries on.
  const rules = rulesFor("crazyEights");
  let going = newGame("crazyEights", { players: ["You", "Aiko"], seed: 3, computers: [false, true] });
  going = playComputers("crazyEights", rules.play(playComputers("crazyEights", going).game, rules.moves(playComputers("crazyEights", going).game)[0])).game;
  await page.locator(at("paste")).fill(toJSON("crazyEights", going).replaceAll("\n", " "));
  await page.locator(at("paste")).press("Enter");
  await settled(page);
  s = await state(page);
  expect(s).toMatchObject({ game: "crazyEights", players: 2, seed: 3, error: "" });
  expect(s.hand).toEqual(going.hands[0]);
  expect(s.kept).toBe(toCode("crazyEights", going));
  await sound(page, errors);
});

test("what is not a game is refused, in words, and the table is left alone", async ({ page }) => {
  const errors = await open(page, "?game=hearts&seed=1");
  await settled(page);
  const before = await state(page);
  const tampered = toCode("euchre", finished("euchre", ["a", "b", "c", "d"], 42)).replace('"seed":42', '"seed":43');
  for (const text of ["hello", "{}", tampered]) {
    await page.locator(at("paste")).fill(text);
    await tap(page, at("read"));
    const s = await state(page);
    expect(s.error, text.slice(0, 20)).toBe("That is not a saved game: the rules cannot play it out.");
    expect(s.kept).toBe(before.kept);
  }
  await sound(page, errors);
});

test("the deck on its own: a seeded shuffle, dealt into fans", async ({ page }) => {
  const errors = await open(page, "?seed=1");
  const deck = shuffledDeck(42).map(cardId);
  let s = await state(page);
  expect(s.fans).toEqual([0, 1, 2, 3].map((seat) => deck.slice(0, 20).filter((_, i) => i % 4 === seat)));
  expect(s.deckCode).toBe(writeCards(shuffledDeck(42)));
  expect(s.deckLeft).toBe("Left over: 32");

  await page.locator(at("deck-hands")).selectOption("2");
  await page.locator(at("deck-each")).selectOption("13");
  s = await state(page);
  expect(s.fans).toEqual([0, 1].map((seat) => deck.slice(0, 26).filter((_, i) => i % 2 === seat)));
  expect(s.deckLeft).toBe("Left over: 26");
  await sound(page, errors);

  await page.locator(at("deck-hands")).selectOption("8");
  s = await state(page);
  expect(s.fans).toHaveLength(8);
  expect(s.fans[0]).toHaveLength(6);
  await sound(page, errors);

  await tap(page, at("shuffle"));
  s = await state(page);
  expect(s.deckCode).not.toBe(writeCards(shuffledDeck(42)));
  const seed = Number(await page.locator(at("deck-seed")).inputValue());
  expect(s.deckCode).toBe(writeCards(shuffledDeck(seed)));
  expect(s.address).toContain(`deck=${seed}`);

  await page.locator(at("deck-seed")).fill("7");
  await page.locator(at("deck-seed")).press("Enter");
  expect((await state(page)).deckCode).toBe(writeCards(shuffledDeck(7)));
  await sound(page, errors);
});

test("the chooser switches every word, the device remembers, and the address wins", async ({ page }) => {
  const errors = await open(page, "?game=go-fish&seed=2026");
  await settled(page);
  let s = await state(page);
  expect(s).toMatchObject({ lang: "en", pitch: STRINGS.en.pagePitch, unreviewed: false });
  const english = s.moves;

  await tap(page, '[data-lang="ja"]');
  s = await state(page);
  expect(s).toMatchObject({ lang: "ja", pitch: STRINGS.ja.pagePitch, unreviewed: true, status: "あなたの番です。", blurb: STRINGS.ja.saysGoFish });
  expect(s.seats[0].who).toBe("あなた");
  expect(s.moves[0]).toBe("Aikoに4を聞く");
  expect(s.moves).toHaveLength(english.length);
  expect(s.log[0]).toBe("ゴーフィッシュ（3人）、シード 2026。");
  await expect(page.locator(`${at("game-president")} > span:not(.ghost)`)).toHaveText("大富豪");
  await expect(page.locator(at("deal"))).toHaveText("配る");
  await sound(page, errors);

  await page.reload();
  await settled(page);
  expect((await state(page)).lang).toBe("ja");
  await page.goto("http://toranpu.test/?lang=en&game=go-fish&seed=2026");
  await settled(page);
  s = await state(page);
  expect(s.lang).toBe("en");
  expect(s.address).toBe("?lang=en&game=go-fish&players=3&seed=2026");
  const empty = await page.evaluate(() => [...document.querySelectorAll("[data-say]")].filter((el) => el.textContent.trim() === "").map((el) => el.dataset.say));
  expect(empty).toEqual([]);
});

test.describe("in a browser set to Japanese", () => {
  test.use({ locale: "ja-JP" });

  test("a first visit is in Japanese, cards and all", async ({ page }) => {
    const errors = await open(page, "?game=hearts&seed=2026");
    await settled(page);
    const s = await state(page);
    expect(s).toMatchObject({ lang: "ja", status: "あなたの番です。渡す札を3枚選んでください。" });
    await expect(page.locator(`${at("hand")} [data-card="2C"]`)).toHaveAttribute("aria-label", "クラブの2");
    await sound(page, errors);
  });
});

test("changing language moves nothing below the header", async ({ page }) => {
  const errors = await open(page, "?game=hearts&seed=2026");
  await settled(page);
  // Where the game picker starts, and how tall the seats over the table are: neither may move with the language.
  const top = () => page.evaluate(() => [".choose", ".seats"].map((at) => { const box = document.querySelector(at).getBoundingClientRect(); return [Math.round(box.top + window.scrollY), Math.round(box.height)]; }));
  // What each language lays out, for the message when they differ: each game button's width, and the line's height.
  const parts = () => page.evaluate(() => ({ buttons: [...document.querySelectorAll(".games > button")].map((b) => Math.round(b.getBoundingClientRect().width)), line: Math.round(document.querySelector(".blurb").getBoundingClientRect().height), fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family) }));
  const english = await top();
  const englishParts = await parts();
  await tap(page, '[data-lang="ja"]');
  expect(await top(), JSON.stringify({ english: englishParts, japanese: await parts() })).toEqual(english);
  await sound(page, errors);
});

test("the API reference lists every entry point and every export, in the family's look", async ({ page }) => {
  const errors = await open(page, "", "api.html");
  const pkg = JSON.parse((await import("node:fs")).readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  await expect(page.locator(".api-entry")).toHaveCount(Object.keys(pkg.exports).length);
  await expect(page.locator("#main-newGame pre").first()).toHaveText("newGame<K extends CardGameKind>(kind: K, options: NewGameOptions): GameOf<K> | null");
  await expect(page.locator("#main-newGame p").first()).toContainText("A new game of that kind");
  await expect(page.locator("#hearts-heartsPoints")).toContainText("a heart one, the queen of spades thirteen");
  await expect(page.locator("#deck-shuffledDeck")).toBeVisible();
  const undocumented = await page.evaluate(() => [...document.querySelectorAll(".api-entry article")].filter((one) => one.querySelector("p") === null).map((one) => one.id));
  expect(undocumented).toEqual([]);
  await sound(page, errors);
  await tap(page, '[data-lang="ja"]');
  await expect(page.locator('[data-say="pitch"]')).toHaveText(STRINGS.ja.pageApiIntro);
  await tap(page, 'nav a[data-say="pageBack"]');
  await expect(page.locator(at("status"))).not.toBeEmpty();
  await sound(page, errors);
});
