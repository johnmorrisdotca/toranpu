// The card table, played as a person plays it: choose a game, pick cards, press what to do,
// and watch the computers answer. What the page reaches is held to what the rules say the
// same seed and the same moves must give.
import { expect, test } from "@playwright/test";

import { CARD_GAME_LIST, CARD_GAME_TABLES, fromJSON, gameSays, moveText, newGame, playComputers, rulesFor, toCode } from "../dist/index.js";
import { at, make, open, settled, sound, state, tap } from "./demo.mjs";

const NAMES = ["You", "Aiko", "Ben", "Chloé", "Dev", "Emi", "Finn", "Grace"];
/** The game the page should hold: the same table and seed, the computers moved until it is the person's turn. */
function start(kind, seed, count = CARD_GAME_TABLES[kind].defaultPlayers) {
  const players = NAMES.slice(0, count);
  return playComputers(kind, newGame(kind, { players, seed, computers: players.map((_, seat) => seat > 0) })).game;
}
/** Play a game on the page and beside it: the person always makes the first move offered. `most` stops early. */
async function playThrough(page, kind, seed, most = Infinity) {
  const rules = rulesFor(kind);
  let game = start(kind, seed);
  await settled(page);
  let taps = 0;
  while (!rules.over(game) && taps < most) {
    const move = rules.moves(game)[0];
    await make(page, move);
    game = playComputers(kind, rules.play(game, move)).game;
    taps += 1;
  }
  return game;
}

test("a first visit deals Hearts for four, and says whose turn it is", async ({ page }) => {
  const errors = await open(page, "?seed=2026");
  await settled(page);
  const s = await state(page);
  const game = start("hearts", 2026);
  expect(s).toMatchObject({ game: "hearts", players: 4, seed: 2026, status: "Your turn: pick 3 cards to pass.", hand: game.hands[0], blurb: gameSays("hearts"), address: "?game=hearts&players=4&seed=2026" });
  expect(s.seats.map((seat) => seat.who)).toEqual(["You", "Aiko", "Ben", "Chloé"]);
  expect(s.seats[0]).toMatchObject({ turn: true, meta: "cards: 13 · score 0" });
  expect(s.seats[1].meta).toBe("computer · cards: 13 · score 0");
  expect(s.log).toEqual(["Hearts for 4, seed 2026."]);
  expect(s.kept).toBe(toCode("hearts", game));
  await sound(page, errors);
});

test("Hearts: pass three cards, then follow the two of clubs, and the page holds the game the rules make", async ({ page }) => {
  const errors = await open(page, "?game=hearts&seed=2026");
  await settled(page);
  // Nothing to press until three cards are picked.
  expect((await state(page)).moves).toEqual([]);
  const game = await playThrough(page, "hearts", 2026, 14);
  const s = await state(page);
  expect(s.kept).toBe(toCode("hearts", game));
  expect(s.hand).toEqual(game.hands[0]);
  expect(s.log[1]).toBe(`You: ${moveText("hearts", game.moves[0], { form: "did" })}`);
  expect(s.log.filter((line) => line.endsWith("passes cards: 3"))).toHaveLength(3);
  expect(s.log).toHaveLength(game.moves.length + 1);
  await sound(page, errors);
});

test("Go Fish, played to the end by pressing buttons: the winner is the one the rules name", async ({ page }) => {
  const errors = await open(page, "?game=go-fish&seed=2026");
  const game = await playThrough(page, "goFish", 2026);
  const rules = rulesFor("goFish");
  expect(rules.over(game)).toBe(true);
  const s = await state(page);
  expect(s.status).toBe(`Game over. Won by ${rules.winners(game).map((seat) => NAMES[seat]).join(", ")}.`);
  expect(s.kept).toBe(toCode("goFish", game));
  expect(s.moves).toEqual([]);
  expect(s.seats.map((seat) => seat.meta.match(/books: (\d+)/)[1]).map(Number)).toEqual(game.books.map((books) => books.length));
  await sound(page, errors);
});

