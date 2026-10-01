import { describe, expect, it } from "vitest";

import { CARD_GAME_LIST, CARD_GAME_TABLES } from "./games/cardGames.constants.ts";
import type { CardGameKind } from "./games/cardGames.constants.ts";
import { newGame, playComputers, rulesFor } from "./play.ts";
import type { GameOf } from "./play.ts";
import { CSV_COLUMNS, SAVE_FORMAT, fromCode, fromJSON, recordOf, savedGame, toCSV, toCode, toJSON, toText } from "./save.ts";
import { VERSION } from "./version.ts";

const seats = (kind: CardGameKind) => Array.from({ length: CARD_GAME_TABLES[kind].defaultPlayers }, (_, seat) => `P${seat + 1}`);
/** A game part played: computers everywhere, stopped after some moves. */
function partPlayed<K extends CardGameKind>(kind: K, moves: number, seed = 5): GameOf<K> {
  const rules = rulesFor(kind);
  let game = newGame(kind, { players: seats(kind), seed, computers: seats(kind).map(() => true) })!;
  for (let at = 0; at < moves && !rules.over(game); at += 1) game = rules.play(game, rules.computer(game))!;
  return game;
}
const finished = <K extends CardGameKind>(kind: K, seed = 5): GameOf<K> => playComputers(kind, newGame(kind, { players: seats(kind), seed, computers: seats(kind).map(() => true) })!).game;

describe("JSON", () => {
  it("writes the format first, what wrote it, and the table, the seed and the moves", () => {
    const game = partPlayed("hearts", 6);
    const data = JSON.parse(toJSON("hearts", game));
    expect(Object.keys(data)).toEqual(["format", "generator", "game", "size", "players", "computers", "seed", "moves"]);
    expect(data).toMatchObject({ format: SAVE_FORMAT, generator: `toranpu ${VERSION}`, game: "hearts", size: 100, players: ["P1", "P2", "P3", "P4"], computers: [true, true, true, true], seed: 5 });
    expect(data.moves).toHaveLength(6);
    expect(toJSON("hearts", game)).toMatch(/^\{\n {2}"format": 1,/);
    expect(toJSON("hearts", game).endsWith("}\n")).toBe(true);
  });

  it("never writes a hand", () => {
    for (const kind of CARD_GAME_LIST) {
      const saved = savedGame(kind, partPlayed(kind, 3));
      expect(Object.keys(saved)).toEqual(["format", "generator", "game", "size", "players", "computers", "seed", "moves"]);
    }
  });

  it.each(CARD_GAME_LIST)("%s reads back as the same game, part played and finished", (kind) => {
    const rules = rulesFor(kind);
    for (const game of [partPlayed(kind, 0), partPlayed(kind, 9), finished(kind)]) {
      const back = fromJSON(toJSON(kind, game));
      expect(back).not.toBeNull();
      expect(back!.kind).toBe(kind);
      expect(back!.game).toEqual(game);
      expect(toJSON(back!.kind, back!.game as never)).toBe(toJSON(kind, game));
      expect(rules.over(back!.game as never)).toBe(rules.over(game));
    }
  });

  it.each(CARD_GAME_LIST)("%s: the code reads back too, and says which game it is", (kind) => {
    const game = partPlayed(kind, 7);
    const code = toCode(kind, game);
    expect(code).toBe(rulesFor(kind).encode(game));
    expect(code).not.toContain("\n");
    const back = fromCode(code);
    expect(back).toEqual({ kind, game });
    expect(fromJSON(code)).toEqual(back);
  });

  it("trusts nothing: a move the rules refuse means the text is not a game", () => {
    const game = partPlayed("hearts", 8);
    const saved = savedGame("hearts", game);
    const tampered = { ...saved, moves: [...saved.moves, { play: "AS" }, { play: "AS" }] };
    expect(fromJSON(JSON.stringify(tampered))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, moves: [{ play: "2C" }] }))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, seed: saved.seed + 1 }))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, players: ["Only", "Two"] }))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, game: "spades" }))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, size: 7 }))).toBeNull();
  });

  it("refuses what is not a saved game", () => {
    for (const text of ["", "not json", "null", "[]", "42", "{}", '{"format":1}', '{"format":1,"game":"poker","size":1,"players":["a","b"],"computers":[false,false],"seed":1,"moves":[]}', '{"game":"hearts","size":100,"players":["a","b","c","d"],"computers":[false,false,false,false],"seed":1,"moves":[]}', '{"v":1,"g":"poker"}', '{"v":2,"g":"hearts","size":100,"players":["a","b","c","d"],"computers":[false,false,false,false],"seed":1,"moves":[]}']) {
      expect(fromJSON(text), text).toBeNull();
    }
  });

  it("refuses a later format, and reads this one", () => {
    const saved = savedGame("goFish", partPlayed("goFish", 4));
    expect(fromJSON(JSON.stringify({ ...saved, format: 2 }))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, format: "1" }))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, format: 0 }))).toBeNull();
    expect(fromJSON(JSON.stringify({ ...saved, generator: "somebody else" }))?.kind).toBe("goFish");
  });
});

