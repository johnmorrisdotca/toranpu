import { CARD_GAME_RULES } from "./games/cardGameRules.ts";
import { CARD_GAME_LIST } from "./games/cardGames.constants.ts";
import type { CardGameKind } from "./games/cardGames.constants.ts";
import type { KeptCardGame } from "./games/cardGameCodec.ts";
import { rulesFor } from "./play.ts";
import type { GameOf, MoveOf } from "./play.ts";
import { STRINGS, fillIn, type Language } from "./strings.ts";
import { VERSION } from "./version.ts";
import { gameName, moveText, namesList } from "./words.ts";

/**
 * A GAME WRITTEN OUT AND READ BACK, whichever of the ten it is: as JSON with
 * a format number, as the short code each game's own `encode` writes, as a
 * record in words for a person, and as CSV for a spreadsheet.
 *
 * What is written is never a hand: it is the table (the game, how long it
 * lasts, the names, which seats a computer plays), the seed and every move.
 * What is read is never trusted: the game is started from its table and seed
 * and every move is played through the rules again, so the answer is exactly
 * the game those moves make, or nothing.
 */

/** The shape of the JSON this package writes. It goes up only when a reader of the old shape would be wrong about the new one. */
export const SAVE_FORMAT = 1;

/** A game as `toJSON` writes it. */
export type SavedGame<K extends CardGameKind = CardGameKind> = {
  /** The shape of this object: `SAVE_FORMAT`. */
  format: typeof SAVE_FORMAT;
  /** What wrote it, such as `"toranpu 1.2.0"`. For people; nothing reads it back. */
  generator: string;
  /** Which game: `"hearts"`, `"ginRummy"`… */
  game: K;
  /** How long the game lasts, in its own terms (`CARD_GAME_TABLES`). */
  size: number;
  /** One name a seat. */
  players: string[];
  /** One a seat: true where a computer plays. */
  computers: boolean[];
  /** The seed every deal is shuffled from. */
  seed: number;
  /** Every move so far, in order. */
  moves: MoveOf<K>[];
};

/** A game read back: which game it is, and the game itself. */
export type ReadGame = { [K in CardGameKind]: { kind: K; game: GameOf<K> } }[CardGameKind];

/** One move of a record: which seat made it, and the move. */
export type RecordedMove<K extends CardGameKind = CardGameKind> = { seat: number; move: MoveOf<K> };

const kept = <K extends CardGameKind>(game: GameOf<K>) => game as unknown as KeptCardGame<MoveOf<K>>;

/** A game as the object `toJSON` writes: its table, its seed and its moves. */
export function savedGame<K extends CardGameKind>(kind: K, game: GameOf<K>): SavedGame<K> {
  const { size, players, computers, seed, moves } = kept(game);
  return { format: SAVE_FORMAT, generator: `toranpu ${VERSION}`, game: kind, size, players: [...players], computers: [...computers], seed, moves: [...moves] };
}

/** A game as JSON, two spaces deep, with the format's number first. `fromJSON` reads it back. */
export function toJSON<K extends CardGameKind>(kind: K, game: GameOf<K>): string {
  return `${JSON.stringify(savedGame(kind, game), null, 2)}\n`;
}

/** A game as its code: the one line its own rules' `encode` writes. Shorter than the JSON, and what Itsutsu keeps. */
export function toCode<K extends CardGameKind>(kind: K, game: GameOf<K>): string {
  return rulesFor(kind).encode(game);
}

function isKind(value: unknown): value is CardGameKind {
  return typeof value === "string" && (CARD_GAME_LIST as readonly string[]).includes(value);
}

/**
 * A game from text that `toJSON` or `toCode` wrote, whichever game it is.
 * Nothing in it is trusted: every move is played through the rules again, and
 * a move the rules refuse means the text is not a game. Null for text that is
 * not JSON, names no game, is of a later format than this version reads, or
 * cannot be played out.
 */
