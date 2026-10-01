import { followLanguage, cardDrawing, cardLabel, designNamed, ElementBase, isOn, languageOf, lessMotion, markerHtml, MARKER_STYLE, pageSounds, reflectMethod, spinElement, widthOf, type SpinOptions } from "./elementKit.ts";
import { STRINGS, fillIn, type Language } from "../strings.ts";
import { cardFaceFromArt, isCardFace } from "./cardFaces.ts";
import type { CardDesign } from "./cardFaces.types.ts";
import { designDraws } from "./registry.ts";

/** What a card's `face` function is told: the language the card speaks, and the design it names. */
export type CardFaceContext = { language: Language; design: "plain" | "four-colour" | CardDesign | null };

/**
 * A function that draws a card's face: given the card's id and its context, SVG markup (drawn on the card's paper in a box
 * 100 by 140, or a whole `<svg>` document), or an element, or null to draw the card as its design does.
 */
export type CardFaceRenderer = (card: string, context: CardFaceContext) => string | Node | null;

/**
 * ONE CARD ON ANY PAGE: `<toranpu-card card="QS">`, in any design and with any
 * back, face up or face down, turned over by a tap when it has `flip`.
 *
 * ```html
 * <toranpu-card card="KS" design="english" back="classic-blue" flip></toranpu-card>
 * ```
 *
 * Attributes, all optional but `card`:
 *   card          the card: `QS`, `TD`, `RJ`, `BJ`; or the id of a card of a design the page registered
 *   design        `plain` (unless said), `four-colour` or `english`, which is fetched the first time it is asked for; or the name of a design the page registered
 *   back          `classic-red` (unless said), `classic-blue` or `ink-dots`, or the name of a back the page registered; `back-colour`, `back-image`, `back-logo` and `mark` as `cardBackSvg` takes them
 *   label         what a screen reader says for a card of your own, which has no name in any deck
 *   face-down     shows the back; the face is not in the page while it is down
 *   flip          a tap, Enter or Space turns it over, with a turn that a device asking for less motion skips
 *   marked        a mark on its corner, seen face up and face down, to follow it as it moves
 *   size          `small`, `medium` (unless said) or `large`; or `width` in pixels; or the page's `--toranpu-card-width`
 *   sound         the turn makes a sound
 *   lang          `ja` for Japanese names; the page's language unless said
 *
 * Your own face and back: put an element in the card with `slot="face"` (or `slot="back"`), and it is drawn
 * as the face (or the back) in place of the card's own, in the box of the card. A `face` property that is a function draws
 * the face from the card's id (`CardFaceRenderer`). Neither is in the page while the card lies the other way up.
 *
 * Each turn is a `toranpu-flip` event that bubbles, with `{ card, faceDown }` as its detail. `spin(options?)`
 * spins it where it lies, slowing to a stop as it was.
 */
export class ToranpuCard extends ElementBase {
  static get observedAttributes(): readonly string[] {
    return ["card", "design", "back", "back-colour", "back-image", "back-logo", "mark", "label", "face-down", "flip", "marked", "size", "width", "lang"];
  }

  #root: ShadowRoot | null = null;
  #forget: (() => void) | null = null;
  #watch: MutationObserver | null = null;
  #renderer: CardFaceRenderer | null = null;
  #turning = false;

  /** Whether the card shows its back. Setting it turns the card over, as a tap would, but with no event and no sound. */
  get faceDown(): boolean {
    return this.hasAttribute("face-down");
  }
  set faceDown(down: boolean) {
    this.toggleAttribute("face-down", down);
  }

