/**
 * A set of drawn cards: its name, the box each card is drawn in, and each
 * card's drawing (what goes inside an <svg> of that box) by its id, `KS` for
 * the king of spades and `RJ` and `BJ` for the red and black jokers. A card
 * the set has no drawing for is drawn plain.
 */
export type CardDesign = {
  /** The design's name, as `cardFaceSvg` and an element's `design` attribute take it. */
  name: string;
  /** The width and height each card is drawn in. */
  box: readonly [number, number];
  /** Each card's drawing, by its id. */
  art: Readonly<Record<string, string>>;
  /** Where the set has no drawing for a card, the set that draws it instead; then plain. */
  fallback?: CardDesign;
};
