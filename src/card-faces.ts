/**
 * The faces of the cards, drawn as SVG in the same 100 by 140 box as the
 * backs: plain (unless said), four colour, and the English pattern with its
 * drawn kings, queens and jacks, which is its own entry point because of its
 * size. Jokers too (`RJ`, `BJ`), for a table of your own.
 *
 * ```ts
 * import { cardFaceSvg, cardFaceUrl, loadCardDesign } from "@johnmorrisdotca/toranpu/card-faces";
 *
 * element.innerHTML = cardFaceSvg("QS");
 * image.src = cardFaceUrl("TD", { design: "four-colour" });
 * const english = await loadCardDesign("english");
 * element.innerHTML = cardFaceSvg("KS", { design: english });
 * ```
 *
 * Your own faces: register a design, with art for the standard cards, for cards no deck has (a territory card, a card a game
 * invents), or both, and ask for it by its name on any card, hand, pile or table.
 *
 * ```ts
 * import { registerCardDesign, cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";
 *
 * registerCardDesign({
 *   name: "frontier",
 *   box: [100, 140],
 *   art: {},
 *   draw: (card) => (card.startsWith("land-") ? `<text x="50" y="76" text-anchor="middle" font-size="12">${card.slice(5)}</text>` : null),
 *   label: (card) => `Territory ${card.slice(5)}`,
 * });
 * element.innerHTML = cardFaceSvg("land-ridge", { design: "frontier" });
 * ```
 */
export { CARD_DESIGNS, CARD_FACE_COLOURS, CARD_FACE_PROPERTIES, JOKERS, EXTRA_CARDS, EXTRA_LIMITS, cardFaceSvg, cardFaceUrl, faceName, isCardFace, loadCardDesign, pipPlaces } from "./ui/cardFaces.ts";
export { cardFaceFromArt } from "./ui/cardFaces.ts";
export type { CardDesignName, CardFaceOptions } from "./ui/cardFaces.ts";
export type { CardDesign } from "./ui/cardFaces.types.ts";
export { CUSTOM_CARD_ID, registerDesign as registerCardDesign, registeredDesignNames as registeredCardDesigns, unregisterDesign as unregisterCardDesign } from "./ui/registry.ts";
export { cleanMarkup, safeImageUrl } from "./ui/markup.ts";
