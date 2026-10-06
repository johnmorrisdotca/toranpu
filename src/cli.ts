import { DECK_SIZE } from "./cards/cards.constants.ts";
import { cardId, shuffledDeck } from "./cards/deck.ts";
import { CARD_GAME_LIST, CARD_GAME_TABLES } from "./games/card-games.constants.ts";
import type { CardGameKind } from "./games/card-games.constants.ts";
import type { CardId } from "./games/card-games.types.ts";
import { isCard } from "./games/cards.ts";
import { newGame, playComputers, randomSeed, rulesFor } from "./play.ts";
import { SAVE_FORMAT, fromJSON, savedGame, toCSV, toText } from "./save.ts";
import { STRINGS, fillIn, type Language } from "./strings.ts";
import { VERSION } from "./version.ts";
import { cardsShort, gameName, gameSays, namesList } from "./words.ts";

/**
 * The command line, as a pure function: arguments and surroundings in, what
 * to print and the exit code out. `bin/toranpu.mjs` is the few lines that
 * hand it the real process. Nothing here touches a file, a terminal or the
 * network, so every line of it is tested as plain data.
 */

/** What the command line is run in. All of it is optional. */
export type CliSurroundings = {
  /** The environment, for the language (`LC_ALL`, `LC_MESSAGES`, `LANG`) and `NO_COLOR`. */
  env?: Record<string, string | undefined>;
  /** Standard input, when `--stdin` asks for it: a saved game. */
  stdin?: string;
  /** Reads a file named on the command line, or gives null when it cannot be read. `check` needs it; nothing else does. */
  readFile?: (path: string) => string | null;
  /** Whether the output is a terminal that shows colour. `NO_COLOR` and `--no-color` still turn it off. */
  colour?: boolean;
  /** The system's language where the environment names none: what `Intl` says, on Windows. */
  locale?: string;
  /** Where a seed comes from when none is given: a function that returns a whole number from 1. `randomSeed` unless given. */
  seed?: () => number;
};

/** What the command line came to. */
export type CliResult = {
  /** 0 when all went well, 1 when what was asked for could not be done, 2 when the command itself was wrong. */
  code: 0 | 1 | 2;
  /** For standard output. */
  out: string;
  /** For standard error. */
  err: string;
};

/** The language the command line speaks: `--lang`, or the environment's, or the system's; Japanese for `ja…`, English for anything else. */
export function cliLanguage(flag: string | undefined, env: Record<string, string | undefined> = {}, locale?: string): Language {
  const named = [flag, env.LC_ALL, env.LC_MESSAGES, env.LANG].find((value) => value !== undefined && value !== "" && value !== "C" && value !== "POSIX" && !value.startsWith("C."));
  return (named ?? locale ?? "en").toLowerCase().startsWith("ja") ? "ja" : "en";
}

const FLAGS_WITH_VALUES: Record<string, string> = { "-s": "seed", "--seed": "seed", "-p": "players", "--players": "players", "--size": "size", "-n": "hands", "--hands": "hands", "-e": "each", "--each": "each", "--lang": "lang" };
const FLAGS: Record<string, string> = { "--text": "text", "-j": "json", "--json": "json", "--csv": "csv", "--stdin": "stdin", "--no-color": "noColour", "--no-colour": "noColour", "-h": "help", "--help": "help", "-v": "version", "--version": "version" };
const SEED_MOST = 2_147_483_647;

type Asked = { values: Record<string, string>; flags: Set<string>; words: string[]; wrong: { message: "cliUnknown" | "cliNeeds"; part: string } | null };

