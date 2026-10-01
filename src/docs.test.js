// The documents that are made from the source, or that quote it, checked against it.
// Plain JavaScript, so that reading files needs no Node types. `pnpm docs:make` rewrites what is made.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import process from "node:process";

import { describe, expect, it } from "vitest";

import * as deck from "./deck.ts";
import * as toranpu from "./index.ts";

const { CARD_GAME_LIST, CARD_GAME_TABLES, STRINGS, VERSION, cardShort, cardText, fromCode, fromJSON, gameName, moveText, newGame, playComputers, rulesFor, runCli, toCSV, toCode, toJSON, toText } = toranpu;
const { bigTwo, crazyEights, cribbage, euchre, ginRummy, goFish, hearts, ohHell, president, spades } = toranpu;

const readme = readFileSync("README.md", "utf8");
const games = readFileSync("docs/games.md", "utf8");
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const says = (code) => expect(readme, code).toContain(code);
const blocks = (language, doc = readme) => [...doc.matchAll(new RegExp(`\`\`\`${language}\\n([\\s\\S]*?)\`\`\``, "g"))].map((m) => m[1]);
/** The rows of the first table after a heading: each row's cells. */
function table(heading, doc = readme) {
  const from = doc.indexOf(heading);
  if (from < 0) throw new Error(`no “${heading}”`);
  const rows = [];
  for (const line of doc.slice(from).split("\n").slice(heading.startsWith("|") ? 0 : 1)) {
    if (line.startsWith("|")) rows.push(line.split(/(?<!\\)\|/).slice(1, -1).map((cell) => cell.trim()));
    else if (rows.length > 0) break;
  }
  return rows.slice(2);
}

describe("the README in 30 seconds", () => {
  it("the game of Go Fish comes to what it says", () => {
    const players = ["You", "Aiko", "Ben"];
    const rules = rulesFor("goFish");
    let game = newGame("goFish", { players, seed: 2026, computers: [false, true, true] });
    game = playComputers("goFish", game).game;
    const offered = rules.moves(game);
    says("const offered = rules.moves(game);                // every move you may make: 12 of them");
    expect(offered).toHaveLength(12);
    says('moveText("goFish", offered[0], { players });      // "Ask Aiko for fours"');
    expect(moveText("goFish", offered[0], { players })).toBe("Ask Aiko for fours");
    const before = JSON.stringify(game);
    const after = rules.play(game, offered[0]);
    expect(after).not.toBeNull();
    expect(JSON.stringify(game)).toBe(before);
  });

  it("the terminal line deals what it says", () => {
    says("npx @johnmorrisdotca/toranpu deal --hands 2 --each 5 --seed 42   # Seat 1: 3♣ 2♥ K♣ 7♠ 10♦ …");
    expect(runCli(["deal", "--hands", "2", "--each", "5", "--seed", "42"]).out.split("\n")[0]).toBe("Seat 1: 3♣ 2♥ K♣ 7♠ 10♦");
  });
});

describe("the README on the API alone", () => {
  it("a game of Euchre, played out, saved and read back", () => {
    says("CARD_GAME_TABLES.euchre;      // { fewestPlayers: 4, mostPlayers: 4, defaultPlayers: 4, sizes: [5, 10], defaultSize: 10 }");
    expect(CARD_GAME_TABLES.euchre).toEqual({ fewestPlayers: 4, mostPlayers: 4, defaultPlayers: 4, sizes: [5, 10], defaultSize: 10 });
    const start = newGame("euchre", { players: ["North", "East", "South", "West"], seed: 42, computers: [true, true, true, true] });
    const { game, moves } = playComputers("euchre", start);
    const rules = rulesFor("euchre");
    expect(rules.over(game)).toBe(true);
    says("rules.winners(game);          // [0, 2]: North and South");
    expect(rules.winners(game)).toEqual([0, 2]);
    says("game.scores;                  // [11, 6]");
    expect(game.scores).toEqual([11, 6]);
    says("moves.length;                 // 330");
    expect(moves).toHaveLength(330);
    expect(fromJSON(toJSON("euchre", game)).kind).toBe("euchre");
    says('toText("euchre", game).split("\\n")[0];   // "Euchre for 4, seed 42: North, East, South, West"');
    expect(toText("euchre", game).split("\n")[0]).toBe("Euchre for 4, seed 42: North, East, South, West");
  });
});

