import { describe, expect, it } from "vitest";

import { cliLanguage, runCli } from "./cli.ts";
import { cardId, shuffledDeck } from "./cards/deck.ts";
import { CARD_GAME_LIST, CARD_GAME_TABLES } from "./games/card-games.constants.ts";
import { newGame, playComputers, rulesFor } from "./play.ts";
import { fromJSON, toCSV, toCode, toJSON, toText } from "./save.ts";
import { STRINGS } from "./strings.ts";
import { VERSION } from "./version.ts";
import { cardsShort } from "./words.ts";

const run = (line: string, around = {}) => runCli(line === "" ? [] : line.split(" "), { seed: () => 123456, ...around });
const lines = (text: string) => text.trimEnd().split("\n");

describe("the help and the version", () => {
  it("prints the version", () => {
    expect(run("--version")).toEqual({ code: 0, out: `${VERSION}\n`, err: "" });
    expect(run("-v").out).toBe(`${VERSION}\n`);
  });

  it("prints help, in English and in Japanese, and when nothing is asked for", () => {
    expect(run("--help").out).toBe(STRINGS.en.cliUsage);
    expect(run("").out).toBe(STRINGS.en.cliUsage);
    expect(run("deal --help").out).toBe(STRINGS.en.cliUsage);
    expect(run("-h --lang ja").out).toBe(STRINGS.ja.cliUsage);
  });

  it("help names every command and option, in both languages, in lines that fit a terminal", () => {
    const options = (text: string) => [...text.matchAll(/^\s+(?:-\w, )?(--[\w-]+)/gm)].map((m) => m[1]);
    expect(options(STRINGS.en.cliUsage)).toEqual(["--seed", "--players", "--size", "--hands", "--each", "--text", "--json", "--csv", "--stdin", "--lang", "--no-color", "--help", "--version"]);
    expect(options(STRINGS.ja.cliUsage)).toEqual(options(STRINGS.en.cliUsage));
    const examples = (text: string) => text.split("\n").filter((line) => line.startsWith("  toranpu ")).map((line) => line.slice(0, 35).trimEnd());
    expect(examples(STRINGS.en.cliUsage)).toHaveLength(7);
    expect(examples(STRINGS.ja.cliUsage)).toEqual(examples(STRINGS.en.cliUsage));
    for (const line of STRINGS.en.cliUsage.split("\n")) expect(line.length, line).toBeLessThanOrEqual(80);
  });
});

describe("games", () => {
  it("lists the eleven, with their tables", () => {
    const out = lines(run("games").out);
    expect(out).toHaveLength(11);
    expect(out[0]).toBe("hearts       Hearts (3–4 players; 50 / 100): Avoid hearts and the queen of spades. Pass three cards, follow suit, lowest score wins.");
    expect(out[1]).toMatch(/^spades {7}Spades \(4 players; 200 \/ 300 \/ 500\)/);
    expect(lines(run("games --lang ja").out)[8]).toMatch(/^president {4}大富豪（3–8人、3 \/ 5 \/ 7）/);
  });

  it("as JSON and as CSV", () => {
    const data = JSON.parse(run("games --json").out);
    expect(data.format).toBe(1);
    expect(data.games.map((game: { game: string }) => game.game)).toEqual(CARD_GAME_LIST);
    expect(data.games[0]).toMatchObject({ game: "hearts", name: "Hearts", nameJa: "ハーツ", fewestPlayers: 3, mostPlayers: 4, sizes: [50, 100], defaultSize: 100 });
    const csv = run("games --csv").out.split("\r\n");
    expect(csv[0]).toBe("game,name,nameJa,fewestPlayers,mostPlayers,defaultPlayers,sizes,defaultSize");
    expect(csv[1]).toBe("hearts,Hearts,ハーツ,3,4,4,50 100,100");
    expect(csv).toHaveLength(13);
  });
});

