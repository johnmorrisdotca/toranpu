import { STRINGS, fillIn } from "../strings.ts";
import { faceName } from "./card-faces.ts";
import { writeElementAttribute, elementTheme, isOn, attributeText, followLanguage, cardDrawing, designNamed, ElementBase, languageOf, widthOf } from "./element-kit.ts";
import { pileLayout, readHand } from "./layout.ts";

/** The most cards a face-down pile is counted to, so a pile given an absurd count draws in no time. */
const MOST_IN_A_PILE = 1000;

/**
 * A PILE OF CARDS ON ANY PAGE: `<toranpu-pile>`, a stock to draw from or a
 * discard pile, its top card on top and the cards under it showing as a
 * stack, from neatly squared to very messy. Seeded, so the same pile always
 * looks the same, and a card put on top moves none of those under it.
 *
 * ```html
 * <toranpu-pile count="24" face-down messiness="0.4" seed="7"></toranpu-pile>
 * <toranpu-pile cards="3C 9D QS 7H" messiness="0.6"></toranpu-pile>
 * ```
 *
 * Attributes, all optional:
 *   cards       the pile from the bottom up, its top card last: ids separated by spaces or commas, or one-letter codes
 *   count       for a face-down pile, how many cards, with no need to say which
 *   face-down   every card shows its back, and no face is in the page
 *   messiness   from 0 (squared up neatly) to 1 (very messy); unless said, 0.3
 *   seed        the pile's own seed, a whole number; unless said, 1
 *   depth       how many cards under the top are drawn at most; unless said, 10
 *   design, back, back-colour, mark, size, width, lang   as on `<toranpu-card>`
 * @example
 * ```ts
 * import { ToranpuPile } from "@johnmorrisdotca/toranpu/element";
 * console.log(ToranpuPile.observedAttributes.includes("lang")); // true
 * ```
 */
