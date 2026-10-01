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
import { cleanMarkup } from "./markup.ts";
import { designDraws, registeredDesign } from "./registry.ts";
import { CARD_BOX, escapeXml, paint, round, suitPath, svgDataUrl, UNSELECTABLE } from "./svg.ts";
import type { CardSuitLetter } from "./svg.types.ts";

/** The designs drawn here, by name. The English pattern is `ENGLISH_PATTERN` from `@johnmorrisdotca/toranpu/card-faces/english`, or `loadCardDesign("english")`. */
export const CARD_DESIGNS = ["plain", "four-colour", "english", "realistic"] as const;

/** A design's name. */
export type CardDesignName = (typeof CARD_DESIGNS)[number];

/** The two jokers' ids: the red joker and the black. No game here plays with them; a table of your own may. */
export const JOKERS = ["RJ", "BJ"] as const;

/** How a face is drawn. Every field may be left out. */
export type CardFaceOptions = {
  /** `"plain"` (unless said), `"four-colour"`, a design handed in, such as `ENGLISH_PATTERN`, or the name of a design the page has registered (`registerCardDesign`). */
  design?: "plain" | "four-colour" | CardDesign | (string & {});
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

/**
 * THE EXTRAS OF A REAL DECK, which no game here deals but a hand on a page may hold, as a wild
 * card or for the look of it: the two jokers, the two rules cards a pack is sold with (`R1`,
 * the rules of Hearts; `R2`, of Spades), and a blank (`BL`). A hand holds at most
 * `EXTRA_LIMITS` of each kind (`readHand`).
 */
export const EXTRA_CARDS = ["RJ", "BJ", "R1", "R2", "BL"] as const;

/** The most of each kind of extra one hand holds: four jokers, as some packs have; two rules cards; two blanks. */
export const EXTRA_LIMITS = { jokers: 4, rules: 2, blanks: 2 } as const;

/** Whether a text is a card a face can be drawn for: `QS`, `TD`, a joker (`RJ`, `BJ`), a rules card (`R1`, `R2`) or the blank (`BL`). */
export function isCardFace(text: unknown): text is string {
  return typeof text === "string" && (/^[A2-9TJQK][SHDC]$/.test(text) || (EXTRA_CARDS as readonly string[]).includes(text));
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

/** A rules card: the game's name at the head, its suit under it, and the rules in five short lines. */
function rulesCard(card: "R1" | "R2", language: Language, ink: string): string {
  const words = STRINGS[language];
  const [title, lines] = card === "R1" ? [words.rulesHeartsTitle, words.rulesHearts] : [words.rulesSpadesTitle, words.rulesSpades];
  const suit: CardSuitLetter = card === "R1" ? "H" : "S";
  const suitInkOf = card === "R1" ? paint("fill", CARD_FACE_PROPERTIES.red, undefined, CARD_FACE_COLOURS.red) : ink;
  return [
    `<rect x="8" y="8" width="84" height="124" rx="4" fill="none" stroke-width=".8" stroke-opacity=".45"${ink.replace("fill", "stroke")}/>`,
    `<text x="50" y="25" text-anchor="middle" font-size="11" font-weight="800" letter-spacing=".6" font-family="${SANS}"${ink}>${escapeXml(title)}</text>`,
    suitPath(suit, 50, 38, 12, suitInkOf),
    `<path d="M24 49H76" stroke-width=".7" stroke-opacity=".5"${ink.replace("fill", "stroke")}/>`,
    ...lines.split("\n").map((line, at) => `<text x="50" y="${61 + at * 13.5}" text-anchor="middle" font-size="${language === "ja" ? 5.6 : 5.4}" font-weight="500" font-family="${SANS}"${ink}>${escapeXml(line)}</text>`),
  ].join("");
}

/** The blank: the paper and a faint frame, for a card of your own to write on. */
function blankCard(ink: string): string {
  return `<rect x="8" y="8" width="84" height="124" rx="4" fill="none" stroke-width=".6" stroke-opacity=".18"${ink.replace("fill", "stroke")}/>`;
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

/** The design an option names: a design handed in as it is, a registered one by its name, and the two drawn here as their names. */
export function designOf(design: CardFaceOptions["design"]): "plain" | "four-colour" | CardDesign {
  if (typeof design === "object" && design !== null) return design;
  return registeredDesign(design) ?? (design === "four-colour" ? "four-colour" : "plain");
}

/** A face drawn by a design handed in, inside the card's paper: its art fitted to the 100 by 140 box by height, and centred. */
function designed(design: CardDesign, card: string, language: Language): string | null {
  const kept = registeredDesign(design.name) === design;
  let art: string | null | undefined = Object.hasOwn(design.art, card) ? design.art[card] : undefined;
  if (art === undefined && design.draw !== undefined) art = design.draw(card, { language });
  if (art === undefined || art === null) return design.fallback === undefined ? null : designed(design.fallback, card, language);
  // A design the page registered is the page's own markup, kept clean; the package's own designs are trusted as they are.
  if (kept) art = cleanMarkup(art);
  const [width, height] = design.box;
  const scale = CARD_BOX.height / height;
  const left = (CARD_BOX.width - width * scale) / 2;
  const joker = !kept && (JOKERS as readonly string[]).includes(card);
  const ink = card === "RJ" ? ` fill="#c2272d"` : ` fill="#1b1b1b"`;
  return `<g transform="translate(${round(left, 3)} 0) scale(${round(scale, 5)})">${art}</g>${joker ? jokerCorners(language, ink) : ""}`;
}

/**
 * A card's face as a whole SVG document, 100 by 140: `QS`, `TD`, a joker
 * (`RJ`, `BJ`), a rules card (`R1`, `R2`) or the blank (`BL`). `null` for anything that is not a card. The plain design
 * unless another is asked for; a design handed in that has no drawing for the
 * card draws it plain.
 *
 * Drawn into a page, the plain and four-colour faces take their colours from
 * `--toranpu-card`, `--toranpu-card-ink`, `--toranpu-card-red`,
 * `--toranpu-card-blue` and `--toranpu-card-green` where they are set; as an
 * image they keep their own.
 */
export function cardFaceSvg(card: string, options: CardFaceOptions = {}): string | null {
  const design = designOf(options.design);
  if (!isCardFace(card) && !(typeof design === "object" && designDraws(design, card))) return null;
  const language: Language = options.language === "ja" ? "ja" : "en";
  const { width, height, radius } = CARD_BOX;
  const paper = paint("fill", CARD_FACE_PROPERTIES.paper, undefined, CARD_FACE_COLOURS.paper);
  const name = options.title ?? faceName(card, language, typeof design === "object" ? design : undefined);
  const label = name === "" ? ` aria-hidden="true"` : ` role="img" aria-label="${escapeXml(name)}"`;
  const size = typeof options.width === "number" && options.width > 0 ? ` width="${round(options.width)}" height="${round(options.width * 1.4)}"` : "";
  const bare = typeof design === "object" && design.frame === "none";
  const parts = bare ? [] : [`<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}"${paper} stroke="${CARD_FACE_COLOURS.edge}" stroke-opacity=".2" stroke-width=".8"/>`];
  const drawn = typeof design === "object" ? designed(design, card, language) : null;
  if (drawn !== null) parts.push(drawn);
  else if (!isCardFace(card)) return null;
  else if (card === "R1" || card === "R2") parts.push(rulesCard(card, language, paint("fill", CARD_FACE_PROPERTIES.black, undefined, CARD_FACE_COLOURS.black)));
  else if (card === "BL") parts.push(blankCard(paint("fill", CARD_FACE_PROPERTIES.black, undefined, CARD_FACE_COLOURS.black)));
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

/**
 * A card's face from artwork of your own: `art` is SVG markup (or a whole `<svg>` document) drawn on the card's paper in
 * a box 100 by 140, or in `box`, fitted to the card's height and centred; a whole `<svg>` is used as it is. It is how a
 * page draws a card no deck has, for one card, with no design registered. `frame: "none"` leaves the paper out for art that
 * fills the card. Scripts, handlers and foreign objects are taken out of the markup.
 */
export function cardFaceFromArt(art: string, options: Omit<CardFaceOptions, "design"> & { box?: readonly [number, number]; frame?: "paper" | "none" } = {}): string {
  const clean = cleanMarkup(art);
  if (clean.trim().startsWith("<svg")) return clean;
  const design: CardDesign = { name: "page-art", box: options.box ?? [CARD_BOX.width, CARD_BOX.height], art: { art: clean }, frame: options.frame };
  return cardFaceSvg("art", { ...options, design, title: options.title ?? "" }) ?? "";
}

/** A card's face as a data URL, for an <img src>, a CSS background or a canvas. `null` for anything that is not a card. */
export function cardFaceUrl(card: string, options: CardFaceOptions = {}): string | null {
  const svg = cardFaceSvg(card, options);
  return svg === null ? null : svgDataUrl(svg);
}

/**
 * A face's name in words: "queen of spades", "red joker"; in Japanese "スペードのクイーン", "赤のジョーカー". A card
 * of a design of the page's own, given as `design`, is named by that design's `label`, or by its id.
 */
export function faceName(card: string, language: Language = "en", design?: CardDesign): string {
  const named = design?.label !== undefined && designDraws(design, card) ? design.label(card, language) : null;
  if (typeof named === "string" && named !== "") return named;
  if (!isCardFace(card)) return card;
  if (card === "RJ") return STRINGS[language].cardRedJoker;
  if (card === "BJ") return STRINGS[language].cardBlackJoker;
  if (card === "R1") return STRINGS[language].cardRulesHearts;
  if (card === "R2") return STRINGS[language].cardRulesSpades;
  if (card === "BL") return STRINGS[language].cardBlank;
  return cardText(card, language);
}

/**
 * A design by its name, loaded when it is first asked for: `"english"` fetches
 * the English pattern (about 700 kB, 200 kB compressed) only then. `"plain"`
 * and `"four-colour"` are drawn here and need no loading; they give `null`. A
 * design the page registered under the name is given as it is.
 */
export async function loadCardDesign(name: CardDesignName | string): Promise<CardDesign | null> {
  const own = registeredDesign(name);
  if (own !== undefined) return own;
  if (name === "english") return (await import("../designs/english.ts")).ENGLISH_PATTERN;
  if (name === "realistic") return (await import("../designs/realistic.ts")).REALISTIC;
  return null;
}