describe("deal", () => {
  const deck = shuffledDeck(42).map(cardId);

  it("deals the whole deck to four, one card at a time round the table", () => {
    const out = lines(run("deal --seed 42").out);
    expect(out).toHaveLength(4);
    expect(out[0]).toBe(`Seat 1: ${cardsShort(deck.filter((_, at) => at % 4 === 0))}`);
    expect(out[3]).toBe(`Seat 4: ${cardsShort(deck.filter((_, at) => at % 4 === 3))}`);
    expect(run("deal --seed 42").err).toBe("");
  });

  it("deals the hands asked for, and says what is left", () => {
    const out = lines(run("deal -n 2 -e 5 -s 42").out);
    expect(out).toEqual([`Seat 1: ${cardsShort([0, 2, 4, 6, 8].map((at) => deck[at]))}`, `Seat 2: ${cardsShort([1, 3, 5, 7, 9].map((at) => deck[at]))}`, `Left: ${cardsShort(deck.slice(10))}`]);
    expect(lines(run("deal --hands 3 -s 42").out)).toHaveLength(4);
    expect(run("deal --hands=3 -s 42").out).toBe(run("deal --hands 3 -s 42").out);
    expect(lines(run("deal -n 2 -e 5 -s 42 --lang ja").out)[2]).toMatch(/^残り: /);
  });

  it("as JSON and as CSV", () => {
    const data = JSON.parse(run("deal -n 2 -e 5 -s 42 --json").out);
    expect(data).toEqual({ format: 1, generator: `toranpu ${VERSION}`, seed: 42, hands: [[0, 2, 4, 6, 8].map((at) => deck[at]), [1, 3, 5, 7, 9].map((at) => deck[at])], rest: deck.slice(10) });
    const csv = run("deal -n 2 -e 1 -s 42 --csv").out.split("\r\n");
    expect(csv.slice(0, 4)).toEqual(["hand,place,card", `1,1,${deck[0]}`, `2,1,${deck[1]}`, `rest,1,${deck[2]}`]);
  });

  it("draws a seed when none is given, and says which on standard error", () => {
    const ran = run("deal");
    expect(ran.err).toBe("toranpu: seed 123456 (pass --seed 123456 to repeat this)\n");
    expect(ran.out).toBe(run("deal --seed 123456").out);
    expect(run("deal --json").err).toBe("");
    expect(JSON.parse(run("deal --json").out).seed).toBe(123456);
  });

  it("a game's own first deal, seat by seat", () => {
    const game = newGame("hearts", { players: ["a", "b", "c", "d"], seed: 42 })!;
    expect(lines(run("deal hearts --seed 42").out)).toEqual(game.hands.map((hand, seat) => `Seat ${seat + 1}: ${cardsShort(hand)}`));
    const euchre = newGame("euchre", { players: ["a", "b", "c", "d"], seed: 42 })!;
    expect(lines(run("deal euchre --seed 42").out)[4]).toBe(`Turned up: ${cardsShort([euchre.upcard])}`);
    expect(lines(run("deal hearts --seed 42 --players 3").out)).toHaveLength(3);
    expect(JSON.parse(run("deal euchre -s 42 --json").out)).toMatchObject({ game: "euchre", size: 10, seed: 42, hands: euchre.hands, turned: euchre.upcard });
    expect(run("deal hearts -s 42 --csv").out.split("\r\n")[1]).toBe(`1,Seat 1,1,${game.hands[0][0]}`);
  });

  it("finds a game by any of its names", () => {
    const want = run("deal crazyEights -s 9").out;
    for (const name of ["crazyeights", "Crazy-Eights", "crazy_eights", "クレイジーエイト"]) expect(run(`deal ${name} -s 9`).out).toBe(want);
    expect(runCli(["deal", "Crazy Eights", "-s", "9"]).out).toBe(want);
    expect(run("deal 大富豪 -s 9").out).toBe(run("deal president -s 9").out);
  });
});

