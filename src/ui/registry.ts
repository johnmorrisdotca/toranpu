/**
 * THE PAGE'S OWN DESIGNS AND BACKS, kept by name so that an attribute can ask for them: register a design once and
 * `design="risk"` works on every card, hand, pile and table of the page; register a back and so does `back="risk-red"`.
 * This file draws nothing and imports no drawing, so the layout arithmetic can ask it whether a card id is one a
 * design of the page draws.
 */
import type { CardBackOptions } from "./card-backs.ts";
import type { CardDesign } from "./card-faces.types.ts";

/** Names the package keeps for its own designs and backs; a page cannot register over them. */
const OWN_DESIGNS: readonly string[] = ["plain", "four-colour", "english", "realistic"];
const OWN_BACKS: readonly string[] = ["classic-red", "classic-blue", "ink-dots"];

/** What a card's id may be, when a design of the page draws it: letters and digits, with `-`, `_`, `.` and `:` inside, up to 40. */
export const CUSTOM_CARD_ID = /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,39}$/;

/** A name a design or back may be registered under: kebab case, up to 40 letters, digits and hyphens. */
const NAME = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;

const designs = new Map<string, CardDesign>();
const listeners = new Set<() => void>();
let telling = false;

/** Tell every element on the page that a design or a back changed, once, after the registering that changed it is done. */
function changed(): void {
  if (telling) return;
  telling = true;
  queueMicrotask(() => {
    telling = false;
    for (const draw of [...listeners]) draw();
  });
}

/** Run `draw` whenever a design or a back is registered or forgotten, until the function returned is called: how an element already on the page draws again with what a page registered after it. */
export function onBrandChange(draw: () => void): () => void {
  listeners.add(draw);
  return () => listeners.delete(draw);
}
const backs = new Map<string, RegisteredCardBack>();

/** A back registered by name: how it is drawn, and the built-in back it starts from. */
export type RegisteredCardBack = CardBackOptions & {
  /** The built-in back this one is drawn from where it says nothing: `"classic-red"` (unless said), `"classic-blue"` or `"ink-dots"`. */
  base?: "classic-red" | "classic-blue" | "ink-dots";
};

function checkName(kind: string, name: unknown, own: readonly string[]): asserts name is string {
  if (typeof name !== "string" || !NAME.test(name) || name.length > 40) throw new RangeError(`${kind} names are kebab case, up to 40 characters: ${String(name)}`);
  if (own.includes(name)) throw new RangeError(`"${name}" is one of Toranpu's own ${kind}s, and cannot be registered over`);
}

/** Keep a design by its name, in place of any earlier one of that name. Throws for a name that is not kebab case or is one of the package's own. */
export function registerDesign(design: CardDesign): void {
  checkName("design", design?.name, OWN_DESIGNS);
  if (typeof design.art !== "object" || design.art === null) throw new TypeError("a design has an `art` object, empty if every card is drawn by `draw`");
  if (!Array.isArray(design.box) || design.box.length !== 2 || !design.box.every((side) => Number.isFinite(side) && side > 0)) throw new TypeError("a design's `box` is its [width, height]");
  designs.set(design.name, design);
  changed();
}

/** Forget a registered design. Does nothing for a name never registered. */
export function unregisterDesign(name: string): void {
  if (designs.delete(name)) changed();
}

/** A registered design by its name, or undefined. */
export function registeredDesign(name: unknown): CardDesign | undefined {
  return typeof name === "string" ? designs.get(name) : undefined;
}

/** The names of the designs registered now, in the order they were. */
export function registeredDesignNames(): string[] {
  return [...designs.keys()];
}

/** Keep a back by its name. Throws for a name that is not kebab case or is one of the package's own. */
export function registerBack(name: string, back: RegisteredCardBack): void {
  checkName("back", name, OWN_BACKS);
  backs.set(name, { ...back });
  changed();
}

/** Forget a registered back. Does nothing for a name never registered. */
export function unregisterBack(name: string): void {
  if (backs.delete(name)) changed();
}

/** A registered back by its name, or undefined. */
export function registeredBack(name: unknown): RegisteredCardBack | undefined {
  return typeof name === "string" ? backs.get(name) : undefined;
}

/** The names of the backs registered now, in the order they were. */
export function registeredBackNames(): string[] {
  return [...backs.keys()];
}

/** Whether a design draws this card: it has art for it, or its `draw` gives one. */
export function designDraws(design: CardDesign | undefined, card: string): boolean {
  if (design === undefined) return false;
  if (Object.hasOwn(design.art, card)) return true;
  if (design.draw !== undefined && design.draw(card, { language: "en" }) !== null) return true;
  return design.fallback !== undefined && designDraws(design.fallback, card);
}

/** Whether a card is one that a registered design draws, and no deck has: any id of the shape a custom card may have. */
export function customCardKnown(card: string): boolean {
  if (!CUSTOM_CARD_ID.test(card)) return false;
  for (const design of designs.values()) if (designDraws(design, card)) return true;
  return false;
}
