// Runs the built command line as a person would: as a child process, on
// whatever system this is. `pnpm test:cli` builds first. The rules of the
// command line are tested as plain data in src/cli.test.ts; this is the part
// only a real process can show: the exit code, the two streams, standard
// input, the environment.
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const bin = join(root, "bin", "toranpu.mjs");
const { version } = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
// An environment with no language of its own, so each case says what it means.
const bare = { ...process.env, LC_ALL: "", LC_MESSAGES: "", LANG: "en_US.UTF-8", NO_COLOR: "" };

let failed = 0;
function check(what, args, want, { input, env } = {}) {
  const ran = spawnSync(process.execPath, [bin, ...args], { input, encoding: "utf8", env: { ...bare, ...env } });
  const got = { code: ran.status, out: ran.stdout, err: ran.stderr };
  const problems = [];
  if (want.code !== undefined && got.code !== want.code) problems.push(`exit code ${got.code}, wanted ${want.code}`);
  for (const stream of ["out", "err"]) {
    const wanted = want[stream];
    if (wanted === undefined) continue;
    const ok = wanted instanceof RegExp ? wanted.test(got[stream]) : typeof wanted === "function" ? wanted(got[stream]) : got[stream] === wanted;
    if (!ok) problems.push(`${stream} was ${JSON.stringify(got[stream])}, wanted ${wanted instanceof RegExp ? wanted : JSON.stringify(wanted)}`);
  }
  if (problems.length > 0) failed += 1;
  console.log(`${problems.length === 0 ? "ok  " : "FAIL"} ${what}${problems.map((p) => `\n       ${p}`).join("")}`);
  return got;
}

check("the version", ["--version"], { code: 0, out: `${version}\n`, err: "" });
check("help", ["--help"], { code: 0, out: /^Usage: toranpu/, err: "" });
check("nothing asked for is the help", [], { code: 0, out: /^Usage: toranpu/, err: "" });
check("the games", ["games"], { code: 0, out: /^hearts {7}Hearts \(3–4 players; 50 \/ 100\)/, err: "" });
check("a seeded deal", ["deal", "--hands", "2", "--each", "2", "--seed", "42"], { code: 0, out: /^Seat 1: 3♣ 2♥\nSeat 2: 9♣ K♥\nLeft: /, err: "" });
check("a game's first deal", ["deal", "euchre", "--seed", "42"], { code: 0, out: "Seat 1: 9♥ 10♥ Q♥ J♣ K♣\nSeat 2: 9♠ K♠ A♠ 9♣ 10♣\nSeat 3: Q♠ K♥ A♥ J♦ Q♦\nSeat 4: J♠ A♣ 10♦ K♦ A♦\nTurned up: 10♠\n", err: "" });
check("a whole game, played by computers", ["play", "euchre", "--seed", "42"], { code: 0, out: "Euchre for 4, seed 42: 330 moves. Won by Seat 1, Seat 3.\nScores: 11 6\n", err: "" });
check("no seed: one is drawn and named on standard error", ["deal"], { code: 0, out: /^Seat 1: /, err: /^toranpu: seed \d+ \(pass --seed \d+ to repeat this\)\n$/ });
const saved = check("a game as JSON", ["play", "cribbage", "--seed", "7", "--json"], { code: 0, out: /^\{\n {2}"format": 1,/, err: "" });
try {
  const data = JSON.parse(saved.out);
  if (data.game !== "cribbage" || data.seed !== 7 || data.over !== true || data.moves.length !== 90) throw new Error("not the game asked for");
  console.log("ok   the JSON parses, and is the game asked for");
} catch (error) {
  failed += 1;
  console.log(`FAIL the JSON parses: ${error.message}`);
}
check("a saved game on standard input is checked", ["check", "--stdin"], { code: 0, out: "Cribbage for 2, seed 7, 90 moves. Over: won by Seat 1.\n", err: "" }, { input: saved.out });
check("a saved game with Windows line endings", ["check", "--stdin"], { code: 0, out: "Cribbage for 2, seed 7, 90 moves. Over: won by Seat 1.\n", err: "" }, { input: saved.out.replaceAll("\n", "\r\n") });
const file = join(mkdtempSync(join(tmpdir(), "toranpu-cli-")), "saved.json");
writeFileSync(file, saved.out);
check("a saved game in a file is checked", ["check", file], { code: 0, out: "Cribbage for 2, seed 7, 90 moves. Over: won by Seat 1.\n", err: "" });
check("a file that is not there is exit code 1", ["check", `${file}.missing`], { code: 1, out: "", err: /there is no saved game to check/ });
check("a game that has been changed is exit code 1", ["check", "--stdin"], { code: 1, out: "", err: "toranpu: that is not a saved game: the rules cannot play it out\n" }, { input: saved.out.replace('"seed": 7', '"seed": 8') });
check("empty standard input is exit code 1", ["check", "--stdin"], { code: 1, out: "" }, { input: "" });
check("a game nobody has heard of is exit code 1", ["play", "poker", "--seed", "1"], { code: 1, out: "", err: /no game is called “poker”/ });
check("a wrong option is exit code 2", ["--bogus"], { code: 2, out: "", err: /unknown option --bogus/ });
check("a wrong command is exit code 2", ["shuffle"], { code: 2, out: "", err: /is not a command/ });
check("CSV, ended CRLF", ["deal", "--hands", "2", "--each", "1", "--seed", "42", "--csv"], { code: 0, out: /^hand,place,card\r\n1,1,3C\r\n2,1,9C\r\nrest,1,2H\r\n/, err: "" });
check("every move in words", ["play", "cribbage", "--seed", "7", "--text"], { code: 0, out: /^Cribbage for 2, seed 7: Seat 1, Seat 2\n1\. Seat 2: lays 9♠ K♥ in the crib\n/, err: "" });
check("Japanese by flag", ["play", "president", "--seed", "1", "--lang", "ja"], { code: 0, out: /^大富豪（4人）、シード 1: \d+手。勝者は席\d/ });
check("a game by its Japanese name", ["deal", "大富豪", "--seed", "1"], { code: 0, out: /^Seat 1: / });
check("Japanese by LANG", ["--help"], { code: 0, out: /^使い方: toranpu/ }, { env: { LANG: "ja_JP.UTF-8" } });
check("Japanese by LC_ALL over LANG", ["--bogus"], { code: 2, err: /^toranpu: 不明なオプションです: --bogus\n/ }, { env: { LC_ALL: "ja_JP.UTF-8", LANG: "en_US.UTF-8" } });
check("English by flag over LANG", ["--help", "--lang", "en"], { code: 0, out: /^Usage: toranpu/ }, { env: { LANG: "ja_JP.UTF-8" } });
const plain = (text) => !text.includes(String.fromCharCode(27));
check("no colour when piped", ["deal", "--seed", "1"], { code: 0, out: plain });
check("NO_COLOR is honoured", ["deal", "--seed", "1"], { code: 0, out: plain }, { env: { NO_COLOR: "1" } });

if (failed > 0) {
  console.log(`${failed} failed`);
  process.exit(1);
}
console.log("the command line does what it says, on", process.platform, process.version);