  /** A function that draws this card's face from its id, in place of its design's (`CardFaceRenderer`); null for none. Setting it draws the card afresh. */
  get face(): CardFaceRenderer | null {
    return this.#renderer;
  }
  set face(renderer: CardFaceRenderer | null) {
    this.#renderer = typeof renderer === "function" ? renderer : null;
    if (this.#root !== null) this.#draw();
  }

  /** Turn the card over, as a tap does: the turn, the sound if it has `sound`, and the `toranpu-flip` event. */
  flip(): void {
    const card = this.getAttribute("card") ?? "";
    if (!this.#canShow(card)) return;
    // Turning, both sides are drawn, so the face is in the page only while it can be seen.
    this.#turning = !lessMotion();
    this.faceDown = !this.faceDown;
    if (isOn(this, "sound")) pageSounds().play("flip");
    this.dispatchEvent(new CustomEvent("toranpu-flip", { bubbles: true, composed: true, detail: { card, faceDown: this.faceDown } }));
  }

  /** Spin the card where it lies, as a flick sets a card turning on a table: fast, then slowing to a stop as it was (`SpinOptions`). */
  spin(options: SpinOptions = {}): Promise<void> {
    const spinning = this.#root?.querySelector<HTMLElement>(".spin");
    return spinning === null || spinning === undefined ? Promise.resolve() : spinElement(spinning, options);
  }

  connectedCallback(): void {
    this.#forget ??= followLanguage(() => this.#draw());
    if (this.#root === null) {
      this.#root = this.attachShadow({ mode: "open" });
      this.addEventListener("click", () => {
        if (this.hasAttribute("flip")) this.flip();
      });
      this.addEventListener("keydown", (event) => {
        if (!this.hasAttribute("flip") || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        this.flip();
      });
    }
    // A face or back put into the card, or taken out, after it is drawn.
    if (this.#watch === null && typeof MutationObserver !== "undefined") {
      this.#watch = new MutationObserver(() => this.#draw());
      this.#watch.observe(this, { childList: true, attributes: true, attributeFilter: ["slot"], subtree: true });
    }
    this.#draw();
  }

  disconnectedCallback(): void {
    this.#forget?.();
    this.#forget = null;
    this.#watch?.disconnect();
    this.#watch = null;
  }

  attributeChangedCallback(): void {
    if (this.#root !== null) this.#draw();
  }

  /** Whether something is put in the card as its face or its back. */
  #slotted(name: "face" | "back"): boolean {
    return Array.from(this.children).some((child) => child.getAttribute("slot") === name);
  }

  /** Whether the card has a face to show: one a design draws, one the page's function or an element draws, or a standard card. */
  #canShow(card: string): boolean {
    if (this.#slotted("face") || this.#renderer !== null) return true;
    if (isCardFace(card)) return true;
    const { design } = designNamed(this.getAttribute("design"));
    return typeof design === "object" && design !== null && designDraws(design, card);
  }

  #draw(): void {
    const root = this.#root as ShadowRoot;
    const card = this.getAttribute("card") ?? "";
    const language = languageOf(this);
    const { design, ready } = designNamed(this.getAttribute("design"));
    if (ready !== null) void ready.then(() => this.#draw());
    const known = this.#canShow(card);
    const down = this.faceDown;
    const turning = this.#turning;
    this.#turning = false;
    const flips = this.hasAttribute("flip");
    this.setAttribute("role", flips ? "button" : "img");
    if (flips) this.tabIndex = this.tabIndex < 0 ? 0 : this.tabIndex;
    else this.removeAttribute("tabindex");
    // Marked: the attribute is all it takes on one card.
    const marked = known && this.hasAttribute("marked");
    const given = this.getAttribute("label");
    const name = !down && given !== null && given !== "" ? given : cardLabel(card, down, language, design);
    this.setAttribute("aria-label", known ? (marked ? fillIn(STRINGS[language].cardMarked, { card: name }) : name) : "");
    // The side not shown is drawn only for the length of a turn, so the face of a card lying face down is not in the page.
    const showFace = known && (!down || turning);
    const showBack = known && (down || turning);
    const madeFace = showFace && !this.#slotted("face") ? this.#renderer?.(card, { language, design }) : null;
    const faceNode = madeFace instanceof Object && "nodeType" in madeFace ? madeFace : null;
    let face = "";
    let customFace = false;
    if (showFace && this.#slotted("face")) {
      face = '<slot name="face"></slot>';
      customFace = true;
    } else if (typeof madeFace === "string") face = cardFaceFromArt(madeFace, { language });
    else if (faceNode !== null) customFace = true;
    else if (showFace) face = cardDrawing(card, false, this, design, language);
    const customBack = showBack && this.#slotted("back");
    const back = customBack ? '<slot name="back"></slot>' : showBack ? cardDrawing(card, true, this, design, language) : "";
    root.innerHTML = `<style>${CARD_STYLE}</style><div class="spin"><div class="card" part="card" data-down="${down}"${turning ? ' data-turning="true"' : ""}><div class="side face" part="face"${customFace ? ' data-custom="true"' : ""}>${face}</div><div class="side back" part="back"${customBack ? ' data-custom="true"' : ""}>${back}</div></div>${markerHtml(marked)}</div>`;
    if (faceNode !== null) root.querySelector(".side.face")?.append(faceNode instanceof Element ? cleanElement(faceNode) : faceNode);
    this.style.setProperty("--toranpu-w", widthOf(this));
    if (turning) {
      const inner = root.querySelector(".card") as HTMLElement;
      // Start from the side that was showing, then turn.
      inner.dataset.down = String(!down);
      void inner.offsetWidth;
      inner.dataset.down = String(down);
      // Once turned, the side that went out of sight is taken out of the page; the timer is for a turn that never reports its end.
      let done = false;
      const settle = () => {
        if (done) return;
        done = true;
        this.#draw();
      };
      inner.addEventListener("transitionend", settle, { once: true });
      setTimeout(settle, 1500);
    }
  }
}

/** An element a page's function made, with scripts and handlers taken off it: it goes in as it is, for the page's own use. */
function cleanElement<T extends Element>(element: T): T {
  for (const attribute of [...element.attributes]) if (/^on/i.test(attribute.name)) element.removeAttribute(attribute.name);
  return element;
}

const CARD_STYLE = `
:host { display: inline-block; user-select: none; -webkit-user-select: none; width: var(--toranpu-w, 70px); aspect-ratio: 5 / 7; perspective: 800px; vertical-align: middle; -webkit-tap-highlight-color: transparent; }
:host([flip]) { cursor: pointer; }
:host(:focus-visible) { outline: 3px solid var(--toranpu-focus, #b5452c); outline-offset: 3px; border-radius: 7%; }
.spin { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
.card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform var(--toranpu-flip-ms, 450ms) cubic-bezier(.3, .7, .3, 1); }
.card[data-down="true"] { transform: rotateY(180deg); }
.side { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.back { transform: rotateY(180deg); }
.side svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 1px 2px rgba(0,0,0,.28)); }
.side[data-custom="true"] { overflow: hidden; border-radius: 7% / 5%; background: var(--toranpu-card, #fffdf8); box-shadow: 0 1px 2px rgba(0,0,0,.28); }
.side[data-custom="true"] > * { width: 100%; height: 100%; }
::slotted(*) { display: block; box-sizing: border-box; width: 100%; height: 100%; margin: 0; }
@media (prefers-reduced-motion: reduce) { .card { transition: none; } }
${MARKER_STYLE}
`;

reflectMethod(ToranpuCard, "flip");
