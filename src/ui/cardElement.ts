import { followLanguage, cardDrawing, cardLabel, designNamed, ElementBase, isOn, languageOf, lessMotion, pageSounds, widthOf } from "./elementKit.ts";
import { isCardFace } from "./cardFaces.ts";

/**
 * ONE CARD ON ANY PAGE: `<toranpu-card card="QS">`, in any design and with any
 * back, face up or face down, turned over by a tap when it has `flip`.
 *
 * ```html
 * <toranpu-card card="KS" design="english" back="classic-blue" flip></toranpu-card>
 * ```
 *
 * Attributes, all optional but `card`:
 *   card          the card: `QS`, `TD`, `RJ`, `BJ`
 *   design        `plain` (unless said), `four-colour` or `english`, which is fetched the first time it is asked for
 *   back          `classic-red` (unless said), `classic-blue` or `ink-dots`; `back-colour` and `mark` as `cardBackSvg` takes them
 *   face-down     shows the back; the face is not in the page while it is down
 *   flip          a tap, Enter or Space turns it over, with a turn that a device asking for less motion skips
 *   size          `small`, `medium` (unless said) or `large`; or `width` in pixels; or the page's `--toranpu-card-width`
 *   sound         the turn makes a sound
 *   lang          `ja` for Japanese names; the page's language unless said
 *
 * Each turn is a `toranpu-flip` event that bubbles, with `{ card, faceDown }` as its detail.
 */
export class ToranpuCard extends ElementBase {
  static get observedAttributes(): readonly string[] {
    return ["card", "design", "back", "back-colour", "mark", "face-down", "flip", "size", "width", "lang"];
  }

  #root: ShadowRoot | null = null;
  #forget: (() => void) | null = null;
  #turning = false;

  /** Whether the card shows its back. Setting it turns the card over, as a tap would, but with no event and no sound. */
  get faceDown(): boolean {
    return this.hasAttribute("face-down");
  }
  set faceDown(down: boolean) {
    this.toggleAttribute("face-down", down);
  }

  /** Turn the card over, as a tap does: the turn, the sound if it has `sound`, and the `toranpu-flip` event. */
  flip(): void {
    const card = this.getAttribute("card") ?? "";
    if (!isCardFace(card)) return;
    // Turning, both sides are drawn, so the face is in the page only while it can be seen.
    this.#turning = !lessMotion();
    this.faceDown = !this.faceDown;
    if (isOn(this, "sound")) pageSounds().play("flip");
    this.dispatchEvent(new CustomEvent("toranpu-flip", { bubbles: true, composed: true, detail: { card, faceDown: this.faceDown } }));
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
    this.#draw();
  }

  disconnectedCallback(): void {
    this.#forget?.();
    this.#forget = null;
  }

  attributeChangedCallback(): void {
    if (this.#root !== null) this.#draw();
  }

  #draw(): void {
    const root = this.#root as ShadowRoot;
    const card = this.getAttribute("card") ?? "";
    const known = isCardFace(card);
    const language = languageOf(this);
    const { design, ready } = designNamed(this.getAttribute("design"));
    if (ready !== null) void ready.then(() => this.#draw());
    const down = this.faceDown;
    const turning = this.#turning;
    this.#turning = false;
    const flips = this.hasAttribute("flip");
    this.setAttribute("role", flips ? "button" : "img");
    if (flips) this.tabIndex = this.tabIndex < 0 ? 0 : this.tabIndex;
    else this.removeAttribute("tabindex");
    this.setAttribute("aria-label", known ? cardLabel(card, down, language) : "");
    // The side not shown is drawn only for the length of a turn, so the face of a card lying face down is not in the page.
    const face = known && (!down || turning) ? cardDrawing(card, false, this, design, language) : "";
    const back = known && (down || turning) ? cardDrawing(card, true, this, design, language) : "";
    root.innerHTML = `<style>${CARD_STYLE}</style><div class="card" part="card" data-down="${down}"${turning ? ' data-turning="true"' : ""}><div class="side face" part="face">${face}</div><div class="side back" part="back">${back}</div></div>`;
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

const CARD_STYLE = `
:host { display: inline-block; width: var(--toranpu-w, 70px); aspect-ratio: 5 / 7; perspective: 800px; vertical-align: middle; -webkit-tap-highlight-color: transparent; }
:host([flip]) { cursor: pointer; }
:host(:focus-visible) { outline: 3px solid var(--toranpu-focus, #b5452c); outline-offset: 3px; border-radius: 7%; }
.card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform var(--toranpu-flip-ms, 450ms) cubic-bezier(.3, .7, .3, 1); }
.card[data-down="true"] { transform: rotateY(180deg); }
.side { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.back { transform: rotateY(180deg); }
.side svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 1px 2px rgba(0,0,0,.28)); }
@media (prefers-reduced-motion: reduce) { .card { transition: none; } }
`;
