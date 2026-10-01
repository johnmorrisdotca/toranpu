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
 */
export { CARD_DESIGNS, CARD_FACE_COLOURS, CARD_FACE_PROPERTIES, JOKERS, EXTRA_CARDS, EXTRA_LIMITS, cardFaceSvg, cardFaceUrl, faceName, isCardFace, loadCardDesign, pipPlaces } from "./ui/cardFaces.ts";
export type { CardDesignName, CardFaceOptions } from "./ui/cardFaces.ts";
export type { CardDesign } from "./ui/cardFaces.types.ts";
