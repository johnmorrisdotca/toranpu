import { describe, expect, it } from "vitest";

import { CARD_GAME_RULES } from "../card-game-rules.ts";

import {
  isStackUpMove,
  playStackUp,
  STACK_UP_DECK,
  STACK_UP_WILD,
  stackUpFits,
  stackUpMoves,
  stackUpValue,
  stackUpWinners,
  startStackUp,
} from "./stack-up.ts";
import type { StackUpGame } from "./stack-up.types.ts";
import { stackUpComputer } from "./stack-up-computer.ts";
import { decodeStackUp, encodeStackUp } from "./stack-up-rules.ts";

const NAMES = ["Aki", "Ben", "Cy", "Dev", "Eli", "Fay"];
const start = (size = 15, count = 2, seed = 7): StackUpGame =>
  startStackUp(size, NAMES.slice(0, count), undefined, seed)!;

/** A game with the cards set by hand, for a rule to be asked of exactly. */
function set(game: StackUpGame, parts: Partial<StackUpGame>): StackUpGame {
  return { ...game, ...parts };
}

describe("the deck and the deal", () => {
  it("is 162 cards: twelve of each number from 1 to 12 and eighteen wilds", () => {
    expect(STACK_UP_DECK).toHaveLength(162);
    for (let n = 1; n <= 12; n += 1) expect(STACK_UP_DECK.filter((card) => stackUpValue(card) === n)).toHaveLength(12);
    expect(STACK_UP_DECK.filter((card) => card === STACK_UP_WILD)).toHaveLength(18);
  });

  it("deals each seat a stock, draws the first hand, and keeps every card somewhere", () => {
    for (const count of [2, 3, 6]) {
      const game = start(20, count);
      expect(game.stocks.map((stock) => stock.length)).toEqual(new Array(count).fill(20));
      expect(game.hands[0]).toHaveLength(5);
      const all = [...game.stocks.flat(), ...game.hands.flat(), ...game.draw];
      expect([...all].sort()).toEqual([...STACK_UP_DECK].sort());
    }
  });

  it("is not offered for a table or a size it does not have", () => {
    expect(startStackUp(15, ["Aki"], undefined, 1)).toBeNull();
    expect(startStackUp(15, NAMES.concat("Gus"), undefined, 1)).toBeNull();
    expect(startStackUp(12, ["Aki", "Ben"], undefined, 1)).toBeNull();
  });

  it("deals the same cards from the same seed and others from another", () => {
    expect(start(15, 3, 5).stocks).toEqual(start(15, 3, 5).stocks);
    expect(start(15, 3, 5).stocks).not.toEqual(start(15, 3, 6).stocks);
  });
});

describe("laying cards on the building piles", () => {
  it("wants a 1 on an empty pile, and one more each time; a wild fits any pile", () => {
    expect(stackUpFits("n01", [])).toBe(true);
    expect(stackUpFits("n02", [])).toBe(false);
    expect(stackUpFits("n02", ["n01"])).toBe(true);
    expect(stackUpFits(STACK_UP_WILD, ["n01", "n02", "n03"])).toBe(true);
  });

  it("refuses a card that does not fit, a card not in hand, and a move out of turn", () => {
    const game = set(start(), { hands: [["n05", "n01"], ["n01"]] });
    expect(playStackUp(game, { play: "n05", from: "hand", to: 0 })).toBeNull();
    expect(playStackUp(game, { play: "n09", from: "hand", to: 0 })).toBeNull();
    expect(playStackUp(game, { play: "n01", from: "hand", to: 0 })).not.toBeNull();
  });

  it("plays from the stock and from a discard pile as well as the hand", () => {
    const game = set(start(), {
      hands: [["n05"], []],
      stocks: [["n09", "n01"], ["n03"]],
      discards: [
        [["n04"], [], [], []],
        [[], [], [], []],
      ],
    });
    const next = playStackUp(game, { play: "n01", from: "stock", to: 0 })!;
    expect(next.stocks[0]).toEqual(["n09"]);
    expect(next.building[0]).toEqual(["n01"]);
    const again = playStackUp(next, { play: STACK_UP_WILD, from: "hand", to: 0 });
    expect(again).toBeNull();
    const fromDiscard = set(next, { building: [["n01", "n02", "n03"], [], [], []] });
    expect(playStackUp(fromDiscard, { play: "n04", from: "discard", pile: 0, to: 0 })!.discards[0]![0]).toEqual([]);
  });

  it("sets a finished pile of twelve aside, to come back into the draw pile later", () => {
    const eleven = Array.from({ length: 11 }, (_, at) => `n${String(at + 1).padStart(2, "0")}`);
    const game = set(start(), { hands: [["n12", "n01"], ["n01"]], building: [eleven, [], [], []] });
    const next = playStackUp(game, { play: "n12", from: "hand", to: 0 })!;
    expect(next.building[0]).toEqual([]);
    expect(next.done).toHaveLength(12);
  });

  it("draws five more the moment the last card of the hand is played, and the turn goes on", () => {
    const game = set(start(), { hands: [["n01"], []] });
    const next = playStackUp(game, { play: "n01", from: "hand", to: 0 })!;
    expect(next.hands[0]).toHaveLength(5);
    expect(next.toPlay).toBe(0);
  });

  it("ends the game when the last card of a stock is played, and that seat wins", () => {
    const game = set(start(), { stocks: [["n01"], ["n03", "n04"]] });
    const next = playStackUp(game, { play: "n01", from: "stock", to: 0 })!;
    expect(next.phase).toBe("over");
    expect(next.ended).toBe("emptied");
    expect(stackUpWinners(next)).toEqual([0]);
    expect(stackUpMoves(next)).toEqual([]);
  });
});

