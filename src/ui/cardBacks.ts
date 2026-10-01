/**
 * THE BACKS OF THE CARDS: one home for every card game in the family. Each
 * back is drawn here as SVG, in the same 100 by 140 box as every card, and
 * comes as a whole SVG document (`cardBackSvg`) or a data URL (`cardBackUrl`)
 * for an <img>, a CSS background or a canvas.
 *
 * All three were drawn for Toranpu. The two classic backs are in the manner
 * of a casino back, a fine lattice inside a white border with a rosette in
 * the middle; they copy no maker's design.
 */
import { CARD_BOX, escapeXml, paint, round, suitPath, svgDataUrl } from "./svg.ts";

/** The backs, by name. */
export const CARD_BACKS = ["classic-red", "classic-blue", "ink-dots"] as const;

/** One back's name. */
export type CardBackName = (typeof CARD_BACKS)[number];

/** Each back's own colours: its field, the lines and dots drawn on the field, and the paper round it. */
export const CARD_BACK_LOOK: Readonly<Record<CardBackName, { field: string; ink: string; paper: string }>> = {
  "classic-red": { field: "#b3262d", ink: "#fffaf0", paper: "#fffdf8" },
  "classic-blue": { field: "#1f4e8c", ink: "#fffaf0", paper: "#fffdf8" },
  "ink-dots": { field: "#24231f", ink: "#fffaf0", paper: "#fffdf8" },
};

/** How a back is drawn. Every field may be left out. */
export type CardBackOptions = {
  /** The field's colour, in place of the back's own: `#8f2826`, `rebeccapurple`, `rgb(…)`. Anything else is ignored. */
  colour?: string;
  /** The colour of the lines and dots on the field. */
  ink?: string;
  /** The colour of the paper round the field. */
  paper?: string;
  /** Words in the middle, such as a site's name or mark ("五つ", "一つ"), in place of the back's own ornament. */
  mark?: string;
  /** The width to draw at, in pixels; the height is 1.4 times it. Unless said, the drawing has no size and fills what holds it. */
  width?: number;
  /** What a screen reader says for it. Unless said (or said as ""), the back is decoration and says nothing. */
  title?: string;
};

/** The CSS custom properties a back drawn into a page takes its colours from, when no colour is given. */
export const CARD_BACK_PROPERTIES = { field: "--toranpu-back", ink: "--toranpu-back-ink", paper: "--toranpu-back-paper" } as const;

const isBack = (name: unknown): name is CardBackName => (CARD_BACKS as readonly unknown[]).includes(name);

/** A short key for the colours, so a pattern's id is the same for the same back and differs for another. */
function key(name: CardBackName, options: CardBackOptions): string {
  const text = `${name}|${options.colour ?? ""}|${options.ink ?? ""}|${options.paper ?? ""}`;
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = (Math.imul(hash, 31) + text.charCodeAt(i)) | 0;
  return `${name}-${(hash >>> 0).toString(36)}`;
}

/** A rosette of eight petals round a middle, the classic backs' ornament. */
function rosette(cx: number, cy: number, field: string, ink: string): string {
  const petals = Array.from({ length: 8 }, (_, at) => `<ellipse cx="${cx}" cy="${cy - 7.2}" rx="2.6" ry="6.2" transform="rotate(${at * 45} ${cx} ${cy})"${ink}/>`).join("");
  return [
    `<circle cx="${cx}" cy="${cy}" r="18"${field}/>`,
    `<circle cx="${cx}" cy="${cy}" r="18" fill="none" stroke-width="1.3"${ink.replace("fill", "stroke")}/>`,
    `<circle cx="${cx}" cy="${cy}" r="15.2" fill="none" stroke-width=".6"${ink.replace("fill", "stroke")}/>`,
    petals,
    `<circle cx="${cx}" cy="${cy}" r="3.2"${field}/>`,
    `<circle cx="${cx}" cy="${cy}" r="3.2" fill="none" stroke-width=".9"${ink.replace("fill", "stroke")}/>`,
    `<circle cx="${cx}" cy="${cy}" r="1.2"${ink}/>`,
  ].join("");
}

/** A small diamond, the classic backs' corner mark. */
const diamond = (x: number, y: number, size: number, ink: string) => `<path d="M${x} ${y - size}L${x + size * 0.7} ${y}L${x} ${y + size}L${x - size * 0.7} ${y}Z"${ink}/>`;

/** The middle of a back with a mark of the caller's: a paper disc with the words on it, in the field's colour. */
function marked(cx: number, cy: number, words: string, field: string, paper: string, fieldText: string): string {
  const size = words.length <= 2 ? 15 : words.length <= 4 ? 11 : 8;
  return `<circle cx="${cx}" cy="${cy}" r="18.5"${field}/><circle cx="${cx}" cy="${cy}" r="16"${paper}/><text x="${cx}" y="${round(cy + size * 0.35)}" text-anchor="middle" font-size="${size}" font-weight="700" font-family="system-ui, sans-serif"${fieldText}>${escapeXml(words)}</text>`;
}