describe("the README's framework examples", () => {
  const proof = readFileSync("scripts/check-frameworks.mjs", "utf8").replaceAll("\\`", "`").replaceAll("\\${", "${");

  it("the Vue, Svelte and Angular components are the ones the framework check builds, to the letter", () => {
    expect(proof).toContain(blocks("vue")[0]);
    expect(proof).toContain(blocks("svelte")[0]);
    expect(proof).toContain(blocks("ts").find((block) => block.startsWith("// Angular")).split("\n").slice(1).join("\n"));
  });

  it("the React component is the one built, but for its types", () => {
    expect(proof).toContain(blocks("tsx")[0].replace("{ seed }: { seed: number }", "{ seed }"));
  });

  it("the plain page is the one opened, but for where it finds the package", () => {
    expect(proof).toContain(blocks("html")[0].trimEnd());
  });
});

describe("the README on the deck, on words and on export", () => {
  it("the deck", () => {
    const cards = deck.shuffledDeck(42);
    says('const deck = shuffledDeck(42);                  // [{ suit: "clubs", rank: 3 }, …]: the same order for seed 42, always');
    expect(cards[0]).toEqual({ suit: "clubs", rank: 3 });
    const { hands, rest } = deck.dealRound(cards, 4, 5);
    says('cardName(hands[0][0]);                          // "three of clubs"');
    expect(deck.cardName(hands[0][0])).toBe("three of clubs");
    says('hands[0].map(cardShortName).join(" ");          // "3♣ K♣ 10♦ A♥ 2♦"');
    expect(hands[0].map(deck.cardShortName).join(" ")).toBe("3♣ K♣ 10♦ A♥ 2♦");
    says("rest.length;                                    // 32");
    expect(rest).toHaveLength(32);
    says('writeCards(deck);                               // "pvOZziGxjrXCNQoybFwJnDstTEelhRBaPAVuSHLdkKUmcMYIgqWf": a letter a card');
    expect(deck.writeCards(cards)).toBe("pvOZziGxjrXCNQoybFwJnDstTEelhRBaPAVuSHLdkKUmcMYIgqWf");
    expect(deck.isWholeDeck(deck.writeCards(cards))).toBe(true);
    expect(deck.writeCards(deck.freshDeck())).toBe(deck.CARD_ALPHABET);
  });

  it("words", () => {
    says('gameName("president", "ja");                 // "大富豪"');
    expect([gameName("president"), gameName("president", "ja")]).toEqual(["President", "大富豪"]);
    says('cardText("QS", "ja");                        // "スペードのクイーン"');
    expect([cardText("QS"), cardText("QS", "ja"), cardShort("TD")]).toEqual(["queen of spades", "スペードのクイーン", "10♦"]);
    says('moveText("hearts", { play: "QS" });                                       // "Play Q♠": a button\'s words');
    expect(moveText("hearts", { play: "QS" })).toBe("Play Q♠");
    says('moveText("hearts", { play: "QS" }, { form: "did" });                      // "plays Q♠": a record\'s');
    expect(moveText("hearts", { play: "QS" }, { form: "did" })).toBe("plays Q♠");
    says('moveText("hearts", { pass: ["QS", "AH", "KH"] }, { form: "hidden" });     // "passes cards: 3": what the table saw');
    expect(moveText("hearts", { pass: ["QS", "AH", "KH"] }, { form: "hidden" })).toBe("passes cards: 3");
    says('moveText("spades", { bid: 0 });                                           // "Bid nil"');
    expect(moveText("spades", { bid: 0 })).toBe("Bid nil");
    says('moveText("crazyEights", { play: "8S", suit: "D" }, { language: "ja" });   // "8♠を出してダイヤを指定する"');
    expect(moveText("crazyEights", { play: "8S", suit: "D" }, { language: "ja" })).toBe("8♠を出してダイヤを指定する");
    expect(readme).toContain('"愛子にクイーンを聞く"');
    expect(moveText("goFish", { ask: 1, rank: 12 }, { language: "ja", players: ["あなた", "愛子"] })).toBe("愛子にクイーンを聞く");
  });

  it("export and import: the code and the JSON shown are the ones written", () => {
    const players = ["You", "Aiko", "Ben"];
    const game = newGame("goFish", { players, seed: 2026, computers: [false, true, true] });
    const [code, json] = blocks("json");
    expect(code.trimEnd()).toBe(toCode("goFish", game));
    expect(json).toBe(toJSON("goFish", game));
    expect(fromJSON(toJSON("goFish", game))).toEqual({ kind: "goFish", game });
    expect(fromCode(toCode("goFish", game))).toEqual({ kind: "goFish", game });
    expect(fromJSON("not a game")).toBeNull();
    const fields = table("| Field of the JSON").map((row) => row[0].replaceAll("`", ""));
    expect(fields).toEqual(Object.keys(JSON.parse(toJSON("goFish", game))));
    expect(readme).toContain("`move`, `seat`, `player`, `action`, `cards`, `detail` (the move as JSON)\nand `text`");
    expect(toCSV("goFish", game).split("\r\n")[0]).toBe(toranpu.CSV_COLUMNS.join(","));
    const hearts100 = playComputers("hearts", newGame("hearts", { players: ["a", "b", "c", "d"], seed: 3, computers: [true, true, true, true] })).game;
    expect(hearts100.moves.length).toBeGreaterThan(400);
    expect(toCode("hearts", hearts100).length).toBeGreaterThan(6000);
  });
});