/** The arguments sorted into options and words: the command, and what it is given. */
function sortArguments(args: readonly string[]): Asked {
  const asked: Asked = { values: {}, flags: new Set(), words: [], wrong: null };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i] as string;
    const [name, inline] = arg.startsWith("--") && arg.includes("=") ? [arg.slice(0, arg.indexOf("=")), arg.slice(arg.indexOf("=") + 1)] : [arg, undefined];
    if (name in FLAGS_WITH_VALUES) {
      const value = inline ?? args[++i];
      if (value === undefined) {
        asked.wrong ??= { message: "cliNeeds", part: name };
        break;
      }
      asked.values[FLAGS_WITH_VALUES[name] as string] = value;
    } else if (name in FLAGS && inline === undefined) asked.flags.add(FLAGS[name] as string);
    // The first wrong option is the one reported; the rest are still read, so that the report comes in the language asked for.
    else if (arg.startsWith("-") && arg !== "-") asked.wrong ??= { message: "cliUnknown", part: arg };
    else asked.words.push(arg);
  }
  return asked;
}

const whole = (text: string | undefined, least: number, most: number): number | null => (text !== undefined && /^\d{1,10}$/.test(text) && Number(text) >= least && Number(text) <= most ? Number(text) : null);

/** A game by what a person might type: its key in any case, or its name in English or Japanese, with or without spaces and hyphens. */
function findGame(text: string): CardGameKind | null {
  const plain = (value: string) => value.toLowerCase().replace(/[\s\-_・]/g, "");
  return CARD_GAME_LIST.find((kind) => [kind, gameName(kind, "en"), gameName(kind, "ja")].some((name) => plain(name) === plain(text))) ?? null;
}