describe("ending a turn", () => {
  it("is by putting a card from the hand on one of your own discard piles, and the next seat draws up", () => {
    const game = start(15, 3);
    const card = game.hands[0]![0]!;
    const next = playStackUp(game, { discard: card, to: 2 })!;
    expect(next.discards[0]![2]).toEqual([card]);
    expect(next.hands[0]).toHaveLength(4);
    expect(next.toPlay).toBe(1);
    expect(next.hands[1]).toHaveLength(5);
  });

  it("offers a pass only when the hand is empty", () => {
    expect(stackUpMoves(start()).some((move) => "pass" in move)).toBe(false);
    const empty = set(start(), { hands: [[], []], draw: [], done: [] });
    expect(stackUpMoves(empty).some((move) => "pass" in move)).toBe(true);
  });

  it("shuffles the finished piles back in when the draw pile runs out, the same way every time", () => {
    const game = set(start(), { hands: [["n05"], []], draw: [], done: ["n01", "n02", "n03", "n04", "n05", "n06"] });
    const next = playStackUp(game, { discard: "n05", to: 0 })!;
    expect(next.hands[1]).toHaveLength(5);
    expect(next.done).toEqual([]);
    expect(next.reshuffles).toBe(1);
    expect(playStackUp(game, { discard: "n05", to: 0 })).toEqual(next);
  });

  it("ends a game nobody can move on: a whole round with nothing played and nothing to draw, fewest stock cards wins", () => {
    let game = set(start(15, 2), { hands: [[], []], draw: [], done: [], stocks: [["n12", "n12"], ["n12"]] });
    game = playStackUp(game, { pass: true })!;
    game = playStackUp(game, { pass: true })!;
    expect(game.phase).toBe("over");
    expect(game.ended).toBe("stuck");
    expect(stackUpWinners(game)).toEqual([1]);
  });
});

describe("keeping a game", () => {
  it("reads back as the game it records, from its seed and moves alone", () => {
    let game = start(10, 3, 11);
    for (let step = 0; step < 60 && game.phase === "playing"; step += 1)
      game = playStackUp(game, stackUpComputer(game))!;
    const read = decodeStackUp(encodeStackUp(game))!;
    expect(read).toEqual(game);
    expect(encodeStackUp(game)).not.toContain('n01"],"hands');
    expect(decodeStackUp("nonsense")).toBeNull();
    expect(decodeStackUp(null)).toBeNull();
  });

  it("knows its own moves by their shape", () => {
    expect(isStackUpMove({ play: "n01", from: "discard", pile: 1, to: 0 })).toBe(true);
    expect(isStackUpMove({ play: "n01", from: "discard", to: 0 })).toBe(false);
    expect(isStackUpMove({ discard: "n01", to: 3 })).toBe(true);
    expect(isStackUpMove({ turn: true })).toBe(false);
  });
});

describe("the computer", () => {
  it("plays the stock card when it can, and only ever a move the rules offer", () => {
    const game = set(start(), { stocks: [["n09", "n01"], ["n05"]], hands: [["n01", "n02"], []] });
    expect(stackUpComputer(game)).toMatchObject({ play: "n01", from: "stock" });
    let g = start(15, 4, 3);
    for (let step = 0; step < 300 && g.phase === "playing"; step += 1) {
      const move = stackUpComputer(g);
      expect(stackUpMoves(g).some((allowed) => JSON.stringify(allowed) === JSON.stringify(move))).toBe(true);
      g = playStackUp(g, move)!;
    }
  });

  it("finishes every game computers play, at every size and number of players", () => {
    for (const size of [10, 15, 20] as const) {
      for (let count = 2; count <= 6; count += 1) {
        let game = start(size, count, 100 * size + count);
        for (let step = 0; step < 20_000 && game.phase === "playing"; step += 1)
          game = playStackUp(game, stackUpComputer(game))!;
        expect(game.phase, `${count} players at ${size}`).toBe("over");
        expect(stackUpWinners(game).length).toBeGreaterThan(0);
      }
    }
  });

  it("is what the table asks of the rules", () => {
    const rules = CARD_GAME_RULES.stackUp;
    const game = rules.start(15, ["Aki", "Ben"], undefined, 3, [true, true])!;
    expect(rules.toPlay(game)).toBe(0);
    expect(rules.seats(game).computers).toEqual([true, true]);
  });
});