/**
 * A back as a whole SVG document, 100 by 140. `name` is one of `CARD_BACKS`
 * (an unknown name draws the classic red); the options recolour it, put words
 * in its middle, size it and name it.
 *
 * Drawn into a page, a back takes its colours from the CSS custom properties
 * `--toranpu-back`, `--toranpu-back-ink` and `--toranpu-back-paper` where they
 * are set and no colour is given here; as an image, it keeps its own.
 */
export function cardBackSvg(name: CardBackName | string = "classic-red", options: CardBackOptions = {}): string {
  const back: CardBackName = isBack(name) ? name : "classic-red";
  const look = CARD_BACK_LOOK[back];
  const { width, height, radius } = CARD_BOX;
  const id = `toranpu-back-${key(back, options)}`;
  const field = paint("fill", CARD_BACK_PROPERTIES.field, options.colour, look.field);
  const ink = paint("fill", CARD_BACK_PROPERTIES.ink, options.ink, look.ink);
  const inkLine = paint("stroke", CARD_BACK_PROPERTIES.ink, options.ink, look.ink);
  const paper = paint("fill", CARD_BACK_PROPERTIES.paper, options.paper, look.paper);
  const fieldText = field;
  const size = typeof options.width === "number" && options.width > 0 ? ` width="${round(options.width)}" height="${round(options.width * 1.4)}"` : "";
  const title = options.title === undefined || options.title === "" ? ` aria-hidden="true"` : ` role="img" aria-label="${escapeXml(options.title)}"`;
  const mark = typeof options.mark === "string" && options.mark.trim() !== "" ? options.mark.trim().slice(0, 12) : null;
  const parts: string[] = [`<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius}"${paper} stroke="#000" stroke-opacity=".18" stroke-width=".8"/>`];

  if (back === "ink-dots") {
    parts.push(
      `<defs><pattern id="${id}" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="translate(2 2)"><circle cx="2" cy="2" r="1.35"${ink} fill-opacity=".85"/><circle cx="6" cy="6" r="1.35"${ink} fill-opacity=".32"/></pattern></defs>`,
      `<rect x="5" y="5" width="${width - 10}" height="${height - 10}" rx="4"${field}/>`,
      `<rect x="5" y="5" width="${width - 10}" height="${height - 10}" rx="4" fill="url(#${id})"/>`,
      `<rect x="8.5" y="8.5" width="${width - 17}" height="${height - 17}" rx="2.5" fill="none" stroke-width=".7" stroke-opacity=".6"${inkLine}/>`,
    );
    if (mark !== null) parts.push(marked(50, 70, mark, field, paper, fieldText));
    else {
      parts.push(`<rect x="29" y="49" width="42" height="42" rx="7"${field}/><rect x="32" y="52" width="36" height="36" rx="5.5"${paper}/>`);
      const red = ` fill="#c2272d"`;
      const black = ` fill="#1b1b1b"`;
      parts.push(suitPath("S", 42, 62, 13, black), suitPath("H", 58, 62, 13, red), suitPath("D", 42, 78, 13, red), suitPath("C", 58, 78, 13, black));
    }
  } else {
    parts.push(
      `<defs><pattern id="${id}" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45 50 70)"><path d="M0 0H6M0 0V6" fill="none" stroke-width=".55" stroke-opacity=".7"${inkLine}/><circle cx="3" cy="3" r=".75"${ink} fill-opacity=".8"/></pattern></defs>`,
      `<rect x="5" y="5" width="${width - 10}" height="${height - 10}" rx="4"${field}/>`,
      `<rect x="9" y="9" width="${width - 18}" height="${height - 18}" rx="2" fill="url(#${id})"/>`,
      `<rect x="6.8" y="6.8" width="${width - 13.6}" height="${height - 13.6}" rx="3.2" fill="none" stroke-width=".5" stroke-opacity=".75"${inkLine}/>`,
      `<rect x="9" y="9" width="${width - 18}" height="${height - 18}" rx="2" fill="none" stroke-width="1"${inkLine}/>`,
      diamond(15, 15, 3.2, ink),
      diamond(85, 15, 3.2, ink),
      diamond(15, 125, 3.2, ink),
      diamond(85, 125, 3.2, ink),
    );
    parts.push(mark !== null ? marked(50, 70, mark, field, paper, fieldText) : rosette(50, 70, field, ink));
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"${size}${title}>${parts.join("")}</svg>`;
}

/** A back as a data URL, for an <img src>, a CSS background or a canvas: the same drawing as `cardBackSvg`, with its own colours. */
export function cardBackUrl(name: CardBackName | string = "classic-red", options: CardBackOptions = {}): string {
  return svgDataUrl(cardBackSvg(name, options));
}