describe("the README on the command line", () => {
  it("prints the help as it is", () => {
    expect(readme).toContain(`\`\`\`\n${STRINGS.en.cliUsage}\`\`\``);
  });

  it("the runs it shows come out as shown", () => {
    const shown = blocks("sh").find((block) => block.startsWith("$ toranpu deal euchre"));
    const dealt = runCli(["deal", "euchre", "--seed", "42"]).out;
    const played = runCli(["play", "euchre", "--seed", "42"]).out;
    const checked = runCli(["check", "--stdin"], { stdin: runCli(["play", "euchre", "--seed", "42", "--json"]).out }).out;
    expect(shown).toBe(`$ toranpu deal euchre --seed 42\n${dealt}$ toranpu play euchre --seed 42\n${played}$ toranpu play euchre --seed 42 --json | toranpu check --stdin\n${checked}`);
    says('runCli(["deal", "--hands", "2", "--each", "2", "--seed", "42"]).out.split("\\n")[0];   // "Seat 1: 3♣ 2♥"');
    expect(runCli(["deal", "--hands", "2", "--each", "2", "--seed", "42"]).out.split("\n")[0]).toBe("Seat 1: 3♣ 2♥");
    for (const name of ["crazyEights", "crazy-eights", "大富豪"]) expect(runCli(["deal", name, "--seed", "1"]).code, name).toBe(0);
  });
});

