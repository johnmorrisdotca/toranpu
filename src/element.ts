/**
 * Toranpu's custom elements, for any page and any framework that renders
 * HTML, and the arithmetic behind them:
 *
 * - `<toranpu-card>`: one card, in any design and with any back, turned over
 *   by a tap.
 *
 * ```ts
 * import { defineToranpuElements } from "@johnmorrisdotca/toranpu/element";
 *
 * defineToranpuElements();
 * document.body.insertAdjacentHTML("beforeend", '<toranpu-card card="KS" design="english" flip></toranpu-card>');
 * ```
 *
 * Or with no call at all: importing `@johnmorrisdotca/toranpu/element/define`
 * registers them by being imported.
 */
import { ToranpuCard } from "./ui/cardElement.ts";

export { ToranpuCard } from "./ui/cardElement.ts";
export { ELEMENT_SIZES } from "./ui/elementKit.ts";
export { handLayout, pileLayout, readHand } from "./ui/layout.ts";
export type { CardPlace, HandLayoutOptions, PileLayoutOptions } from "./ui/layout.ts";

/** The elements' tags. */
export const TORANPU_TAGS = { card: "toranpu-card" } as const;

/** Register the elements under their tags, once; a tag already taken is left as it is. Does nothing where there are no custom elements, as on a server. */
export function defineToranpuElements(): void {
  if (typeof customElements === "undefined") return;
  const all: [string, CustomElementConstructor][] = [[TORANPU_TAGS.card, ToranpuCard]];
  for (const [tag, made] of all) if (customElements.get(tag) === undefined) customElements.define(tag, made);
}
