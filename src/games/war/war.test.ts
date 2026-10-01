import { describe, expect, it } from "vitest";

import { FULL_DECK } from "../cards.ts";

import { isWarMove, playWar, startWar, warMoves, warRank, warWinners, WAR_FACE_DOWN } from "./war.ts";
import { warComputer } from "./warComputer.ts";
import { decodeWar, encodeWar, WAR_RULES } from "./warRules.ts";
import type { WarGame } from "./war.types.ts";

const started = (size = 100, seed = 7, computers: boolean[] = [false, true]) => startWar(size, ["Ann", "Ben"], undefined, seed, computers) as WarGame;

/** A game with these piles, top card first, as though dealt so. */
function at(first: string[], second: string[], extra: Partial<WarGame> = {}): WarGame {
  return { ...started(), hands: [first, second], ...extra };
}

const sorted = (cards: readonly string[]) => [...cards].sort();
const held = (game: WarGame) => game.hands.reduce((sum, hand) => sum + hand.length, 0);

describe("war", () => {
  it("splits a shuffled deck, twenty-six cards each, from the seed alone", () => {
    const game = started();
    expect(game.hands.map((hand) => hand.length)).toEqual([26, 26]);
    expect(sorted(game.hands.flat())).toEqual(sorted(FULL_DECK));
    expect(started(100, 7).hands).toEqual(game.hands);
    expect(started(100, 8).hands).not.toEqual(game.hands);
    expect(game.last).toBeNull();
    expect(game.ended).toBeNull();
  });

  it("is offered for two players and the turn limits it names, and no other table", () => {
    for (const size of [25, 50, 100, 200, 1000]) expect(startWar(size, ["a", "b"]), String(size)).not.toBeNull();
    for (const size of [0, 10, 99, 52]) expect(startWar(size, ["a", "b"]), String(size)).toBeNull();
    for (const count of [0, 1, 3, 4]) expect(startWar(100, new Array<string>(count).fill("x")), String(count)).toBeNull();
  });

  it("counts the ace high and the two low", () => {
    expect(warRank("AS")).toBe(14);
    expect(warRank("KD")).toBe(13);
    expect(warRank("TC")).toBe(10);
    expect(warRank("2H")).toBe(2);
  });

  it("has one move, turning the cards over, which a computer makes as a person does, and none once over", () => {
    const game = started();
    expect(warMoves(game)).toEqual([{ turn: true }]);
    expect(warComputer(game)).toEqual({ turn: true });
    expect(isWarMove({ turn: true })).toBe(true);
    for (const bad of [{ turn: false }, {}, null, "turn", { turn: true, extra: 1 }.extra]) expect(isWarMove(bad), String(bad)).toBe(false);
    expect(playWar(game, { turn: false } as never)).toBeNull();
    expect(warMoves({ ...game, phase: "over" })).toEqual([]);
    expect(playWar({ ...game, phase: "over" }, { turn: true })).toBeNull();
  });

  it("waits on the first person's seat, or on the first seat when computers hold both", () => {
    expect(started(100, 7, [false, true]).toPlay).toBe(0);
    expect(started(100, 7, [true, false]).toPlay).toBe(1);
    expect(started(100, 7, [true, true]).toPlay).toBe(0);
    expect(startWar(100, ["a", "b"])?.toPlay).toBe(0);
  });

  it("gives both cards to the higher, who puts them under their pile", () => {
    const game = at(["KS", "2C", "3C"], ["9H", "4C", "5C"]);
    const after = playWar(game, { turn: true })!;
    expect(after.hands[1]).toEqual(["4C", "5C"]);
    expect(after.hands[0].slice(0, 2)).toEqual(["2C", "3C"]);
    expect(sorted(after.hands[0].slice(2))).toEqual(["9H", "KS"]);
    expect(after.last).toEqual({ laid: [{ seat: 0, card: "KS", down: false }, { seat: 1, card: "9H", down: false }], wars: 0, winner: 0 });
    expect(after.moves).toEqual([{ turn: true }]);
    // The game it was given is left alone.
    expect(game.hands[0]).toEqual(["KS", "2C", "3C"]);
    expect(game.moves).toEqual([]);
  });

  it("goes to war on a tie: three face down, one up, the higher taking everything", () => {
    const game = at(["5C", "2C", "3C", "4C", "KS", "6C"], ["5D", "2D", "3D", "4D", "9S", "6D"]);
    const after = playWar(game, { turn: true })!;
    expect(after.last?.wars).toBe(1);
    expect(after.last?.winner).toBe(0);
    expect(after.last?.laid.map((one) => `${one.seat}${one.card}${one.down ? "v" : "^"}`)).toEqual(["05C^", "15D^", "02Cv", "03Cv", "04Cv", "12Dv", "13Dv", "14Dv", "0KS^", "19S^"]);
    expect(after.hands[1]).toEqual(["6D"]);
    expect(after.hands[0]).toHaveLength(1 + 10);
    expect(sorted(after.hands[0].slice(1))).toEqual(sorted(["5C", "5D", "2C", "3C", "4C", "2D", "3D", "4D", "KS", "9S"]));
    expect(WAR_FACE_DOWN).toBe(3);
  });

  it("resolves a war inside a war until the cards differ, everything laid going to the winner", () => {
    const first = ["5C", "2C", "3C", "4C", "KS", "6C", "7C", "8C", "AS", "9C"];
    const second = ["5D", "2D", "3D", "4D", "KH", "6D", "7D", "8D", "3H", "9D"];
    const after = playWar(at(first, second), { turn: true })!;
    expect(after.last?.wars).toBe(2);
    expect(after.last?.winner).toBe(0);
    // The first pair, then three face down and one up each, twice over: 2 + 8 + 8.
    expect(after.last?.laid).toHaveLength(18);
    expect(after.last?.laid.filter((one) => one.down)).toHaveLength(12);
    expect(after.hands[1]).toEqual(["9D"]);
    expect(after.hands[0]).toHaveLength(1 + 18);
    expect(sorted(after.hands[0].slice(1))).toEqual(sorted([...first.slice(0, 9), ...second.slice(0, 9)]));
  });

  it("goes round again for as many wars as the cards tie, three wars deep", () => {
    const first = ["5C", "2C", "3C", "4C", "KS", "6C", "7C", "8C", "QS", "9C", "TC", "JC", "AS"];
    const second = ["5D", "2D", "3D", "4D", "KH", "6D", "7D", "8D", "QH", "9D", "TD", "JD", "3H"];
    const after = playWar(at(first, second), { turn: true })!;
    expect(after.last?.wars).toBe(3);
    expect(after.last?.winner).toBe(0);
    expect(after.last?.laid).toHaveLength(26);
    expect(after.hands[1]).toEqual([]);
    expect(after.ended).toBe("cleared");
  });

  it("makes the player who cannot finish a war the loser, and the other takes every card", () => {
    const game = at(["5C", "2C", "3C"], ["5D", "2D", "3D", "4D", "AS"]);
    const after = playWar(game, { turn: true })!;
    expect(after.phase).toBe("over");
    expect(after.ended).toBe("short");
    expect(after.hands[0]).toEqual([]);
    expect(after.hands[1]).toHaveLength(8);
    expect(held(after)).toBe(8);
    expect(warWinners(after)).toEqual([1]);
    expect(after.toPlay).toBeNull();
    expect(after.last?.winner).toBe(1);
  });

  it("makes the one who runs out first the loser when neither can finish a war", () => {
    const after = playWar(at(["5C", "2C"], ["5D", "3D", "4D"]), { turn: true })!;
    expect(after.ended).toBe("short");
    expect(warWinners(after)).toEqual([1]);
    expect(after.hands[0]).toEqual([]);
    expect(after.hands[1]).toHaveLength(5);
    expect(playWar(at(["5C", "2C", "9S"], ["5D", "3D"]), { turn: true })!.hands[1]).toEqual([]);
  });

  it("calls it a draw when neither can finish and both run out together, each taking back what they laid", () => {
    const game = at(["5C", "2C", "3C"], ["5D", "3D", "4D"]);
    const after = playWar(game, { turn: true })!;
    expect(after.ended).toBe("drawn");
    expect(after.phase).toBe("over");
    expect(sorted(after.hands[0])).toEqual(["2C", "3C", "5C"]);
    expect(sorted(after.hands[1])).toEqual(["3D", "4D", "5D"]);
    expect(warWinners(after)).toEqual([0, 1]);
    expect(after.last?.winner).toBeNull();
  });

  it("ends when one player holds every card", () => {
    const after = playWar(at(["KS", "2C"], ["3D"]), { turn: true })!;
    expect(after.ended).toBe("cleared");
    expect(after.hands[1]).toEqual([]);
    expect(warWinners(after)).toEqual([0]);
    expect(WAR_RULES.over(after)).toBe(true);
  });

  it("ends after the turns it was set up for, the player with more cards winning and equal piles shared", () => {
    const game = at(["KS", "2C", "4C"], ["9H", "3D", "5D"], { size: 25, moves: new Array<{ turn: true }>(24).fill({ turn: true }) });
    const after = playWar(game, { turn: true })!;
    expect(after.ended).toBe("limit");
    expect(warWinners(after)).toEqual([0]);
    const level = playWar(at(["KS", "2C"], ["9H", "3D", "5D", "6D"], { size: 25, moves: new Array<{ turn: true }>(24).fill({ turn: true }) }), { turn: true })!;
    expect(level.hands.map((hand) => hand.length)).toEqual([3, 3]);
    expect(level.ended).toBe("limit");
    expect(warWinners(level)).toEqual([0, 1]);
    expect(warWinners(game)).toEqual([]);
  });
});

