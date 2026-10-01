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

/** What the elements extend: HTMLElement, or on a server, where there is none, an empty class, so that importing them never throws. */
export const ElementBase: typeof HTMLElement = typeof HTMLElement === "undefined" ? (class {} as unknown as typeof HTMLElement) : HTMLElement;

let english: CardDesign | null = null;
let englishLoading: Promise<CardDesign | null> | null = null;

/**
 * A design as an element names it: `plain` and `four-colour` at once; the
 * English pattern once it has been fetched, and until then `null`, with
 * `ready` settling when it arrives.
 */
export function designNamed(name: string | null): { design: "plain" | "four-colour" | CardDesign | null; ready: Promise<unknown> | null } {
  if (name === "four-colour") return { design: "four-colour", ready: null };
  if (name !== "english") return { design: "plain", ready: null };
  if (english !== null) return { design: english, ready: null };
  englishLoading ??= loadCardDesign("english").then((loaded) => (english = loaded));
  return { design: null, ready: englishLoading };
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
