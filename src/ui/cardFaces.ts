/**
 * THE FACES OF THE CARDS, drawn as SVG in the same 100 by 140 box as the
 * backs. Plain is the default: big corners, the pips laid out as a real deck
 * lays them, and kings, queens and jacks as their letter in a frame. Four
 * colour is the same with diamonds blue and clubs green, as poker players
 * like them. The English pattern, the traditional deck with drawn kings,
 * queens and jacks, is its own entry point because of its size (see
 * `designs/english.ts`), and is handed in as a design.
 */
import { STRINGS, type Language } from "../strings.ts";
import { cardText } from "../words.ts";
import type { CardDesign } from "./cardFaces.types.ts";
import { CARD_BOX, escapeXml, paint, round, suitPath, svgDataUrl, UNSELECTABLE } from "./svg.ts";
import type { CardSuitLetter } from "./svg.types.ts";

/** The designs drawn here, by name. The English pattern is `ENGLISH_PATTERN` from `@johnmorrisdotca/toranpu/card-faces/english`, or `loadCardDesign("english")`. */
export const CARD_DESIGNS = ["plain", "four-colour", "english"] as const;

/** A design's name. */
export type CardDesignName = (typeof CARD_DESIGNS)[number];

/** The two jokers' ids: the red joker and the black. No game here plays with them; a table of your own may. */
export const JOKERS = ["RJ", "BJ"] as const;

/** How a face is drawn. Every field may be left out. */
export type CardFaceOptions = {
  /** `"plain"` (unless said), `"four-colour"`, or a design handed in, such as `ENGLISH_PATTERN`. */
  design?: "plain" | "four-colour" | CardDesign;
  /** The width to draw at, in pixels; the height is 1.4 times it. Unless said, the drawing fills what holds it. */
  width?: number;
  /** What a screen reader says. Unless said, the card's name in `language`, "queen of spades". An empty string makes it decoration. */
  title?: string;
  /** The language of the card's name, and of a joker's corner word: `"en"` (unless said) or `"ja"`. */
  language?: Language;
};

/** The CSS custom properties a plain or four-colour face drawn into a page takes its colours from. */
export const CARD_FACE_PROPERTIES = { paper: "--toranpu-card", black: "--toranpu-card-ink", red: "--toranpu-card-red", blue: "--toranpu-card-blue", green: "--toranpu-card-green" } as const;

/** The faces' own colours. */
export const CARD_FACE_COLOURS = { paper: "#fffdf8", black: "#1b1b1b", red: "#c2272d", blue: "#1f5fbf", green: "#1f7a3a", edge: "#000" } as const;

const RANK_SHOWN: Record<string, string> = { A: "A", T: "10", J: "J", Q: "Q", K: "K" };
const RED = new Set(["H", "D"]);

/** Whether a text is a card a face can be drawn for: `QS`, `TD`, `RJ`, `BJ`. */
export function isCardFace(text: unknown): text is string {
  return typeof text === "string" && (/^[A2-9TJQK][SHDC]$/.test(text) || (JOKERS as readonly string[]).includes(text));
}

/** The middles of a number card's pips, in the 100 by 140 box, and whether each is drawn upside down. */
export function pipPlaces(count: number): { x: number; y: number; down: boolean }[] {
  const L = 31;
  const M = 50;
  const R = 69;
  const rows = { top: 30, upper: 54, high: 46, middle: 70, low: 94, lower: 86, bottom: 110 };
  const at = (x: number, y: number) => ({ x, y, down: y > 70 });
  const places: Record<number, [number, number][]> = {
    1: [[M, rows.middle]],
    2: [[M, rows.top], [M, rows.bottom]],
    3: [[M, rows.top], [M, rows.middle], [M, rows.bottom]],
    4: [[L, rows.top], [R, rows.top], [L, rows.bottom], [R, rows.bottom]],
    5: [[L, rows.top], [R, rows.top], [M, rows.middle], [L, rows.bottom], [R, rows.bottom]],
    6: [[L, rows.top], [R, rows.top], [L, rows.middle], [R, rows.middle], [L, rows.bottom], [R, rows.bottom]],
    7: [[L, rows.top], [R, rows.top], [M, 50], [L, rows.middle], [R, rows.middle], [L, rows.bottom], [R, rows.bottom]],
    8: [[L, rows.top], [R, rows.top], [M, 50], [L, rows.middle], [R, rows.middle], [M, 90], [L, rows.bottom], [R, rows.bottom]],
    9: [[L, rows.top], [R, rows.top], [L, 57], [R, 57], [M, rows.middle], [L, 83], [R, 83], [L, rows.bottom], [R, rows.bottom]],
    10: [[L, rows.top], [R, rows.top], [M, 43], [L, 57], [R, 57], [L, 83], [R, 83], [M, 97], [L, rows.bottom], [R, rows.bottom]],
  };
  return (places[count] ?? []).map(([x, y]) => at(x, y));
}

