/**
 * The backs of the cards, drawn as SVG: one home for every card game in the
 * family. Three to start: a classic red and a classic blue in the manner of a
 * casino back, and ink with dots. Each can be recoloured, carry a site's mark
 * in its middle, and comes as an SVG document or a data URL.
 *
 * ```ts
 * import { cardBackSvg, cardBackUrl } from "@johnmorrisdotca/toranpu/card-backs";
 *
 * element.innerHTML = cardBackSvg("classic-blue", { width: 70 });
 * image.src = cardBackUrl("ink-dots", { colour: "#8f2826", mark: "五つ" });
 * ```
 */
export { CARD_BACKS, CARD_BACK_LOOK, CARD_BACK_PROPERTIES, cardBackSvg, cardBackUrl } from "./ui/cardBacks.ts";
export type { CardBackName, CardBackOptions } from "./ui/cardBacks.ts";
export { CARD_BOX, SUIT_PATHS } from "./ui/svg.ts";
export type { CardSuitLetter } from "./ui/svg.types.ts";
