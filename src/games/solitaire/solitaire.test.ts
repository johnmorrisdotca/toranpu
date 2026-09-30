import { describe, expect, it } from "vitest";

import { dealOfSeed, deckOf, encodeMoves as klondikeCode, replay } from "../klondike/code.ts";
import { dealKlondike, klondikeWon } from "../klondike/klondike.ts";
import { solveKlondike } from "../klondike/solve.ts";
import { encodeMoves as freeCellCode, replayFreeCell } from "../freecell/code.ts";
import { dealFreeCell, freeCellWon } from "../freecell/rules.ts";
import { solveFreeCell } from "../freecell/solve.ts";
import { encodeMoves as spiderCode, replaySpider, spiderDealOfSeed, spiderDeckOf } from "../spider/code.ts";
import { dealSpider, spiderWon } from "../spider/rules.ts";
import { solveSpider } from "../spider/solve.ts";
import fixture from "./solitaire.fixture.json" with { type: "json" };

/**
 * The three solitaires came here from itsutsu.com, where people had already
 * played their deals, kept their games and set fastest times on them. So a
 * seed must deal exactly the cards it dealt there, and a solver must find
 * exactly the line it found there: this file is those deals and lines,
 * written down on the site before the move, for sixty seeds and every size.
 */
const seeds = Object.keys(fixture.klondike).map(Number);

describe("a seed deals what it dealt on itsutsu.com", () => {
  it("Klondike and FreeCell, one deck", () => {
    for (const seed of seeds) expect(dealOfSeed(seed), String(seed)).toBe(fixture.klondike[String(seed) as keyof typeof fixture.klondike]);
  });
  it("Spider, at one, two and four suits", () => {
    for (const suits of [1, 2, 4] as const) {
      const table = fixture.spider[String(suits) as keyof typeof fixture.spider] as Record<string, string>;
      for (const seed of seeds) expect(spiderDealOfSeed(seed, suits), `${seed}/${suits}`).toBe(table[String(seed)]);
    }
  });
});

describe("a solver finds the line it found on itsutsu.com, and the line wins", () => {
  const cases = (game: keyof typeof fixture.solve) => Object.entries(fixture.solve[game]) as [string, { moves: string | null; tables: number }][];

  it("Klondike, drawing one and three", () => {
    for (const [key, want] of cases("klondike")) {
      const [seed, draw] = key.split("/").map(Number);
      const rules = { draw: draw as 1 | 3, passes: Infinity };
      const found = solveKlondike(dealKlondike(deckOf(dealOfSeed(seed))!, rules), 20_000);
      expect({ moves: found.moves === null ? null : klondikeCode(found.moves), tables: found.tables }, key).toEqual(want);
      if (want.moves !== null) expect(klondikeWon(replay(dealOfSeed(seed), rules, want.moves)!.at(-1)!), key).toBe(true);
    }
  });

  it("FreeCell, with four cells and with two", () => {
    for (const [key, want] of cases("freecell")) {
      const [seed, cells] = key.split("/").map(Number);
      const found = solveFreeCell(dealFreeCell(deckOf(dealOfSeed(seed))!, cells), 5_000);
      expect({ moves: found.moves === null ? null : freeCellCode(found.moves), tables: found.tables }, key).toEqual(want);
      if (want.moves !== null) expect(freeCellWon(replayFreeCell(dealOfSeed(seed), cells, want.moves)!.at(-1)!), key).toBe(true);
    }
  });

  it("Spider, at one suit and two", () => {
    for (const [key, want] of cases("spider")) {
      const [seed, suits] = key.split("/").map(Number);
      const found = solveSpider(dealSpider(spiderDeckOf(spiderDealOfSeed(seed, suits), suits)!), 5_000);
      expect({ moves: found.moves === null ? null : spiderCode(found.moves), tables: found.tables }, key).toEqual(want);
      if (want.moves !== null) expect(spiderWon(replaySpider(spiderDealOfSeed(seed, suits), suits, want.moves)!.at(-1)!), key).toBe(true);
    }
  });
});