const SANS = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** The colour of a suit's ink in a design drawn here, as a paint. */
function suitInk(suit: CardSuitLetter, fourColour: boolean): string {
  if (fourColour && suit === "D") return paint("fill", CARD_FACE_PROPERTIES.blue, undefined, CARD_FACE_COLOURS.blue);
  if (fourColour && suit === "C") return paint("fill", CARD_FACE_PROPERTIES.green, undefined, CARD_FACE_COLOURS.green);
  return RED.has(suit) ? paint("fill", CARD_FACE_PROPERTIES.red, undefined, CARD_FACE_COLOURS.red) : paint("fill", CARD_FACE_PROPERTIES.black, undefined, CARD_FACE_COLOURS.black);
}

/** A corner: the rank over the suit, top left; drawn again turned round, bottom right. */
function corners(rank: string, suit: CardSuitLetter, ink: string): string {
  const shown = RANK_SHOWN[rank] ?? rank;
  const size = shown.length > 1 ? 15 : 18;
  const one = `<text x="11" y="22" text-anchor="middle" font-size="${size}" font-weight="700" font-family="${SANS}"${shown.length > 1 ? ' letter-spacing="-1.2"' : ""}${ink}>${shown}</text>${suitPath(suit, 11, 32, 12, ink)}`;
  return `<g>${one}</g><g transform="rotate(180 50 70)">${one}</g>`;
}

/** The word JOKER, or ジョーカー, down a joker's corner, and again turned round. */
function jokerCorners(language: Language, ink: string): string {
  const letters = [...(language === "ja" ? "ジョーカー" : "JOKER")];
  // Written down the corner, the long-vowel mark stands upright, as it does in vertical Japanese.
  const one = letters
    .map((letter, at) => {
      const y = 17 + at * 10.5;
      const turn = letter === "ー" ? ` transform="rotate(90 10 ${round(y - 3.5)})"` : "";
      return `<text x="10" y="${round(y)}" text-anchor="middle" font-size="10" font-weight="700" font-family="${SANS}"${turn}${ink}>${letter}</text>`;
    })
    .join("");
  return `<g>${one}</g><g transform="rotate(180 50 70)">${one}</g>`;
}

/** A jester's cap, our plain joker's picture: three points with a bell on each, over a band. */
function jesterCap(ink: string, red: boolean): string {
  const band = red ? paint("fill", CARD_FACE_PROPERTIES.red, undefined, CARD_FACE_COLOURS.red) : paint("fill", CARD_FACE_PROPERTIES.black, undefined, CARD_FACE_COLOURS.black);
  // Drawn a little smaller than the box it was drawn in, so that it stays clear of the corner word.
  return [
    `<path d="M28 84C30 70 26 56 16 46C30 48 40 58 44 70C44 54 48 40 50 30C52 40 56 54 56 70C60 58 70 48 84 46C74 56 70 70 72 84Z"${band}/>`,
    `<path d="M50 30C48 40 44 54 44 70C40 58 30 48 16 46C26 56 30 70 28 84H36C38 70 42 60 50 52Z" fill="#fff" fill-opacity=".22"/>`,
    `<rect x="26" y="82" width="48" height="10" rx="3"${ink}/>`,
    `<circle cx="16" cy="46" r="5"${ink}/><circle cx="50" cy="29" r="5"${ink}/><circle cx="84" cy="46" r="5"${ink}/>`,
    `<path d="M38 104h24" stroke-width="2.4" stroke-linecap="round" fill="none"${ink.replace("fill", "stroke")}/>`,
  ]
    .join("")
    .replace(/^/, '<g transform="translate(50 72) scale(.78) translate(-50 -70)">')
    .concat("</g>");
}

/** A court card drawn plain: its letter large in a frame, the suit above and below it. */
function court(rank: string, suit: CardSuitLetter, ink: string): string {
  const crown = rank === "K" ? "M38 40L41 31L46 37L50 28L54 37L59 31L62 40Z" : rank === "Q" ? "M40 40Q42 33 45 37Q47 30 50 34Q53 30 55 37Q58 33 60 40Z" : "M42 40L44 34H56L58 40Z";
  return [
    `<rect x="22" y="18" width="56" height="104" rx="4" fill="none" stroke-width="1.4"${ink.replace("fill", "stroke")}/>`,
    `<rect x="25" y="21" width="50" height="98" rx="2.5"${ink} fill-opacity=".07"/>`,
    `<path d="${crown}"${ink}/>`,
    `<text x="50" y="84" text-anchor="middle" font-size="40" font-weight="800" font-family="Georgia, 'Times New Roman', serif"${ink}>${rank}</text>`,
    suitPath(suit, 50, 99, 14, ink),
    `<g transform="rotate(180 50 70)" opacity=".18"><path d="${crown}"${ink}/></g>`,
  ].join("");
}

