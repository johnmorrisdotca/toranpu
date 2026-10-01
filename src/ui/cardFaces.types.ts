/**
 * A set of drawn cards: its name, the box each card is drawn in, and each
 * card's drawing (what goes inside an <svg> of that box) by its id, `KS` for
 * the king of spades and `RJ` and `BJ` for the red and black jokers. A card
 * the set has no drawing for is drawn plain.
 *
 * A set may also be a page's own: faces for the standard cards in its own art,
 * or cards no deck has, such as a territory card or a card a game invents. Give
 * such a card any id of letters, digits, `-`, `_`, `.` or `:` (up to 40), and
 * either its drawing in `art` or a function that draws it in `draw`. See
 * `registerCardDesign`.
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
  /**
   * Cards drawn by a function rather than from `art`: given a card's id and the language, the drawing (what goes inside
   * an <svg> of `box`), or null where the set has no such card. Use it for a card whose words change with the language,
   * or whose picture is worked out from its id, such as a territory card.
   */
  draw?: (card: string, context: { language: "en" | "ja" }) => string | null;
  /** What a screen reader says for a card of the set, in the language asked for; null or nothing for a card the set leaves to its usual name (a standard card), or to its id (any other). */
  label?: (card: string, language: "en" | "ja") => string | null | undefined;
  /**
   * How the card is framed. `"paper"` (unless said) draws the card's paper and edge under the art, as the standard
   * cards have; `"none"` draws nothing under it, for art that fills the whole card and draws its own edge.
   */
  frame?: "paper" | "none";
};