/** A field of CSV: quoted when it holds a comma, a quote or a line break. */
function field(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** How long a game may last, as its table offers it: "50 or 100". */
function sizesText(kind: CardGameKind): string {
  return CARD_GAME_TABLES[kind].sizes.join(" / ");
}

/**
 * Run the command line. See `toranpu --help` for what it takes. Every deal
 * comes from the seed, so the same command prints the same cards on every
 * machine.
 */
export function runCli(args: readonly string[], around: CliSurroundings = {}): CliResult {
  const asked = sortArguments(args);
  const env = around.env ?? {};
  const lang = asked.values.lang;
  const language = cliLanguage(lang, env, around.locale);
  const t = STRINGS[language];
  const wrong = (message: string): CliResult => ({ code: 2, out: "", err: `toranpu: ${message}\n${t.cliTryHelp}\n` });
  if (asked.wrong !== null) return wrong(fillIn(t[asked.wrong.message], { part: asked.wrong.part }));
  if (lang !== undefined && lang !== "en" && lang !== "ja") return wrong(t.cliLangBad);
  const [command, ...rest] = asked.words;
  if (asked.flags.has("help") || (command === undefined && !asked.flags.has("version"))) return { code: 0, out: t.cliUsage, err: "" };
  if (asked.flags.has("version")) return { code: 0, out: `${VERSION}\n`, err: "" };
  const json = asked.flags.has("json");
  const csv = asked.flags.has("csv");
  if (json && csv) return wrong(t.cliBoth);
  const colour = around.colour === true && !asked.flags.has("noColour") && (env.NO_COLOR === undefined || env.NO_COLOR === "");
  const bold = (text: string) => (colour ? `\u001b[1m${text}\u001b[0m` : text);
  const head = { format: SAVE_FORMAT, generator: `toranpu ${VERSION}` };
  const print = (body: Record<string, unknown>) => `${JSON.stringify({ ...head, ...body }, null, 2)}\n`;
  const seatNames = (count: number) => Array.from({ length: count }, (_, seat) => fillIn(t.seatName, { n: seat + 1 }));

  if (command === "games") {
    if (json) return { code: 0, out: print({ games: CARD_GAME_LIST.map((kind) => ({ game: kind, name: gameName(kind, "en"), nameJa: gameName(kind, "ja"), ...CARD_GAME_TABLES[kind], says: gameSays(kind, "en"), saysJa: gameSays(kind, "ja") })) }), err: "" };
    if (csv) return { code: 0, out: `game,name,nameJa,fewestPlayers,mostPlayers,defaultPlayers,sizes,defaultSize\r\n${CARD_GAME_LIST.map((kind) => { const table = CARD_GAME_TABLES[kind]; return `${kind},${gameName(kind, "en")},${gameName(kind, "ja")},${table.fewestPlayers},${table.mostPlayers},${table.defaultPlayers},${table.sizes.join(" ")},${table.defaultSize}\r\n`; }).join("")}`, err: "" };
    const wide = Math.max(...CARD_GAME_LIST.map((kind) => kind.length));
    return {
      code: 0,
      out: CARD_GAME_LIST.map((kind) => {
        const table = CARD_GAME_TABLES[kind];
        const players = table.fewestPlayers === table.mostPlayers ? String(table.fewestPlayers) : `${table.fewestPlayers}–${table.mostPlayers}`;
        return `${kind.padEnd(wide)}  ${fillIn(t.cliGameLine, { name: bold(gameName(kind, language)), players, sizes: sizesText(kind), says: gameSays(kind, language) })}\n`;
      }).join(""),
      err: "",
    };
  }

  if (command === "check") {
    const text = asked.flags.has("stdin") ? (around.stdin ?? "") : rest[0] !== undefined ? (around.readFile?.(rest[0]) ?? null) : null;
    if (text === null || text.trim() === "") return { code: rest[0] === undefined && !asked.flags.has("stdin") ? 2 : 1, out: "", err: `toranpu: ${t.cliNoSave}\n${rest[0] === undefined && !asked.flags.has("stdin") ? `${t.cliTryHelp}\n` : ""}` };
    const read = fromJSON(text);
    if (read === null) return { code: 1, out: json ? print({ ok: false }) : "", err: `toranpu: ${t.cliNotSaved}\n` };
    const rules = rulesFor(read.kind);
    const saved = savedGame(read.kind, read.game);
    const over = rules.over(read.game);
    const toPlay = rules.toPlay(read.game);
    const winners = rules.winners(read.game);
    if (json) return { code: 0, out: print({ ok: true, game: saved.game, size: saved.size, players: saved.players, computers: saved.computers, seed: saved.seed, moves: saved.moves.length, over, toPlay, winners }), err: "" };
    if (csv) return { code: 0, out: toCSV(read.kind, read.game), err: "" };
    const said = { game: gameName(read.kind, language), n: saved.players.length, seed: saved.seed, moves: saved.moves.length };
    const line = over || toPlay === null ? fillIn(t.cliSavedOver, { ...said, players: namesList(winners.map((seat) => saved.players[seat] as string), language) }) : fillIn(t.cliSavedGoing, { ...said, player: saved.players[toPlay] as string });
    return { code: 0, out: `${line}\n`, err: "" };
  }

  if (command !== "deal" && command !== "play") return wrong(fillIn(t.cliNoCommand, { part: command ?? "" }));

  // The seed: named, or drawn and said.
  let err = "";
  let seed: number;
  if (asked.values.seed !== undefined) {
    const read = whole(asked.values.seed, 1, SEED_MOST);
    if (read === null) return wrong(t.cliSeedBad);
    seed = read;
  } else {
    seed = (around.seed ?? randomSeed)();
    if (!json) err = `toranpu: ${fillIn(t.cliFresh, { seed })}\n`;
  }

  // The deck on its own: hands dealt one card at a time round the table.
  if (command === "deal" && rest[0] === undefined) {
    const hands = asked.values.hands === undefined ? 4 : whole(asked.values.hands, 1, DECK_SIZE);
    const each = asked.values.each === undefined ? (hands === null ? null : Math.floor(DECK_SIZE / hands)) : whole(asked.values.each, 0, DECK_SIZE);
    if (hands === null || each === null || hands * each > DECK_SIZE) return wrong(fillIn(t.cliHandsBad, { hands: asked.values.hands ?? 4, each: asked.values.each ?? "?" }));
    const deck = shuffledDeck(seed).map(cardId);
    const dealt: CardId[][] = Array.from({ length: hands }, () => []);
    for (let at = 0; at < hands * each; at += 1) (dealt[at % hands] as CardId[]).push(deck[at] as CardId);
    const left = deck.slice(hands * each);
    if (json) return { code: 0, out: print({ seed, hands: dealt, rest: left }), err };
    if (csv) return { code: 0, out: `hand,place,card\r\n${dealt.flatMap((hand, seat) => hand.map((card, at) => `${seat + 1},${at + 1},${card}\r\n`)).join("")}${left.map((card, at) => `rest,${at + 1},${card}\r\n`).join("")}`, err };
    const names = seatNames(hands);
    return { code: 0, out: `${dealt.map((hand, seat) => `${fillIn(t.cliHand, { name: bold(names[seat] as string), cards: cardsShort(hand) })}\n`).join("")}${left.length > 0 ? `${fillIn(t.cliRest, { cards: cardsShort(left) })}\n` : ""}`, err };
  }

  // A game: its table, then its first deal or the whole of it.
  const kind = findGame(rest[0] ?? "");
  if (kind === null) return { code: 1, out: "", err: `toranpu: ${fillIn(t.cliNoGame, { part: rest[0] ?? "" })}\n` };
  const table = CARD_GAME_TABLES[kind];
  const count = asked.values.players === undefined ? table.defaultPlayers : whole(asked.values.players, table.fewestPlayers, table.mostPlayers);
  if (count === null) return wrong(fillIn(t.cliPlayersBad, { game: gameName(kind, language), fewest: table.fewestPlayers, most: table.mostPlayers }));
  const size = asked.values.size === undefined ? table.defaultSize : whole(asked.values.size, 0, SEED_MOST);
  if (size === null || !table.sizes.includes(size)) return wrong(fillIn(t.cliSizeBad, { game: gameName(kind, language), sizes: sizesText(kind) }));
  const players = seatNames(count);
  const rules = rulesFor(kind);
  const start = newGame(kind, { players, size, seed, computers: players.map(() => true) });
  if (start === null) return wrong(fillIn(t.cliPlayersBad, { game: gameName(kind, language), fewest: table.fewestPlayers, most: table.mostPlayers }));

  if (command === "deal") {
    const dealt = start as unknown as { hands: CardId[][]; upcard?: unknown; turned?: unknown; discard?: unknown };
    const shown = [dealt.upcard, dealt.turned, Array.isArray(dealt.discard) ? dealt.discard[dealt.discard.length - 1] : undefined].filter(isCard);
    if (json) return { code: 0, out: print({ game: kind, size, seed, players, hands: dealt.hands, ...(shown.length > 0 ? { turned: shown[0] } : {}) }), err };
    if (csv) return { code: 0, out: `hand,player,place,card\r\n${dealt.hands.flatMap((hand, seat) => hand.map((card, at) => `${seat + 1},${field(players[seat] as string)},${at + 1},${card}\r\n`)).join("")}`, err };
    return { code: 0, out: `${dealt.hands.map((hand, seat) => `${fillIn(t.cliHand, { name: bold(players[seat] as string), cards: cardsShort(hand) })}\n`).join("")}${shown.length > 0 ? `${fillIn(t.cliTurned, { cards: cardsShort(shown.slice(0, 1)) })}\n` : ""}`, err };
  }

  const { game } = playComputers(kind, start);
  const winners = rules.winners(game);
  // What each seat finished with: its score, or its penalty, or its books; at War, the cards it holds.
  const held = game as unknown as { scores?: number[]; penalties?: number[]; books?: unknown[][]; hands: unknown[][] };
  const scores = held.scores ?? held.penalties ?? (held.books ?? held.hands).map((each) => each.length);
  if (json) return { code: 0, out: print({ ...savedGame(kind, game), over: rules.over(game), winners, scores }), err };
  if (csv) return { code: 0, out: toCSV(kind, game), err };
  if (asked.flags.has("text")) return { code: 0, out: toText(kind, game, language), err };
  const moves = (game as unknown as { moves: unknown[] }).moves.length;
  return { code: 0, out: `${fillIn(t.cliPlayed, { game: bold(gameName(kind, language)), n: count, seed, moves, players: namesList(winners.map((seat) => players[seat] as string), language) })}\n${fillIn(t.cliScores, { scores: scores.join(" ") })}\n`, err };
}