test("War: nobody chooses a card, the one button turns the cards over, and the game is played to its end", async ({ page }) => {
  // A whole game of War is played move by move on the screen: WebKit on a CI runner takes about half a minute of it.
  test.setTimeout(120_000);
  const errors = await open(page, "?game=war&seed=2026");
  await settled(page);
  let s = await state(page);
  expect(s).toMatchObject({ game: "war", players: 2, status: "Your turn.", hand: [], moves: ["Turn the cards over"], address: "?game=war&players=2&seed=2026" });
  expect(s.seats.map((seat) => seat.meta)).toEqual(["cards: 26", "computer · cards: 26"]);
  // Before the first turn there is nothing turned up; after it, the cards laid are, and who took them.
  await expect(page.locator(at("piles"))).not.toContainText("takes");
  const game = await playThrough(page, "war", 2026, 1);
  s = await state(page);
  expect(s.kept).toBe(toCode("war", game));
  await expect(page.locator(at("piles"))).toContainText(/takes \d+ cards/);
  expect(s.seats.map((seat) => Number(seat.meta.match(/cards: (\d+)/)[1]))).toEqual(game.hands.map((hand) => hand.length));
  const rules = rulesFor("war");
  let end = game;
  while (!rules.over(end)) {
    const move = rules.moves(end)[0];
    await make(page, move);
    end = rules.play(end, move);
  }
  expect(rules.over(end)).toBe(true);
  s = await state(page);
  expect(s.status).toBe(`Game over. Won by ${rules.winners(end).map((seat) => NAMES[seat]).join(", ")}.`);
  expect(s.kept).toBe(toCode("war", end));
  expect(s.moves).toEqual([]);
  expect(s.hand).toEqual([]);
  await sound(page, errors);
});

for (const kind of CARD_GAME_LIST) {
  test(`${kind}: choose it, and twelve moves in the page holds the game the rules make`, async ({ page }) => {
    const errors = await open(page, "?seed=77");
    await tap(page, at(`game-${kind}`));
    await settled(page);
    const dealt = await state(page);
    expect(dealt.game).toBe(kind);
    expect(dealt.players).toBe(CARD_GAME_TABLES[kind].defaultPlayers);
    expect(dealt.blurb).toBe(gameSays(kind));
    // Choosing a game deals a new seed: play the game the page dealt.
    const game = await playThrough(page, kind, dealt.seed, 12);
    const s = await state(page);
    expect(s.kept).toBe(toCode(kind, game));
    expect(fromJSON(s.kept)?.kind).toBe(kind);
    await sound(page, errors);
  });
}

test("Crazy Eights: an eight offers a button for each suit it may call", async ({ page }) => {
  // Find a seed whose first hand holds an eight that may be played at once.
  const rules = rulesFor("crazyEights");
  let seed = 1;
  for (; seed < 500; seed += 1) if (rules.moves(start("crazyEights", seed)).some((move) => "suit" in move)) break;
  const errors = await open(page, `?game=crazy-eights&seed=${seed}`);
  await settled(page);
  const game = start("crazyEights", seed);
  const eight = rules.moves(game).find((move) => "suit" in move).play;
  await tap(page, `${at("hand")} [data-card="${eight}"]`);
  const s = await state(page);
  expect(s.moves.filter((text) => text.includes("calling"))).toHaveLength(4);
  await tap(page, `${at("move")}[data-move='${JSON.stringify({ play: eight, suit: "D" })}']`);
  await settled(page);
  expect((await state(page)).log[1]).toMatch(/^You: plays 8. calling diamonds$|^You: plays 8., calling diamonds$/);
  await sound(page, errors);
});

test("the players, the seed and Deal each make a new table, and the address carries it", async ({ page }) => {
  const errors = await open(page, "?game=president&seed=5");
  await page.locator(at("players")).selectOption("6");
  await settled(page);
  let s = await state(page);
  expect(s).toMatchObject({ game: "president", players: 6, seed: 5, address: "?game=president&players=6&seed=5" });
  expect(s.seats).toHaveLength(6);

  await page.locator(at("seed")).fill("31");
  await page.locator(at("seed")).press("Enter");
  await settled(page);
  s = await state(page);
  expect(s).toMatchObject({ players: 6, seed: 31 });
  expect(s.hand).toEqual(start("president", 31, 6).hands[0]);

  await page.locator(at("seed")).fill("nonsense");
  await page.locator(at("seed")).press("Enter");
  expect((await state(page)).seed).toBe(31);

  await tap(page, at("deal"));
  await settled(page);
  s = await state(page);
  expect(s.seed).not.toBe(31);
  expect(s.players).toBe(6);
  expect(s.address).toBe(`?game=president&players=6&seed=${s.seed}`);
  await sound(page, errors);
});

test("a link replays the deal, and an old link with a hash still opens", async ({ page, context }) => {
  const errors = await open(page, "?game=spades&players=4&seed=7");
  await settled(page);
  const s = await state(page);
  expect(s.hand).toEqual(start("spades", 7).hands[0]);
  const other = await context.newPage();
  const otherErrors = await open(other, "#euchre/4/9");
  await settled(other);
  expect(await state(other)).toMatchObject({ game: "euchre", players: 4, seed: 9 });
  await sound(page, errors);
  await sound(other, otherErrors);
});