/** A whole game played out by turning the cards over, with the cards counted after every turn. */
function playOut(size: number, seed: number) {
  let game = started(size, seed, [true, true]);
  let wars = 0;
  let deepest = 0;
  while (game.phase !== "over") {
    const next = playWar(game, warComputer(game));
    expect(next, `seed ${seed}: the rules refused the one move`).not.toBeNull();
    game = next!;
    expect(held(game), `seed ${seed}: the cards were not all there after turn ${game.moves.length}`).toBe(52);
    expect(sorted(game.hands.flat())).toEqual(sorted(FULL_DECK));
    wars += game.last?.wars ?? 0;
    deepest = Math.max(deepest, game.last?.wars ?? 0);
    if (game.moves.length > size) throw new Error(`seed ${seed}: a game that goes past its limit`);
  }
  return { game, wars, deepest };
}

describe("war, played out", () => {
  it("always ends, within its turns, with all fifty-two cards where they were, at every length offered", () => {
    for (const size of [25, 50, 100, 200, 1000]) {
      for (let seed = 1; seed <= 12; seed += 1) {
        const { game } = playOut(size, seed);
        expect(game.moves.length).toBeLessThanOrEqual(size);
        expect(game.ended).not.toBeNull();
        expect(game.toPlay).toBeNull();
        expect(warWinners(game).length).toBeGreaterThan(0);
        if (game.ended === "limit") expect(game.moves.length).toBe(size);
      }
    }
  });

  it("is decided before the limit in the games that are not cut short, the winner holding every card", () => {
    const ways = new Set<string>();
    for (let seed = 1; seed <= 20; seed += 1) {
      const { game } = playOut(1000, seed);
      ways.add(game.ended as string);
      expect(["cleared", "short"], `seed ${seed}`).toContain(game.ended);
      expect(warWinners(game)).toHaveLength(1);
      expect(game.hands.map((hand) => hand.length).sort((a, b) => a - b)).toEqual([0, 52]);
    }
    // Both ways a game is won turn up: by every card, and by a war the other could not finish.
    expect([...ways].sort()).toEqual(["cleared", "short"]);
  });

  it("meets wars inside wars, and resolves every one", () => {
    let nested = 0;
    for (let seed = 1; seed <= 80; seed += 1) {
      const { deepest } = playOut(200, seed);
      if (deepest >= 2) nested += 1;
    }
    expect(nested).toBeGreaterThan(0);
  });

  it("gives each seat some of the wins", () => {
    const won = new Set<number>();
    for (let seed = 1; seed <= 30; seed += 1) warWinners(playOut(50, seed).game).forEach((seat) => won.add(seat));
    expect(won).toEqual(new Set([0, 1]));
  });
});