/** A face drawn by a design handed in, inside the card's paper: its art fitted to the 100 by 140 box by height, and centred. */
function designed(design: CardDesign, card: string, language: Language): string | null {
  const art = design.art[card];
  if (art === undefined) return null;
  const [width, height] = design.box;
  const scale = CARD_BOX.height / height;
  const left = (CARD_BOX.width - width * scale) / 2;
  const joker = (JOKERS as readonly string[]).includes(card);
  const ink = card === "RJ" ? ` fill="#c2272d"` : ` fill="#1b1b1b"`;
  return `<g transform="translate(${round(left, 3)} 0) scale(${round(scale, 5)})">${art}</g>${joker ? jokerCorners(language, ink) : ""}`;
}

/**
 * A card's face as a whole SVG document, 100 by 140: `QS`, `TD`, or a joker
 * (`RJ`, `BJ`). `null` for anything that is not a card. The plain design
 * unless another is asked for; a design handed in that has no drawing for the
 * card draws it plain.
 *
 * Drawn into a page, the plain and four-colour faces take their colours from
 * `--toranpu-card`, `--toranpu-card-ink`, `--toranpu-card-red`,
 * `--toranpu-card-blue` and `--toranpu-card-green` where they are set; as an
 * image they keep their own.
 */
export function cardFaceSvg(card: string, options: CardFaceOptions = {}): string | null {
  if (!isCardFace(card)) return null;
  const language: Language = options.language === "ja" ? "ja" : "en";
  const { width, height, radius } = CARD_BOX;
  const paper = paint("fill", CARD_FACE_PROPERTIES.paper, undefined, CARD_FACE_COLOURS.paper);
  const name = options.title ?? faceName(card, language);
  const label = name === "" ? ` aria-hidden="true"` : ` role="img" aria-label="${escapeXml(name)}"`;
  const size = typeof options.width === "number" && options.width > 0 ? ` width="${round(options.width)}" height="${round(options.width * 1.4)}"` : "";
  const design = options.design ?? "plain";
  const parts = [`<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}"${paper} stroke="${CARD_FACE_COLOURS.edge}" stroke-opacity=".2" stroke-width=".8"/>`];
  const drawn = typeof design === "object" && design !== null ? designed(design, card, language) : null;
  if (drawn !== null) parts.push(drawn);
  else if (card === "RJ" || card === "BJ") {
    const ink = card === "RJ" ? paint("fill", CARD_FACE_PROPERTIES.red, undefined, CARD_FACE_COLOURS.red) : paint("fill", CARD_FACE_PROPERTIES.black, undefined, CARD_FACE_COLOURS.black);
    parts.push(jokerCorners(language, ink), jesterCap(ink, card === "RJ"));
  } else {
    const rank = card[0] as string;
    const suit = card[1] as CardSuitLetter;
    const ink = suitInk(suit, design === "four-colour");
    parts.push(corners(rank, suit, ink));
    if (rank === "A") parts.push(suitPath(suit, 50, 70, 46, ink));
    else if (rank === "J" || rank === "Q" || rank === "K") parts.push(court(rank, suit, ink));
    else {
      const count = rank === "T" ? 10 : Number(rank);
      for (const pip of pipPlaces(count)) parts.push(pip.down ? `<g transform="rotate(180 ${pip.x} ${pip.y})">${suitPath(suit, pip.x, pip.y, 17, ink)}</g>` : suitPath(suit, pip.x, pip.y, 17, ink));
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"${size}${label}${UNSELECTABLE}>${parts.join("")}</svg>`;
}

/** A card's face as a data URL, for an <img src>, a CSS background or a canvas. `null` for anything that is not a card. */
export function cardFaceUrl(card: string, options: CardFaceOptions = {}): string | null {
  const svg = cardFaceSvg(card, options);
  return svg === null ? null : svgDataUrl(svg);
}

/** A face's name in words: "queen of spades", "red joker"; in Japanese "スペードのクイーン", "赤のジョーカー". */
export function faceName(card: string, language: Language = "en"): string {
  if (card === "RJ") return STRINGS[language].cardRedJoker;
  if (card === "BJ") return STRINGS[language].cardBlackJoker;
  return cardText(card, language);
}

/**
 * A design by its name, loaded when it is first asked for: `"english"` fetches
 * the English pattern (about 700 kB, 200 kB compressed) only then. `"plain"`
 * and `"four-colour"` are drawn here and need no loading; they give `null`.
 */
export async function loadCardDesign(name: CardDesignName | string): Promise<CardDesign | null> {
  if (name === "english") return (await import("../designs/english.ts")).ENGLISH_PATTERN;
  return null;
}