describe("the README's tables", () => {
  it("the games table says what each table offers", () => {
    const rows = table("| Game | Players | `size`");
    expect(rows.map((row) => row[0].replaceAll("*", ""))).toEqual(CARD_GAME_LIST.map((kind) => gameName(kind)));
    rows.forEach((row, at) => {
      const offered = CARD_GAME_TABLES[CARD_GAME_LIST[at]];
      const players = offered.fewestPlayers === offered.mostPlayers ? String(offered.fewestPlayers) : `${offered.fewestPlayers}–${offered.mostPlayers}`;
      expect(row[1].startsWith(players), row[0]).toBe(true);
      for (const size of offered.sizes) expect(row[2], `${row[0]} ${size}`).toMatch(new RegExp(`(^|\\D)${size}(\\D|$)`));
    });
  });

  it("the moves table names every shape of move a game makes, and no other", () => {
    const rows = table("| Game | Moves |");
    expect(rows.map((row) => row[0])).toEqual(["Hearts", "Spades", "Euchre", "Cribbage", "Oh Hell", "Crazy Eights", "Go Fish", "Big Two", "President", "Gin Rummy"]);
    const kinds = ["hearts", "spades", "euchre", "cribbage", "ohHell", "crazyEights", "goFish", "bigTwo", "president", "ginRummy"];
    rows.forEach((row, at) => {
      const named = new Set([...row[1].matchAll(/\{ (\w+):/g)].map((m) => m[1]));
      const made = new Set();
      for (const seed of [1, 2, 3, 4, 5, 6]) {
        const count = CARD_GAME_TABLES[kinds[at]].defaultPlayers;
        const players = Array.from({ length: count }, (_, seat) => `P${seat}`);
        for (const move of playComputers(kinds[at], newGame(kinds[at], { players, seed, computers: players.map(() => true) })).moves) made.add(Object.keys(move)[0]);
      }
      for (const key of made) expect(named.has(key), `${row[0]} makes { ${key} }`).toBe(true);
      expect(named.size, row[0]).toBeGreaterThanOrEqual(made.size);
    });
  });

  it("the API tables name only what is exported, and every export of the front door and the deck is named", () => {
    const api = readme.slice(readme.indexOf("## API"), readme.indexOf("## Theming"));
    const source = (dir) => readdirSync(dir, { recursive: true }).filter((name) => String(name).endsWith(".ts") && !String(name).includes(".test.")).map((name) => readFileSync(`${dir}/${name}`, "utf8")).join("\n");
    const types = [...source("src").matchAll(/^export type (\w+)/gm)].map((m) => m[1]);
    for (const name of Object.keys(toranpu)) expect(api.includes(`\`${name}\``) || api.includes(`\`${name}(`), `the front door's ${name}`).toBe(true);
    for (const name of Object.keys(deck)) expect(api.includes(`\`${name}\``) || api.includes(`\`${name}(`), `the deck's ${name}`).toBe(true);
    const everything = new Set([...Object.keys(toranpu), ...Object.keys(deck), ...CARD_GAME_LIST.flatMap((kind) => Object.keys(toranpu[kind])), ...types, "useCardGame"]);
    const named = [...api.matchAll(/`([A-Za-z_]\w*)[`(]/g)].map((m) => m[1]).filter((name) => !["game", "toPlay", "computerToPlay", "moves", "over", "winners", "play", "restart", "null", "default", "computerDelay"].includes(name));
    expect(named.length).toBeGreaterThan(120);
    for (const name of named) expect(everything.has(name), `the README names ${name}`).toBe(true);
  });

  it("every export has a doc comment", () => {
    for (const name of readdirSync("src", { recursive: true }).map(String).filter((file) => file.endsWith(".ts") && !file.includes(".test."))) {
      const lines = readFileSync(`src/${name}`, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (!/^export (function|const|type) \w/.test(line)) return;
        expect(lines[i - 1].trimEnd().endsWith("*/"), `${name}: ${line}`).toBe(true);
      });
    }
  });

  it("the sizes it quotes are about right", () => {
    expect(readme).toContain("a game of Hearts to 100 is about six hundred\nmoves and nine thousand characters of code");
  });
});

