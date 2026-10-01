/**
 * What Toranpu's custom elements share: a base class that is safe to define on
 * a server, the designs each element may name (the English pattern fetched
 * the first time one asks), the language an element speaks, one set of
 * sounds for the page, and the drawing of one card face up or face down.
 */
import { CARD_BACKS, cardBackSvg, type CardBackOptions } from "./cardBacks.ts";
import { createCardSounds, type CardSounds } from "./cardSounds.ts";
import { cardFaceSvg, faceName, loadCardDesign } from "./cardFaces.ts";
import type { CardDesign } from "./cardFaces.types.ts";
import { STRINGS, type Language } from "../strings.ts";
import { readHand } from "./layout.ts";

/** What the elements extend: HTMLElement, or on a server, where there is none, an empty class, so that importing them never throws. */
export const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

const loadedDesigns = new Map<string, CardDesign | null>();
const loadingDesigns = new Map<string, Promise<CardDesign | null>>();

/**
 * A design as an element names it: `plain` and `four-colour` at once; a
 * drawn set (`english`, `realistic`) once it has been fetched, and until then
 * `null`, with `ready` settling when it arrives.
 */
export function designNamed(name: string | null): { design: "plain" | "four-colour" | CardDesign | null; ready: Promise<unknown> | null } {
  if (name === "four-colour") return { design: "four-colour", ready: null };
  if (name !== "english" && name !== "realistic") return { design: "plain", ready: null };
  const loaded = loadedDesigns.get(name);
  if (loaded !== undefined && loaded !== null) return { design: loaded, ready: null };
  if (!loadingDesigns.has(name)) loadingDesigns.set(name, loadCardDesign(name).then((design) => (loadedDesigns.set(name, design), design)));
  return { design: null, ready: loadingDesigns.get(name) as Promise<CardDesign | null> };
}

/** The language an element speaks: its own `lang`, or the nearest one above it, or the page's; Japanese for anything that starts `ja`. */
export function languageOf(element: Element): Language {
  const tag = element.closest("[lang]")?.getAttribute("lang") ?? (typeof document === "undefined" ? "" : document.documentElement.lang);
  return String(tag).toLowerCase().startsWith("ja") ? "ja" : "en";
}

let sounds: CardSounds | null = null;
/** One set of sounds for every element on the page, made the first time an element with `sound` makes one. */
export function pageSounds(): CardSounds {
  sounds ??= createCardSounds();
  return sounds;
}

/** A back as an element names it, with its colour and words. */
export function backOptions(element: Element): { name: string; options: CardBackOptions } {
  const asked = element.getAttribute("back") ?? "classic-red";
  const name = (CARD_BACKS as readonly string[]).includes(asked) ? asked : "classic-red";
  const options: CardBackOptions = {};
  const colour = element.getAttribute("back-colour");
  const mark = element.getAttribute("mark");
  if (colour !== null) options.colour = colour;
  if (mark !== null) options.mark = mark;
  return { name, options };
}

/** One card's drawing: its face, or its back. A face-down card's face is never in the page. */
export function cardDrawing(card: string, faceDown: boolean, element: Element, design: "plain" | "four-colour" | CardDesign | null, language: Language): string {
  if (faceDown) {
    const { name, options } = backOptions(element);
    return cardBackSvg(name, { ...options, title: "" });
  }
  // A design still being fetched draws nothing yet; the element draws again when it arrives.
  if (design === null) return "";
  return cardFaceSvg(card, { design, language, title: "" }) ?? "";
}

/** What a screen reader says for a card: its name, or that it is face down. */
export function cardLabel(card: string, faceDown: boolean, language: Language): string {
  return faceDown ? STRINGS[language].cardFaceDown : faceName(card, language);
}

/** The sizes every element takes, as a card's width in pixels. */
export const ELEMENT_SIZES = { small: 46, medium: 70, large: 104 } as const;

