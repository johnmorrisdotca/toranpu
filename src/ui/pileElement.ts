import { STRINGS, fillIn } from "../strings.ts";
import { faceName } from "./cardFaces.ts";
import { followLanguage, cardDrawing, designNamed, ElementBase, languageOf, widthOf } from "./elementKit.ts";
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
 */
export class ToranpuPile extends ElementBase {
  static get observedAttributes(): readonly string[] {
    return ["cards", "count", "face-down", "messiness", "seed", "depth", "design", "back", "back-colour", "mark", "size", "width", "lang"];
  }

  #root: ShadowRoot | null = null;
  #forget: (() => void) | null = null;

  /** The pile's cards, bottom first. Setting them draws the pile afresh. */
  get cards(): string[] {
    return readHand(this.getAttribute("cards")) ?? [];
  }
  set cards(cards: readonly string[]) {
    this.setAttribute("cards", cards.join(" "));
  }

  /** How many cards the pile holds: its cards, or its `count` when it has none. */
  get count(): number {
    const cards = this.cards;
    if (cards.length > 0) return cards.length;
    const count = Math.floor(Number(this.getAttribute("count")));
    return Number.isFinite(count) && count > 0 ? Math.min(MOST_IN_A_PILE, count) : 0;
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
    const root = this.#root as ShadowRoot;
    const cards = this.cards;
    const count = this.count;
    const down = this.hasAttribute("face-down") || cards.length === 0;
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
    this.setAttribute("aria-label", count === 0 ? words.pileEmpty : down || top === undefined ? fillIn(words.pileFaceDown, { n: count }) : fillIn(words.pileFaceUp, { n: count, card: faceName(top, language) }));
    // Room on every side for the most any card could be nudged or turned at this messiness and depth, whatever the pile holds,
    // so a pile keeps its size as cards come and go and never overlaps what is next to it.
    const reach = 0.06 + 0.012 * depth + 0.32 * messiness;
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
:host { display: inline-block; vertical-align: middle; }
.pile { position: relative; width: calc(var(--toranpu-w, 70px) * (1 + 2 * var(--reach))); aspect-ratio: auto; height: calc(var(--toranpu-w, 70px) * (1.4 + 2 * var(--reach))); }
.layer { position: absolute; left: calc(var(--toranpu-w, 70px) * (var(--reach) + var(--x))); top: calc(var(--toranpu-w, 70px) * (var(--reach) + var(--y))); width: var(--toranpu-w, 70px); aspect-ratio: 5 / 7; transform: rotate(var(--r)); }
.layer svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 .5px 1px rgba(0,0,0,.3)); }
.empty { position: absolute; left: calc(var(--toranpu-w, 70px) * var(--reach)); top: calc(var(--toranpu-w, 70px) * var(--reach)); width: var(--toranpu-w, 70px); aspect-ratio: 5 / 7; border: 2px dashed currentColor; border-radius: 7%; opacity: .35; box-sizing: border-box; }
`;
