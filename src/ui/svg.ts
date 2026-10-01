/**
 * What every drawing in Toranpu shares: the card's box, the suits drawn as
 * shapes (no font's glyph, so every browser draws the same), and the small
 * helpers that write SVG safely. Drawn for Toranpu; MIT like the rest.
 */
import type { CardSuitLetter } from "./svg.types.ts";

/** A card is drawn in a box 100 wide and 140 tall, the 5:7 of a poker-size card, and scales to any width. */
export const CARD_BOX = { width: 100, height: 140, radius: 7 } as const;

/**
 * The four suits, each a path in a box of 100 filled in one colour. A club is
 * three lobes and a stem, a spade a heart turned over with a stem, so the
 * four are told apart by their outline alone.
 */
export const SUIT_PATHS: Readonly<Record<CardSuitLetter, string>> = {
  S: "M50 6C42 22 10 38 10 60C10 73 20 81 31 81C39 81 45 77 48 71C47 82 43 89 34 95H66C57 89 53 82 52 71C55 77 61 81 69 81C80 81 90 73 90 60C90 38 58 22 50 6Z",
  H: "M50 90C28 72 7 55 7 33C7 18 18 8 31 8C40 8 46 13 50 21C54 13 60 8 69 8C82 8 93 18 93 33C93 55 72 72 50 90Z",
  D: "M50 4Q67 28 86 50Q67 72 50 96Q33 72 14 50Q33 28 50 4Z",
  C: "M33 30a17 17 0 1 0 34 0a17 17 0 1 0 -34 0ZM10 60a17 17 0 1 0 34 0a17 17 0 1 0 -34 0ZM56 60a17 17 0 1 0 34 0a17 17 0 1 0 -34 0ZM44 40L42 62H58L56 40ZM48 62C47 80 43 89 34 95H66C57 89 53 80 52 62Z",
};

/** Text made safe inside an attribute or between tags. */
export const escapeXml = (text: string): string => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** A colour a person may hand in: a hex colour, a name, or rgb()/hsl()/oklch() with plain numbers. Anything else is refused, so nothing can be written into the drawing through it. */
export function isColour(text: unknown): text is string {
  return typeof text === "string" && /^(#[0-9a-fA-F]{3,8}|[a-zA-Z]{3,20}|(rgb|rgba|hsl|hsla|oklch|oklab)\([0-9.,%\s/+-]{1,60}\))$/.test(text.trim());
}

/**
 * A paint: the colour given when one is, and otherwise a CSS custom property
 * with the drawing's own colour behind it, so that a drawing put into a page
 * takes the page's theme, and the same drawing in an <img> keeps its own.
 */
export function paint(kind: "fill" | "stroke", property: string, given: string | undefined, fallback: string): string {
  if (given !== undefined && isColour(given)) return ` ${kind}="${escapeXml(given.trim())}"`;
  return ` style="${kind}:var(${property},${fallback})"`;
}

/** A suit as a path, `size` across, its middle at x, y. */
export function suitPath(suit: CardSuitLetter, x: number, y: number, size: number, colour: string): string {
  const scale = size / 100;
  return `<path d="${SUIT_PATHS[suit]}" transform="translate(${round(x - size / 2)} ${round(y - size / 2)}) scale(${round(scale, 4)})"${colour}/>`;
}

/** A number written short, for a drawing: no more places than are needed. */
export const round = (value: number, places = 2): string => String(Number(value.toFixed(places)));

/** An SVG document, as a string or as a data URL an <img> or CSS can take. */
export function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