/** An element's card width in CSS: its `width` in pixels, or its `size`, or the page's `--toranpu-card-width`, or medium. */
export function widthOf(element: Element): string {
  const width = Number(element.getAttribute("width"));
  if (Number.isFinite(width) && width > 0) return `${Math.min(600, width)}px`;
  const size = element.getAttribute("size") as keyof typeof ELEMENT_SIZES | null;
  if (size !== null && size in ELEMENT_SIZES) return `${ELEMENT_SIZES[size]}px`;
  return `var(--toranpu-card-width, ${ELEMENT_SIZES.medium}px)`;
}

/** Whether the person has asked their device for less motion. */
export function lessMotion(): boolean {
  return typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** An attribute that is on when present, unless it says "false" or "off". */
export function isOn(element: Element, name: string): boolean {
  const value = element.getAttribute(name);
  return value !== null && !["false", "off", "0", "no"].includes(value.toLowerCase());
}

const speakers = new Set<() => void>();
let listening: MutationObserver | null = null;
/**
 * Redraw an element when the page changes its language (`<html lang>`), as a
 * language chooser does, until `forget` is called. One watcher serves every
 * element on the page.
 */
export function followLanguage(redraw: () => void): () => void {
  speakers.add(redraw);
  if (listening === null && typeof MutationObserver !== "undefined" && typeof document !== "undefined") {
    listening = new MutationObserver(() => {
      for (const one of [...speakers]) one();
    });
    listening.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  }
  return () => speakers.delete(redraw);
}

/** Cards as an element's method is given them, one or several, in any spelling `readHand` reads, as ids. */
export function cardIds(cards: string | readonly string[]): string[] {
  return readHand(typeof cards === "string" ? cards : cards.join(" ")) ?? [];
}

/** The cards an element's `marked` attribute names. */
export function markedCards(element: Element): Set<string> {
  return new Set(readHand(element.getAttribute("marked")) ?? []);
}

/**
 * A MARK ON A CARD, to follow it while it is face down and moves about (John, 2026-10-01: in Solitaire,
 * "to visually track a hidden card in deck games where the cards move around and recycle"). A round dot
 * on the card's top left corner, where a fanned hand and a pile both leave it in sight, the same on the
 * face and on the back, since it is drawn on the card and not on either side. `--toranpu-marker` colours it.
 */
export function markerHtml(marked: boolean): string {
  return marked ? '<div class="marker" part="marker" aria-hidden="true"></div>' : "";
}

/** The mark's look, for every element that draws one. */
export const MARKER_STYLE = `.marker { position: absolute; left: -6%; top: -4%; width: 22%; aspect-ratio: 1; border-radius: 50%; background: var(--toranpu-marker, #f2b134); box-shadow: 0 0 0 2px #fff, 0 1px 3px rgba(0,0,0,.45); pointer-events: none; }`;

/** How a card is spun. */
export type SpinOptions = {
  /** Which way it spins. Unless said, clockwise. */
  direction?: "clockwise" | "anticlockwise";
  /** How many whole turns before it comes to rest where it lay. Unless said, 3; at most 20. */
  turns?: number;
  /** How long the spin takes, in milliseconds. Unless said, 700 and 420 a turn. */
  ms?: number;
};

/**
 * A CARD SPUN ON THE TABLE, as a flick sets a real one turning: fast at first, then slowed by the
 * cloth until it stops, a whole number of turns later, lying as it was. `delay` starts it a little
 * after the others where several spin. Settles at once on a device that asks for less motion, and
 * when the spin is cut short.
 */
export function spinElement(element: HTMLElement, options: SpinOptions = {}, delay = 0): Promise<void> {
  if (lessMotion() || typeof element.animate !== "function") return Promise.resolve();
  const turns = Math.min(20, Math.max(1, Math.round(Number.isFinite(options.turns) ? (options.turns as number) : 3)));
  const sign = options.direction === "anticlockwise" ? -1 : 1;
  const ms = Number.isFinite(options.ms) && (options.ms as number) > 0 ? (options.ms as number) : 700 + 420 * turns;
  const run = element.animate([{ transform: "rotate(0deg)" }, { transform: `rotate(${sign * 360 * turns}deg)` }], { duration: ms, delay, easing: "cubic-bezier(.06, .72, .2, 1)" });
  return run.finished.then(
    () => undefined,
    () => undefined,
  );
}
