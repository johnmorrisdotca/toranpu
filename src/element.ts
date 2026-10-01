/**
 * Toranpu's custom elements, for any page and any framework that renders
 * HTML, and the arithmetic behind them:
 *
 * - `<toranpu-card>`: one card, in any design and with any back, turned over
 *   by a tap.
 * - `<toranpu-hand>`: a hand, fanned; turned face down where it lies, all at
 *   once or one by one; squared up into a bundle that shows nothing; or held
 *   closed, to open on a tap.
 * - `<toranpu-pile>`: a stock or a discard pile, neat or messy, from a seed.
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
import { ToranpuHand } from "./ui/handElement.ts";
import { ToranpuPile } from "./ui/pileElement.ts";

export { ToranpuCard } from "./ui/cardElement.ts";
export { BUNDLE_BACKS, ToranpuHand } from "./ui/handElement.ts";
export type { HandTurnOptions } from "./ui/handElement.ts";
export { ToranpuPile } from "./ui/pileElement.ts";
export { ELEMENT_SIZES } from "./ui/elementKit.ts";
export { handLayout, pileLayout, readHand } from "./ui/layout.ts";
export type { CardPlace, HandLayoutOptions, PileLayoutOptions } from "./ui/layout.ts";

/** The elements' tags. */
export const TORANPU_TAGS = { card: "toranpu-card", hand: "toranpu-hand", pile: "toranpu-pile" } as const;

/** Register the elements under their tags, once; a tag already taken is left as it is. Does nothing where there are no custom elements, as on a server. */
export function defineToranpuElements(): void {
  if (typeof customElements === "undefined") return;
  const all: [string, CustomElementConstructor][] = [
    [TORANPU_TAGS.card, ToranpuCard],
    [TORANPU_TAGS.hand, ToranpuHand],
    [TORANPU_TAGS.pile, ToranpuPile],
  ];
  for (const [tag, made] of all) if (customElements.get(tag) === undefined) customElements.define(tag, made);
}