export class ToranpuPile extends ElementBase {
  get faceDown(): boolean { return isOn(this, "face-down"); }
  set faceDown(value: boolean | string | null | undefined) { writeElementAttribute(this, "face-down", value, true); }
  get ["face-down"](): boolean { return isOn(this, "face-down"); }
  set ["face-down"](value: boolean | string | null | undefined) { writeElementAttribute(this, "face-down", value, true); }
  get messiness(): string | null { return this.getAttribute("messiness"); }
  set messiness(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "messiness", value); }
  get seed(): string | null { return this.getAttribute("seed"); }
  set seed(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "seed", value); }
  get depth(): string | null { return this.getAttribute("depth"); }
  set depth(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "depth", value); }
  get design(): string | null { return this.getAttribute("design"); }
  set design(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "design", value); }
  get back(): string | null { return this.getAttribute("back"); }
  set back(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "back", value); }
  get backColour(): string | null { return this.getAttribute("back-colour"); }
  set backColour(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "back-colour", value); }
  get ["back-colour"](): string | null { return this.getAttribute("back-colour"); }
  set ["back-colour"](value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "back-colour", value); }
  get backImage(): string | null { return this.getAttribute("back-image"); }
  set backImage(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "back-image", value); }
  get ["back-image"](): string | null { return this.getAttribute("back-image"); }
  set ["back-image"](value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "back-image", value); }
  get backLogo(): string | null { return this.getAttribute("back-logo"); }
  set backLogo(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "back-logo", value); }
  get ["back-logo"](): string | null { return this.getAttribute("back-logo"); }
  set ["back-logo"](value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "back-logo", value); }
  get mark(): string | null { return this.getAttribute("mark"); }
  set mark(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "mark", value); }
  get size(): string | null { return this.getAttribute("size"); }
  set size(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "size", value); }
  get width(): string | null { return this.getAttribute("width"); }
  set width(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "width", value); }
  get theme(): string | null { return this.getAttribute("theme"); }
  set theme(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "theme", value); }
  get label(): string | null { return this.getAttribute("label"); }
  set label(value: string | number | readonly string[] | null | undefined) { writeElementAttribute(this, "label", value); }

  static get observedAttributes(): readonly string[] {
    return ["cards", "count", "face-down", "messiness", "seed", "depth", "design", "back", "back-colour", "back-image", "back-logo", "mark", "size", "width", "lang", "theme", "label"];
  }

  #root: ShadowRoot | null = null;
  #forget: (() => void) | null = null;

  /** The pile's cards, bottom first. Setting them, to a list or to text such as `"3C 9D"`, draws the pile afresh. */
  get cards(): string[] {
    return readHand(this.getAttribute("cards")) ?? [];
  }
  set cards(cards: string | readonly string[]) {
    this.setAttribute("cards", attributeText(cards) ?? "");
  }

  /** How many cards the pile holds: its cards, or its `count` when it has none. Setting it sets the `count` attribute, for a face-down pile. */
  get count(): number {
    const cards = this.cards;
    if (cards.length > 0) return cards.length;
    const count = Math.floor(Number(this.getAttribute("count")));
    return Number.isFinite(count) && count > 0 ? Math.min(MOST_IN_A_PILE, count) : 0;
  }
  set count(count: number | string) {
    this.setAttribute("count", String(count));
  }

  connectedCallback(): void {
    this.#forget ??= followLanguage(() => this.#draw());
    this.#root ??= this.attachShadow({ mode: "open" });
    this.#draw();
  }

  disconnectedCallback(): void {
    this.#forget?.();
    this.#forget = null;
  }

  attributeChangedCallback(): void {
    if (this.#root !== null) this.#draw();
  }

  #number(name: string, fallback: number): number {
    const value = Number(this.getAttribute(name));
    return this.hasAttribute(name) && Number.isFinite(value) ? value : fallback;
  }

  #draw(): void {
    elementTheme(this);
    const root = this.#root as ShadowRoot;
    const cards = this.cards;
    const count = this.count;
    const down = isOn(this, "face-down") || cards.length === 0;
    const language = languageOf(this);
    const { design, ready } = designNamed(this.getAttribute("design"));
    if (ready !== null) void ready.then(() => this.#draw());
    const messiness = Math.min(1, Math.max(0, this.#number("messiness", 0.3)));
    const depth = Math.min(52, Math.max(0, Math.floor(this.#number("depth", 10))));
    const places = pileLayout(count, { messiness, seed: Math.floor(this.#number("seed", 1)), depth });
    const shown = cards.slice(cards.length - places.length);
    const words = STRINGS[language];
    const top = cards[cards.length - 1];
    this.setAttribute("role", "img");
    this.setAttribute("aria-label", this.getAttribute("label") ?? count === 0 ? words.pileEmpty : down || top === undefined ? fillIn(words.pileFaceDown, { n: count }) : fillIn(words.pileFaceUp, { n: count, card: faceName(top, language, typeof design === "object" && design !== null ? design : undefined) }));
    // Room on every side for the most any card could be nudged or turned at the MESSIEST a pile can be, at this depth, whatever
    // the pile holds and however messy it is now: so a pile is one predictable box, the same size squared up as scattered, as
    // cards come and go, and nothing beside it moves when the messiness changes. The cards lie in the middle of it.
    const reach = 0.06 + 0.012 * depth + 0.32;
    const layers = places
      .map((place, at) => {
        const card = down ? "AS" : (shown[at] as string);
        return `<div class="layer" style="--x:${place.x};--y:${place.y};--r:${place.rotate}deg">${cardDrawing(card, down, this, design, language)}</div>`;
      })
      .join("");
    root.innerHTML = `<style>${PILE_STYLE}</style><div class="pile" part="pile" style="--reach:${Math.round(reach * 1000) / 1000}">${count === 0 ? '<div class="empty" part="empty"></div>' : layers}</div>`;
    this.style.setProperty("--toranpu-w", widthOf(this));
  }
}

const PILE_STYLE = `
:host { display: inline-block; user-select: none; -webkit-user-select: none; vertical-align: middle; }
.pile { position: relative; width: calc(var(--toranpu-w, 70px) * (1 + 2 * var(--reach))); aspect-ratio: auto; height: calc(var(--toranpu-w, 70px) * (1.4 + 2 * var(--reach))); }
.layer { position: absolute; left: calc(var(--toranpu-w, 70px) * (var(--reach) + var(--x))); top: calc(var(--toranpu-w, 70px) * (var(--reach) + var(--y))); width: var(--toranpu-w, 70px); aspect-ratio: 5 / 7; transform: rotate(var(--r)); }
.layer svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 .5px 1px rgba(0,0,0,.3)); }
.empty { position: absolute; left: calc(var(--toranpu-w, 70px) * var(--reach)); top: calc(var(--toranpu-w, 70px) * var(--reach)); width: var(--toranpu-w, 70px); aspect-ratio: 5 / 7; border: 2px dashed currentColor; border-radius: 7%; opacity: .35; box-sizing: border-box; }
`;