describe("a record", () => {
  it.each(CARD_GAME_LIST)("%s: every move has the seat that made it", (kind) => {
    const game = finished(kind);
    const record = recordOf(kind, game)!;
    const moves = (game as unknown as { moves: unknown[] }).moves;
    expect(record.map((step) => step.move)).toEqual(moves);
    for (const step of record) expect(step.seat >= 0 && step.seat < seats(kind).length).toBe(true);
    // Played again by those seats, it is the same game.
    const rules = rulesFor(kind);
    let again = newGame(kind, { players: seats(kind), seed: 5, computers: seats(kind).map(() => true) })!;
    for (const step of record) {
      expect(rules.toPlay(again)).toBe(step.seat);
      again = rules.play(again, step.move as never)!;
    }
    expect(again).toEqual(game);
  });

  it("as text: a heading, a line a move, and how it stands", () => {
    const game = partPlayed("cribbage", 3, 7);
    expect(toText("cribbage", game)).toBe("Cribbage for 2, seed 7: P1, P2\n1. P2: lays 9♠ K♥ in the crib\n2. P1: lays 8♥ K♠ in the crib\n3. P2: plays 4♥\nNot over. P1 to play.\n");
    expect(toText("cribbage", game, "ja")).toBe("クリベッジ（2人）、シード 7: P1、P2\n1. P2: 9♠ K♥をクリブに置きました\n2. P1: 8♥ K♠をクリブに置きました\n3. P2: 4♥を出しました\n進行中。次はP1の番です。\n");
    const done = finished("cribbage", 7);
    const lines = toText("cribbage", done).trimEnd().split("\n");
    expect(lines).toHaveLength((done as unknown as { moves: unknown[] }).moves.length + 2);
    expect(lines[lines.length - 1]).toBe("Over. Won by P1.");
  });

  it("as CSV: a header and a row a move, ended CRLF", () => {
    expect(CSV_COLUMNS).toEqual(["move", "seat", "player", "action", "cards", "detail", "text"]);
    const csv = toCSV("cribbage", partPlayed("cribbage", 3, 7));
    expect(csv).toBe('move,seat,player,action,cards,detail,text\r\n1,2,P2,crib,9S KH,"{""crib"":[""9S"",""KH""]}",lays 9♠ K♥ in the crib\r\n2,1,P1,crib,8H KS,"{""crib"":[""8H"",""KS""]}",lays 8♥ K♠ in the crib\r\n3,2,P2,play,4H,"{""play"":""4H""}",plays 4♥\r\n');
    expect(toCSV("hearts", partPlayed("hearts", 0))).toBe("move,seat,player,action,cards,detail,text\r\n");
  });

  it("a name with a comma or a quote is quoted in the CSV", () => {
    const rules = rulesFor("goFish");
    let game = newGame("goFish", { players: ['Ann "Ace", Jr', "Ben"], seed: 3, computers: [true, true] })!;
    game = rules.play(game, rules.computer(game))!;
    const row = toCSV("goFish", game).split("\r\n")[1];
    expect(row).toMatch(/^1,\d,("Ann ""Ace"", Jr"|Ben),ask,,/);
    expect(toCSV("goFish", game)).toContain('"Ann ""Ace"", Jr"');
  });

  it.each(CARD_GAME_LIST)("%s: every row of the CSV names an action, and the cards a move names", (kind) => {
    const rows = toCSV(kind, finished(kind)).trimEnd().split("\r\n").slice(1);
    expect(rows.length).toBeGreaterThan(10);
    for (const row of rows) expect(row.split(",")[3], row).toMatch(/^(play|pass|bid|crib|give|draw|discard|knock|order|call|ask|turn)$/);
  });
});