describe("war, kept as text", () => {
  it("reads back exactly the game its moves make, half way and at the end", () => {
    let game = started(100, 99, [true, true]);
    for (let turn = 0; turn < 17; turn += 1) game = playWar(game, { turn: true })!;
    expect(decodeWar(encodeWar(game))).toEqual(game);
    const { game: ended } = playOut(50, 3);
    expect(decodeWar(encodeWar(ended))).toEqual(ended);
  });

  it("refuses text that is not a game of war, and a move the rules refuse", () => {
    const game = playWar(started(), { turn: true })!;
    const kept = JSON.parse(encodeWar(game)) as Record<string, unknown>;
    expect(decodeWar(null)).toBeNull();
    expect(decodeWar("{}")).toBeNull();
    expect(decodeWar(JSON.stringify({ ...kept, g: "hearts" }))).toBeNull();
    expect(decodeWar(JSON.stringify({ ...kept, moves: [{ turn: false }] }))).toBeNull();
    expect(decodeWar(JSON.stringify({ ...kept, size: 7 }))).toBeNull();
    expect(decodeWar(JSON.stringify({ ...kept, players: ["a", "b", "c"], computers: [false, false, false] }))).toBeNull();
    // A game that is over takes no more moves, so text that turns the cards after the end is not a game.
    const { game: ended } = playOut(25, 5);
    expect(decodeWar(JSON.stringify({ ...(JSON.parse(encodeWar(ended)) as object), moves: [...ended.moves, { turn: true }] }))).toBeNull();
  });
});