export function fromJSON(text: string): ReadGame | null {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }
  if (typeof data !== "object" || data === null || Array.isArray(data)) return null;
  const given = data as Record<string, unknown>;
  // The code a game's own `encode` writes names its game as `g` and its version as `v`.
  if ("g" in given && !("format" in given)) {
    if (!isKind(given.g)) return null;
    const game = CARD_GAME_RULES[given.g].decode(text);
    return game === null ? null : ({ kind: given.g, game } as ReadGame);
  }
  const { format, game: kind, size, players, computers, seed, moves } = given;
  if (typeof format !== "number" || !Number.isInteger(format) || format < 1 || format > SAVE_FORMAT || !isKind(kind)) return null;
  const game = CARD_GAME_RULES[kind].decode(JSON.stringify({ v: 1, g: kind, size, players, computers, seed, moves }));
  return game === null ? null : ({ kind, game } as ReadGame);
}

/** A game from its code or its JSON: the same as `fromJSON`, under the name that pairs with `toCode`. */
export const fromCode = fromJSON;

/**
 * Every move of a game with the seat that made it, in order, found by playing
 * the game through again from its seed. Null if the moves do not play out,
 * which a game the rules made never does.
 */
export function recordOf<K extends CardGameKind>(kind: K, game: GameOf<K>): RecordedMove<K>[] | null {
  const rules = rulesFor(kind);
  const { size, players, computers, seed, moves } = kept(game);
  let now = rules.start(size, players, undefined, seed, computers);
  const record: RecordedMove<K>[] = [];
  for (const move of moves) {
    if (now === null) return null;
    const seat = rules.toPlay(now);
    if (seat === null) return null;
    record.push({ seat, move });
    now = rules.play(now, move);
  }
  return now === null ? null : record;
}

/**
 * A game as a record a person can read: a heading, a numbered line a move
 * with who made it, and how it stands. In English unless said.
 *
 * It names every card, the ones passed face down too. It is a record for
 * afterwards, not something to show a player while the game is on.
 */
export function toText<K extends CardGameKind>(kind: K, game: GameOf<K>, language: Language = "en"): string {
  const rules = rulesFor(kind);
  const t = STRINGS[language];
  const { players, seed } = kept(game);
  const lines = [fillIn(t.recordHead, { game: gameName(kind, language), n: players.length, seed, players: namesList(players, language) })];
  (recordOf(kind, game) ?? []).forEach(({ seat, move }, at) => lines.push(`${at + 1}. ${players[seat]}: ${moveText(kind, move, { language, form: "did", players })}`));
  const seat = rules.toPlay(game);
  lines.push(rules.over(game) || seat === null ? fillIn(t.recordOver, { players: namesList(rules.winners(game).map((winner) => players[winner] as string), language) }) : fillIn(t.recordGoing, { player: players[seat] as string }));
  return `${lines.join("\n")}\n`;
}

/** The columns of the CSV, in order. */
export const CSV_COLUMNS = ["move", "seat", "player", "action", "cards", "detail", "text"] as const;

/** A field of CSV: quoted when it holds a comma, a quote or a line break. */
function field(text: string): string {
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/**
 * A game's moves as CSV for a spreadsheet: a header, then a row a move, with
 * its number from 1, the seat from 1 and its player, the kind of move
 * (`play`, `bid`, `pass`…), the cards it names as two-letter ids with spaces
 * between, the move itself as JSON, and the move in English. Lines end CRLF,
 * as RFC 4180 has it. It is for reading, and is not read back.
 */
export function toCSV<K extends CardGameKind>(kind: K, game: GameOf<K>): string {
  const { players } = kept(game);
  const rows = [CSV_COLUMNS.join(",")];
  (recordOf(kind, game) ?? []).forEach(({ seat, move }, at) => {
    const given = move as Record<string, unknown>;
    const action = ["play", "pass", "bid", "crib", "give", "draw", "discard", "knock", "order", "call", "ask"].find((key) => key in given) ?? "";
    const cards = Object.values(given).flatMap((value) => (Array.isArray(value) ? value : [value])).filter((value): value is string => typeof value === "string" && /^[A2-9TJQK][SHDC]$/.test(value));
    rows.push([String(at + 1), String(seat + 1), field(players[seat] as string), action, cards.join(" "), field(JSON.stringify(move)), field(moveText(kind, move, { form: "did", players }))].join(","));
  });
  return `${rows.join("\r\n")}\r\n`;
}