describe("play", () => {
  it.each(CARD_GAME_LIST)("%s: computers play a whole game, and the seed decides it", (kind) => {
    const players = Array.from({ length: CARD_GAME_TABLES[kind].defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
    const { game } = playComputers(kind, newGame(kind, { players, seed: 7, computers: players.map(() => true) })!);
    const ran = run(`play ${kind} --seed 7`);
    expect(ran.code).toBe(0);
    expect(lines(ran.out)).toHaveLength(2);
    expect(lines(ran.out)[0]).toContain(`seed 7: ${(game as unknown as { moves: unknown[] }).moves.length} moves. Won by ${rulesFor(kind).winners(game).map((seat) => players[seat]).join(", ")}.`);
    expect(run(`play ${kind} --seed 7 --text`).out).toBe(toText(kind, game));
    expect(run(`play ${kind} --seed 7 --csv`).out).toBe(toCSV(kind, game));
    const data = JSON.parse(run(`play ${kind} --seed 7 --json`).out);
    expect(data).toMatchObject({ ...JSON.parse(toJSON(kind, game)), over: true, winners: rulesFor(kind).winners(game) });
    expect(data.scores).toHaveLength(kind === "spades" || kind === "euchre" ? 2 : players.length);
    // What it printed is a saved game.
    expect(fromJSON(run(`play ${kind} --seed 7 --json`).out)?.game).toEqual(game);
  });

  it("war: what each seat finishes with is its cards, and together they are the deck", () => {
    for (const size of [25, 100]) {
      const data = JSON.parse(run(`play war --seed 11 --size ${size} --json`).out);
      expect(data.scores).toHaveLength(2);
      expect(data.scores[0] + data.scores[1]).toBe(52);
      expect(data.moves.length).toBeLessThanOrEqual(size);
    }
    expect(run("play 戦争 -s 11").out).toBe(run("play war -s 11").out);
    expect(run("play war -s 11 --size 7").code).toBe(2);
    expect(run("play war -s 11 -p 3").code).toBe(2);
  });

  it("takes the table asked for", () => {
    expect(lines(run("play hearts -s 7 -p 3 --size 50").out)[0]).toMatch(/^Hearts for 3, seed 7: /);
    expect(lines(run("play president -s 7 -p 8").out)[0]).toMatch(/^President for 8, seed 7: /);
    expect(lines(run("play goFish -s 7 --lang ja").out)[0]).toMatch(/^ゴーフィッシュ（3人）、シード 7: \d+手。勝者は席\d/);
  });
});

describe("check", () => {
  const game = playComputers("cribbage", newGame("cribbage", { players: ["Ann", "Ben"], seed: 7, computers: [true, true] })!).game;
  const going = (() => {
    const rules = rulesFor("hearts");
    let now = newGame("hearts", { players: ["Ann", "Ben", "Cy", "Di"], seed: 7, computers: [true, true, true, true] })!;
    for (let at = 0; at < 10; at += 1) now = rules.play(now, rules.computer(now))!;
    return now;
  })();

  it("reads a saved game from standard input, as JSON or as its code", () => {
    expect(run("check --stdin", { stdin: toJSON("cribbage", game) })).toEqual({ code: 0, out: `Cribbage for 2, seed 7, ${game.moves.length} moves. Over: won by ${game.players[rulesFor("cribbage").winners(game)[0]]}.\n`, err: "" });
    expect(run("check --stdin", { stdin: toCode("cribbage", game) }).out).toBe(run("check --stdin", { stdin: toJSON("cribbage", game) }).out);
    expect(run("check --stdin", { stdin: toJSON("hearts", going) }).out).toBe(`Hearts for 4, seed 7, 10 moves. Not over: ${going.players[going.toPlay!]} to play.\n`);
    expect(run("check --stdin --lang ja", { stdin: toJSON("hearts", going) }).out).toBe(`ハーツ（4人）、シード 7、10手。進行中: 次は${going.players[going.toPlay!]}の番です\n`);
  });

  it("reads a file named, through what it is given to read files with", () => {
    const readFile = (path: string) => (path === "saved.json" ? toJSON("cribbage", game) : null);
    expect(run("check saved.json", { readFile }).code).toBe(0);
    expect(run("check missing.json", { readFile })).toEqual({ code: 1, out: "", err: "toranpu: there is no saved game to check: name a file, or pipe one in with --stdin\n" });
  });

  it("a game that is not one is exit code 1", () => {
    const tampered = toJSON("hearts", going).replace('"seed": 7', '"seed": 8');
    expect(run("check --stdin", { stdin: tampered })).toEqual({ code: 1, out: "", err: "toranpu: that is not a saved game: the rules cannot play it out\n" });
    expect(run("check --stdin", { stdin: "hello" }).code).toBe(1);
    expect(run("check --stdin", { stdin: "" }).code).toBe(1);
    expect(JSON.parse(run("check --stdin --json", { stdin: "hello" }).out)).toMatchObject({ ok: false });
    expect(run("check --stdin --lang ja", { stdin: "hello" }).err).toBe("toranpu: 保存したゲームではありません。ルールどおりに再現できません\n");
  });

  it("as JSON and as CSV", () => {
    expect(JSON.parse(run("check --stdin --json", { stdin: toJSON("hearts", going) }).out)).toEqual({ format: 1, generator: `toranpu ${VERSION}`, ok: true, game: "hearts", size: 100, players: ["Ann", "Ben", "Cy", "Di"], computers: [true, true, true, true], seed: 7, moves: 10, over: false, toPlay: going.toPlay, winners: [] });
    expect(run("check --stdin --csv", { stdin: toJSON("hearts", going) }).out).toBe(toCSV("hearts", going));
  });

  it("with nothing to check, the command was wrong", () => {
    expect(run("check").code).toBe(2);
  });
});

describe("what is refused", () => {
  const wrong = (line: string, message: string) => expect(run(line), line).toEqual({ code: 2, out: "", err: `toranpu: ${message}\nTry \`toranpu --help\`.\n` });

  it("a wrong command is exit code 2, with where to look", () => {
    wrong("--bogus", "unknown option --bogus");
    wrong("shuffle", "“shuffle” is not a command. There are games, deal, play and check");
    wrong("deal --seed", "--seed needs a value");
    wrong("deal --seed 0", "--seed takes a whole number from 1 to 2147483647");
    wrong("deal --seed x", "--seed takes a whole number from 1 to 2147483647");
    wrong("deal --seed 2147483648", "--seed takes a whole number from 1 to 2147483647");
    wrong("deal -n 5 -e 11 -s 1", "there are 52 cards: 5 hands of 11 cannot be dealt");
    wrong("deal -n 0 -s 1", "there are 52 cards: 0 hands of ? cannot be dealt");
    wrong("play hearts -p 5 -s 1", "Hearts is played by 3 to 4");
    wrong("play hearts --size 75 -s 1", "Hearts is played to one of: 50 / 100");
    wrong("games --lang fr", "--lang takes en or ja");
    wrong("games --json --csv", "--json and --csv are one or the other");
  });

  it("a game nobody has heard of is exit code 1", () => {
    expect(run("play poker -s 1")).toEqual({ code: 1, out: "", err: "toranpu: no game is called “poker”. `toranpu games` lists them\n" });
    expect(run("play -s 1").code).toBe(1);
  });

  it("in Japanese when asked", () => {
    expect(run("--bogus --lang ja").err).toBe("toranpu: 不明なオプションです: --bogus\n`toranpu --help` をご覧ください。\n");
    expect(run("play hearts -p 5 -s 1 --lang ja").err).toBe("toranpu: ハーツは3〜4人で遊びます\n`toranpu --help` をご覧ください。\n");
  });
});

describe("the language and the colour", () => {
  it("follows --lang, then the environment, then the system", () => {
    expect(cliLanguage(undefined, {}, undefined)).toBe("en");
    expect(cliLanguage(undefined, { LANG: "ja_JP.UTF-8" })).toBe("ja");
    expect(cliLanguage("en", { LANG: "ja_JP.UTF-8" })).toBe("en");
    expect(cliLanguage(undefined, { LC_ALL: "ja_JP.UTF-8", LANG: "en_US.UTF-8" })).toBe("ja");
    expect(cliLanguage(undefined, { LANG: "C.UTF-8" }, "ja-JP")).toBe("ja");
    expect(run("--help", { env: { LANG: "ja_JP.UTF-8" } }).out).toMatch(/^使い方/);
  });

  it("is bold only on a terminal that shows colour", () => {
    const escape = String.fromCharCode(27);
    expect(run("deal -s 1", { colour: true }).out).toContain(`${escape}[1mSeat 1${escape}[0m`);
    expect(run("deal -s 1").out).not.toContain(escape);
    expect(run("deal -s 1 --no-color", { colour: true }).out).not.toContain(escape);
    expect(run("deal -s 1", { colour: true, env: { NO_COLOR: "1" } }).out).not.toContain(escape);
  });
});