describe("docs/games.md", () => {
  it("has a section and a source for every game, in the order the package lists them", () => {
    const headings = [...games.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
    expect(headings.slice(0, 10)).toEqual(CARD_GAME_LIST.map((kind) => gameName(kind)));
    for (const name of headings.slice(0, 10)) {
      const section = games.slice(games.indexOf(`## ${name}\n`), games.indexOf("\n## ", games.indexOf(`## ${name}\n`) + 4));
      expect(section, name).toMatch(/Sources?: \[pagat\.com\//);
      expect(section, name).toContain("**Tables differ**");
    }
  });

  it("says the players and the sizes each table offers", () => {
    const words = { 2: "Two", 3: "Three", 4: "Four" };
    for (const kind of CARD_GAME_LIST) {
      const offered = CARD_GAME_TABLES[kind];
      const from = games.indexOf(`## ${gameName(kind)}\n`);
      const lead = games.slice(from, games.indexOf("\n- ", from)).replace(/\s+/g, " ");
      expect(lead, kind).toContain(offered.fewestPlayers === offered.mostPlayers ? `${words[offered.fewestPlayers]} players` : `${words[offered.fewestPlayers]} `);
      if (offered.sizes.length > 1) for (const size of offered.sizes) expect(lead, `${kind} ${size}`).toMatch(new RegExp(`\\D${size}\\D`));
    }
  });

  it("Hearts: the points, the moon, the pass and the three-handed pack", () => {
    expect(hearts.heartsPoints("QS")).toBe(13);
    expect(hearts.heartsPoints("2H")).toBe(1);
    expect(hearts.heartsPoints("AS")).toBe(0);
    expect(hearts.HEARTS_ALL_POINTS).toBe(26);
    expect([0, 1, 2, 3, 4].map((deal) => hearts.passOffset(deal, 4))).toEqual([1, 3, 2, 0, 1]);
    expect([0, 1, 2, 3].map((deal) => hearts.passOffset(deal, 3))).toEqual([1, 2, 0, 1]);
    const three = newGame("hearts", { players: ["a", "b", "c"], seed: 1 });
    expect(three.hands.map((hand) => hand.length)).toEqual([17, 17, 17]);
    expect(three.hands.flat()).not.toContain("2D");
    const four = newGame("hearts", { players: ["a", "b", "c", "d"], seed: 1 });
    expect(four.hands.map((hand) => hand.length)).toEqual([13, 13, 13, 13]);
  });

  it("Spades: ten a trick, a point a bag, a hundred for nil", () => {
    const score = (bids, tricks, team) => spades.partnershipScore(bids, tricks, team);
    expect(score([4, 3, 3, 3], [5, 3, 3, 2], 0)).toEqual({ points: 71, bags: 1 });
    expect(score([4, 3, 3, 3], [3, 4, 3, 3], 0)).toEqual({ points: -70, bags: 0 });
    expect(score([0, 3, 4, 3], [0, 3, 4, 6], 0)).toEqual({ points: 140, bags: 0 });
    expect(score([0, 3, 4, 3], [1, 3, 4, 5], 0)).toEqual({ points: -60, bags: 1 });
    expect(spades.SPADES_BIDS).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]);
  });

  it("Euchre: twenty-four cards, the bowers, and the points", () => {
    expect(euchre.EUCHRE_DECK).toHaveLength(24);
    expect(euchre.euchreHeight("JH", "H")).toBeGreaterThan(euchre.euchreHeight("JD", "H"));
    expect(euchre.euchreHeight("JD", "H")).toBeGreaterThan(euchre.euchreHeight("AH", "H"));
    expect(euchre.suitIn("JD", "H")).toBe("H");
    expect([euchre.handPoints(0, 3), euchre.handPoints(0, 4), euchre.handPoints(0, 5), euchre.handPoints(0, 2)]).toEqual([[1, 0], [1, 0], [2, 0], [0, 2]]);
    // Stick the dealer: in the second round the dealer is offered no pass.
    const rules = rulesFor("euchre");
    let game = newGame("euchre", { players: ["a", "b", "c", "d"], seed: 1 });
    for (let at = 0; at < 7; at += 1) game = rules.play(game, { pass: true });
    expect(game.phase).toBe("call");
    expect(rules.toPlay(game)).toBe(euchre.dealerOf(0));
    expect(rules.moves(game).some((move) => "pass" in move)).toBe(false);
    expect(rules.moves(game)).toHaveLength(3);
  });

  it("Cribbage: the pegging and the show", () => {
    expect(cribbage.pegPoints(["7H", "8D"], 15)).toEqual({ points: 2, why: ["fifteen"] });
    expect(cribbage.pegPoints(["5H", "5D"], 10).points).toBe(2);
    expect(cribbage.pegPoints(["5H", "5D", "5S"], 15).points).toBe(8);
    expect(cribbage.pegPoints(["5H", "5D", "5S", "5C"], 20).points).toBe(12);
    expect(cribbage.pegPoints(["3H", "5D", "4S"], 12).points).toBe(3);
    expect(cribbage.pegPoints(["TH", "JD", "AS", "KC"], 31).points).toBe(2);
    // The highest hand there is: three fives and the jack, with the fourth five cut.
    expect(cribbage.showCount(["5H", "5D", "5S", "JC"], "5C").total).toBe(29);
    expect(cribbage.showCount(["2H", "4H", "6H", "8H"], "KS")).toMatchObject({ flush: 4 });
    expect(cribbage.showCount(["2H", "4H", "6H", "8H"], "KH")).toMatchObject({ flush: 5 });
    expect(cribbage.showCount(["2H", "4H", "6H", "8H"], "KS", true)).toMatchObject({ flush: 0 });
    expect(cribbage.showCount(["2H", "4H", "6H", "JS"], "KS")).toMatchObject({ nobs: 1 });
  });

  it("Oh Hell: the deals, and ten and your bid", () => {
    expect(ohHell.dealSizes(7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(ohHell.dealSizes(13)).toEqual([1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1]);
    expect([ohHell.dealPoints(0, 0), ohHell.dealPoints(3, 3), ohHell.dealPoints(3, 2), ohHell.dealPoints(3, 4)]).toEqual([10, 13, 0, 0]);
    // The hook: on a deal of one card for four, three bids of nought leave the dealer unable to bid one.
    const rules = rulesFor("ohHell");
    let game = newGame("ohHell", { players: ["a", "b", "c", "d"], seed: 1 });
    for (let at = 0; at < 3; at += 1) game = rules.play(game, { bid: 0 });
    expect(rules.moves(game)).toEqual([{ bid: 0 }]);
  });

  it("Crazy Eights: the deal and the points", () => {
    expect([2, 3, 7].map(crazyEights.crazyHandSize)).toEqual([7, 5, 5]);
    expect(["8S", "KH", "QD", "JC", "AS", "7D", "TD"].map(crazyEights.crazyPoints)).toEqual([50, 10, 10, 10, 1, 7, 10]);
    // No drawing while a card could be played.
    const rules = rulesFor("crazyEights");
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const moves = rules.moves(newGame("crazyEights", { players: ["a", "b"], seed }));
      expect(moves.some((move) => "draw" in move) && moves.some((move) => "play" in move)).toBe(false);
    }
  });

  it("Go Fish: the deal, and thirteen books", () => {
    expect([2, 3, 4, 6].map(goFish.goFishHandSize)).toEqual([7, 7, 5, 5]);
    const played = playComputers("goFish", newGame("goFish", { players: ["a", "b", "c"], seed: 4, computers: [true, true, true] })).game;
    expect(played.books.flat()).toHaveLength(13);
  });

  it("Big Two: the order of the cards, the hands and the charge", () => {
    const value = bigTwo.bigTwoValue;
    expect(bigTwo.bigTwoCard("3D")).toBeLessThan(bigTwo.bigTwoCard("3C"));
    expect(bigTwo.bigTwoCard("3C")).toBeLessThan(bigTwo.bigTwoCard("3H"));
    expect(bigTwo.bigTwoCard("3H")).toBeLessThan(bigTwo.bigTwoCard("3S"));
    expect(bigTwo.bigTwoCard("AS")).toBeLessThan(bigTwo.bigTwoCard("2D"));
    const five = { straight: ["3D", "4C", "5H", "6S", "7D"], flush: ["3D", "5D", "8D", "JD", "KD"], fullHouse: ["3D", "3C", "3H", "4S", "4D"], fourKind: ["3D", "3C", "3H", "3S", "4D"], straightFlush: ["3D", "4D", "5D", "6D", "7D"] };
    const order = ["straight", "flush", "fullHouse", "fourKind", "straightFlush"];
    for (const kind of order) expect(value(five[kind]).kind).toBe(kind);
    for (let at = 1; at < order.length; at += 1) expect(bigTwo.bigTwoBeats(value(five[order[at]]), value(five[order[at - 1]]))).toBe(true);
    expect(value(["TD", "JC", "QH", "KS", "AD"]).kind).toBe("straight");
    expect(value(["JC", "QH", "KS", "AD", "2D"])).toBeNull();
    expect(value(["AD", "2C", "3H", "4S", "5D"])).toBeNull();
    expect(value(["3D", "3C", "4H", "4S"])).toBeNull();
    expect(bigTwo.bigTwoBeats(value(["4D"]), value(["3S", "3H"]))).toBe(false);
    expect([1, 9, 10, 12, 13, 17].map(bigTwo.bigTwoCharge)).toEqual([1, 9, 20, 24, 39, 51]);
    const three = newGame("bigTwo", { players: ["a", "b", "c"], seed: 1 });
    expect(three.hands.map((hand) => hand.length).sort()).toEqual([17, 17, 18]);
    expect(three.hands.find((hand) => hand.length === 18)).toContain("3D");
  });

  it("President: the order, the titles, the exchange and the score", () => {
    expect(president.presidentRank("2S")).toBeGreaterThan(president.presidentRank("AS"));
    expect(president.presidentRank("3S")).toBeLessThan(president.presidentRank("4D"));
    expect(president.presidentRank("9S")).toBe(president.presidentRank("9D"));
    expect([3, 4, 8].map(president.presidentSwapCount)).toEqual([1, 2, 2]);
    expect([0, 1, 2, 3, 4].map((seat) => president.presidentTitle([0, 1, 2, 3, 4], seat))).toEqual(["president", "vicePresident", "citizen", "viceBeggar", "beggar"]);
    const first = newGame("president", { players: ["a", "b", "c", "d"], seed: 1 });
    expect(first.hands[first.toPlay]).toContain("3C");
    const played = playComputers("president", newGame("president", { players: ["a", "b", "c", "d"], seed: 1, computers: [true, true, true, true] })).game;
    expect(played.rounds).toHaveLength(3);
    const points = [0, 0, 0, 0];
    for (const order of played.rounds) order.forEach((seat, place) => (points[seat] += 3 - place));
    expect(played.scores).toEqual(points);
  });

  it("Gin Rummy: deadwood, the knock and the bonuses", () => {
    expect([ginRummy.KNOCK_MOST, ginRummy.GIN_BONUS, ginRummy.UNDERCUT_BONUS]).toEqual([10, 25, 25]);
    expect(["AS", "KH", "QD", "JC", "7D"].map(ginRummy.deadwoodValue)).toEqual([1, 10, 10, 10, 7]);
    expect(ginRummy.isMeld(["AS", "2S", "3S"])).toBe(true);
    expect(ginRummy.isMeld(["QS", "KS", "AS"])).toBe(false);
    expect(ginRummy.isMeld(["7S", "7H", "7D"])).toBe(true);
    expect(ginRummy.isMeld(["7S", "7H"])).toBe(false);
    const dealt = newGame("ginRummy", { players: ["a", "b"], seed: 1 });
    expect(dealt.hands.map((hand) => hand.length)).toEqual([10, 10]);
    expect(dealt.discard).toHaveLength(1);
    expect(dealt.stock).toHaveLength(31);
  });
});

describe("the version", () => {
  it("is package.json's, and the changelog has it", () => {
    expect(VERSION).toBe(pkg.version);
    expect(readFileSync("CHANGELOG.md", "utf8")).toContain(`## [${VERSION}]`);
    expect(readme).toContain(`"generator": "toranpu ${VERSION}"`);
  });
});

describe("package.json", () => {
  // The games played alone, each an entry of its own beside the table games: no seats, no computer players, a solver.
  const SOLITAIRES = ["klondike", "freecell", "spider"];
  // An entry point is a game's key in kebab case, as an address is written: ohHell is oh-hell.
  const entryOf = (kind) => kind.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

  it("names built files directly, and has no dependencies", () => {
    const pointed = [pkg.main, pkg.module, pkg.types, ...Object.values(pkg.bin), ...Object.values(pkg.exports).flatMap((entry) => Object.values(entry))];
    for (const file of pointed) expect(/^\.?\/?(dist|bin)\//.test(file), file).toBe(true);
    expect(pkg.publishConfig.exports).toBeUndefined();
    expect(pkg.dependencies).toBeUndefined();
    expect(Object.keys(pkg.exports).filter((key) => !["." , "./deck", "./react"].includes(key)).map((key) => key.slice(2))).toEqual([...CARD_GAME_LIST.map(entryOf), ...SOLITAIRES]);
  });

  it("has keywords that are many, lower case and not repeated, and a description that fits", () => {
    expect(pkg.keywords.length).toBeGreaterThan(40);
    expect(new Set(pkg.keywords).size).toBe(pkg.keywords.length);
    for (const word of pkg.keywords) expect(word).toBe(word.toLowerCase());
    expect(pkg.description.length).toBeGreaterThan(200);
    expect(pkg.description.length).toBeLessThanOrEqual(350);
    for (const kind of CARD_GAME_LIST) expect(pkg.description).toContain(gameName(kind));
  });
});

describe("docs/strings-ja.md", () => {
  const escape = (text) => text.replaceAll("|", "\\|").replaceAll("\n", "<br>");
  const made = [
    "# Toranpu's words, in English and Japanese",
    "",
    "Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.",
    "",
    "**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please",
    "open a *Fix a translation* issue with the string's name. `{n}` and the other braces are filled in when shown.",
    "",
    "Names that begin `game` and `says` are the games; `suit`, `rank` and `cardName` are the cards; `offer`, `did` and",
    "`hid` are a move in words (on a button, in a record, and as the rest of the table saw it); `record` is a record of",
    "a game; `cli` is the command line; `page` is the demo.",
    "",
    "| Name | English | Japanese |",
    "| --- | --- | --- |",
    ...Object.keys(STRINGS.en).filter((key) => key !== "cliUsage").map((key) => `| \`${key}\` | ${escape(STRINGS.en[key])} | ${escape(STRINGS.ja[key])} |`),
    "",
    "## The command line's help",
    "",
    "`cliUsage`, in English:",
    "",
    "```",
    STRINGS.en.cliUsage.trimEnd(),
    "```",
    "",
    "and in Japanese:",
    "",
    "```",
    STRINGS.ja.cliUsage.trimEnd(),
    "```",
    "",
  ].join("\n");

  it("is what the source makes: run `pnpm docs:make` after changing a string", () => {
    if (process.env.UPDATE_DOCS === "1") writeFileSync("docs/strings-ja.md", made);
    expect(readFileSync("docs/strings-ja.md", "utf8")).toBe(made);
  });
});

describe("the family's look", () => {
  const css = readFileSync("demo/family.css", "utf8");
  const FAMILY_CSS = "c1e392564a7fd94d0bb5cfaefb6d4fedfd147fc3e27f3a7afd8d8dac8c94a227";
  const FAMILY_TEMPLATE = "908afa0484638b817aa8799fdbe02c51af6d310603a5c27793b78fd4b2207b2e";

  it("demo/family.css and scripts/family-template.mjs are the family's files, byte for byte: never edit them here", () => {
    const [first, ...rest] = css.split("\n");
    const hash = createHash("sha256").update(rest.join("\n")).digest("hex");
    expect(first).toBe(`/* sha256 of every line after this one: ${hash} */`);
    expect(hash).toBe(FAMILY_CSS);
    expect(createHash("sha256").update(readFileSync("scripts/family-template.mjs")).digest("hex")).toBe(FAMILY_TEMPLATE);
  });

  it("the site script uses the family's header and footer, and its own stylesheet after the family's", () => {
    const site = readFileSync("scripts/site.mjs", "utf8");
    for (const part of ["familyHead(", "familyHeader(", "familyUnreviewed(", "familyFooter(", "FAMILY_SCRIPT"]) expect(site).toContain(part);
    expect(site.indexOf('href="family.css"')).toBeLessThan(site.indexOf('href="site.css"'));
  });

  it("the README's theming table gives the stylesheets' own values", () => {
    const own = readFileSync("demo/site.css", "utf8");
    const light = css.slice(css.indexOf(":root {"), css.indexOf("@media (prefers-color-scheme: dark)"));
    const dark = css.slice(css.indexOf("@media (prefers-color-scheme: dark)"), css.indexOf(':root[data-theme="dark"]'));
    const value = (block, name) => new RegExp(`${name}: ([^;]+);`).exec(block)?.[1];
    let seen = 0;
    for (const line of readme.slice(readme.indexOf("| Property | What it colours")).split("\n").slice(2)) {
      if (!line.startsWith("|")) break;
      const [names, , lightCell, darkCell] = line.split("|").slice(1, -1).map((text) => text.trim());
      const properties = [...names.matchAll(/`(--[\w-]+)`/g)].map((m) => m[1]);
      const lights = [...lightCell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      const darks = [...darkCell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
      properties.forEach((property, i) => {
        seen += 1;
        const mine = value(own, property) !== undefined;
        expect(mine || css.includes(`${property}:`), property).toBe(true);
        if (lights[i] !== undefined) expect(value(mine ? own : light, property), property).toBe(lights[i]);
        if (darks[i] !== undefined) expect(value(dark, property), `${property} in the dark`).toBe(darks[i]);
      });
    }
    expect(seen).toBeGreaterThan(18);
  });
});
