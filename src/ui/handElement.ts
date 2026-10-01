import { STRINGS, fillIn } from "../strings.ts";
import { namesList } from "../words.ts";
import { faceName } from "./cardFaces.ts";
import { followLanguage, cardDrawing, designNamed, ElementBase, isOn, languageOf, lessMotion, pageSounds, widthOf } from "./elementKit.ts";
import { handLayout, readHand, type CardPlace } from "./layout.ts";

/** How a hand's cards are turned face down or face up. */
export type HandTurnOptions = {
  /** One card after another, from the first, rather than all at once. Unless said, all at once. */
  oneByOne?: boolean;
  /** Milliseconds between one card and the next, one by one. Unless said, 110. */
  gap?: number;
};

/** How many backs a squared-up bundle shows, whatever the hand: a bundle never tells how many cards are in it. */
export const BUNDLE_BACKS = 3;

/**
 * A HAND OF CARDS ON ANY PAGE: `<toranpu-hand cards="AS KH QD">`, fanned, in
 * any design and with any back. It can be turned face down where it lies, all
 * at once or one card after another, and back; squared up into one face-down
 * bundle ("scrunched") that shows neither the cards nor how many there are;
 * and held closed, squared up with only the top card showing, to open into a
 * fan on a tap.
 *
 * ```html
 * <toranpu-hand cards="AS KH QD JC 10S" design="english" closed="0.9" reveal></toranpu-hand>
 * ```
 *
 * Attributes, all optional:
 *   cards       the hand: ids separated by spaces or commas (`AS KH 10D`), or the deck's one-letter codes
 *   face-down   every card shows its back; their faces are not in the page
 *   scrunched   squared up into one face-down bundle: no faces, and no count, in the page
 *   closed      how closed the hand lies, from 0 (a clear fan) to 1 (squared up, only the top card showing)
 *   reveal      a tap, Enter or Space opens a closed hand into a fan, and closes it again
 *   design, back, back-colour, mark, size, width, lang, sound   as on `<toranpu-card>`
 *
 * Methods: `hide(options?)` and `show(options?)` turn the cards over, one by
 * one if asked; `scrunch()` and `spread()` square the hand up and lay it out
 * again; `open()` and `close()` fan it and square it. Each returns a promise
 * that settles when the cards have finished moving. The motion is skipped on
 * a device that asks for less. Each change is a `toranpu-hand` event that
 * bubbles, its detail `{ faceDown, scrunched, open }`.
 */
export class ToranpuHand extends ElementBase {
  static get observedAttributes(): readonly string[] {
    return ["cards", "face-down", "scrunched", "closed", "reveal", "design", "back", "back-colour", "mark", "size", "width", "lang"];
  }

  #root: ShadowRoot | null = null;
  #forget: (() => void) | null = null;
  /** How the cards are turned over next: one by one with this gap, or all at once (0). */
  #stagger = 0;
  /** Whether the next change moves the cards (true) or simply draws them where they end. */
  #moving = false;
  /** What is on screen now. */
  #shown: { down: boolean; scrunched: boolean; open: number } | null = null;
  #settle: (() => void) | null = null;
  #timer: ReturnType<typeof setTimeout> | null = null;

  /** The cards of the hand, as ids. Setting them lays the hand out afresh. */
  get cards(): string[] {
    return readHand(this.getAttribute("cards")) ?? [];
  }
  set cards(cards: readonly string[]) {
    this.setAttribute("cards", cards.join(" "));
  }

  /** Turn every card face down where it lies: all at once, or one after another. */
  hide(options: HandTurnOptions = {}): Promise<void> {
    return this.#change(() => this.toggleAttribute("face-down", true), options, "flip");
  }

  /** Turn every card face up again. */
  show(options: HandTurnOptions = {}): Promise<void> {
    return this.#change(() => this.toggleAttribute("face-down", false), options, "flip");
  }

  /** Square the hand up into one face-down bundle that shows neither the cards nor how many. */
  scrunch(): Promise<void> {
    return this.#change(() => this.toggleAttribute("scrunched", true), {}, "gather");
  }

  /** Lay a squared-up hand out again, as it was. */
  spread(): Promise<void> {
    return this.#change(() => this.toggleAttribute("scrunched", false), {}, "fan");
  }

  /** Open a closed hand into a clear fan. */
  open(): Promise<void> {
    return this.#change(() => this.setAttribute("closed", "0"), {}, "fan");
  }

  /** Square the hand up so that only the top card shows: to `closed` (unless said, all the way). */
  close(closed = 1): Promise<void> {
    return this.#change(() => this.setAttribute("closed", String(closed)), {}, "gather");
  }

  #change(apply: () => void, options: HandTurnOptions, sound: "flip" | "gather" | "fan"): Promise<void> {
    const before = this.#state();
    this.#stagger = options.oneByOne === true ? Math.max(0, options.gap ?? 110) : 0;
    this.#moving = !lessMotion();
    return new Promise((done) => {
      this.#settle?.();
      this.#settle = done;
      apply();
      const after = this.#state();
      const count = this.cards.length;
      if (isOn(this, "sound") && (before.down !== after.down || before.scrunched !== after.scrunched || before.open !== after.open)) pageSounds().play(sound, sound === "flip" ? { count, gap: this.#stagger || 25 } : {});
      // A change that changed nothing settles at once.
      if (before.down === after.down && before.scrunched === after.scrunched && before.open === after.open) this.#finish();
    });
  }

  #state(): { down: boolean; scrunched: boolean; open: number } {
    const closed = Number(this.getAttribute("closed"));
    return { down: this.hasAttribute("face-down"), scrunched: this.hasAttribute("scrunched"), open: Number.isFinite(closed) ? 1 - Math.min(1, Math.max(0, closed)) : 1 };
  }

  connectedCallback(): void {
    this.#forget ??= followLanguage(() => this.#draw());
    if (this.#root === null) {
      this.#root = this.attachShadow({ mode: "open" });
      const toggle = () => {
        if (!this.hasAttribute("reveal") || this.hasAttribute("scrunched")) return;
        const now = this.#state();
        if (now.open < 1) {
          // Closed again, it closes as far as it was.
          this.#closedBefore = 1 - now.open;
          void this.open();
        } else void this.close(this.#closedBefore);
      };
      this.addEventListener("click", toggle);
      this.addEventListener("keydown", (event) => {
        if (!this.hasAttribute("reveal") || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        toggle();
      });
    }
    this.#draw();
  }

  /** How closed the hand was before a tap opened it, which the next tap closes it to again. */
  #closedBefore = 1;

  disconnectedCallback(): void {
    this.#forget?.();
    this.#forget = null;
  }

  attributeChangedCallback(): void {
    if (this.#root !== null) this.#draw();
  }

  #finish(): void {
    const done = this.#settle;
    this.#settle = null;
    done?.();
  }

  #draw(): void {
    const root = this.#root as ShadowRoot;
    const cards = this.cards;
    const language = languageOf(this);
    const { design, ready } = designNamed(this.getAttribute("design"));
    if (ready !== null) void ready.then(() => this.#draw());
    const target = this.#state();
    const moving = this.#moving && this.#shown !== null;
    // Drawn where it ends, unless it is to move there.
    const from = moving ? (this.#shown ?? target) : target;
    const stagger = this.#stagger;
    this.#moving = false;
    this.#stagger = 0;
    if (this.#timer !== null) clearTimeout(this.#timer);

    // What a screen reader hears: the cards, or that they are face down and how many, or only that it is a bundle.
    const words = STRINGS[language];
    const label = target.scrunched ? words.handScrunched : target.down ? fillIn(words.handFaceDown, { n: cards.length }) : fillIn(words.handLabel, { cards: namesList(cards.map((card) => faceName(card, language)), language) });
    this.setAttribute("aria-label", label);
    const reveals = this.hasAttribute("reveal") && !target.scrunched;
    this.setAttribute("role", reveals ? "button" : "group");
    if (reveals) {
      this.setAttribute("aria-expanded", String(target.open === 1));
      if (this.tabIndex < 0) this.tabIndex = 0;
    } else {
      this.removeAttribute("aria-expanded");
      this.removeAttribute("tabindex");
    }

    // The cards are drawn where they start, then moved to where they end; a face is drawn only while some card may show it.
    const bundle = from.scrunched && target.scrunched;
    const count = bundle ? BUNDLE_BACKS : cards.length;
    const startPlaces = this.#places(count, from);
    const endPlaces = this.#places(count, target);
    const facesNeeded = !bundle && (!from.down || !target.down) && !(target.scrunched && !moving);
    const slots = Array.from({ length: count }, (_, at) => {
      const card = bundle ? "" : (cards[at] as string);
      const face = facesNeeded && !bundle ? cardDrawing(card, false, this, design, language) : "";
      const back = cardDrawing(card || "AS", true, this, design, language);
      return `<div class="slot" part="card" data-at="${at}"><div class="turn"><div class="side face">${face}</div><div class="side back">${back}</div></div></div>`;
    });
    const span = Math.max(...endPlaces.map((place) => place.x), ...(moving ? startPlaces.map((place) => place.x) : [0]), 0);
    const drop = Math.max(...endPlaces.map((place) => place.y), 0);
    // A card turned about a point below it swings out sideways: room is kept on both sides for the most any card turns.
    const turn = Math.max(...endPlaces.map((place) => Math.abs(place.rotate)), ...(moving ? startPlaces.map((place) => Math.abs(place.rotate)) : [0]), 0);
    const side = Math.round(1.72 * Math.sin((turn * Math.PI) / 180) * 1000) / 1000;
    // The hand is as wide as its cards ask, and never wider than the room it is given: in less room the cards are drawn smaller.
    const across = Math.round((1 + span + 2 * side + 0.12) * 1000) / 1000;
    root.innerHTML = `<style>${HAND_STYLE}</style><div class="hand" part="hand" style="--span:${span};--drop:${drop};--side:${side};--across:${across}">${slots.join("")}</div>`;
    this.style.setProperty("--toranpu-w", widthOf(this));
    this.style.setProperty("--toranpu-across", String(across));
    const all = [...root.querySelectorAll<HTMLElement>(".slot")];
    const place = (slot: HTMLElement, spot: CardPlace | undefined, down: boolean) => {
      if (spot === undefined) return;
      slot.style.setProperty("--x", String(spot.x));
      slot.style.setProperty("--y", String(spot.y));
      slot.style.setProperty("--r", `${spot.rotate}deg`);
      slot.dataset.down = String(down);
    };
    all.forEach((slot, at) => place(slot, (moving ? startPlaces : endPlaces)[at], moving ? from.down || from.scrunched : target.down || target.scrunched));
    this.#shown = target;
    if (!moving) {
      this.#announce(target);
      this.#finish();
      return;
    }
    const hand = root.querySelector(".hand") as HTMLElement;
    hand.dataset.moving = "true";
    void hand.offsetWidth;
    all.forEach((slot, at) => {
      slot.style.setProperty("--delay", `${stagger * at}ms`);
      place(slot, endPlaces[at], target.down || target.scrunched);
    });
    const length = 480 + stagger * Math.max(0, count - 1);
    this.#timer = setTimeout(() => {
      this.#timer = null;
      // Once still, drawn again where it lies: the faces of cards face down, and a scrunched hand's cards, leave the page.
      this.#draw();
      this.#announce(target);
    }, length + 40);
  }

  /** Where each card lies for a state: squared up into a bundle when scrunched, fanned as open as asked otherwise. */
  #places(count: number, state: { open: number; scrunched: boolean }): CardPlace[] {
    if (state.scrunched) return Array.from({ length: count }, (_, at) => ({ x: Math.min(at, BUNDLE_BACKS - 1) * 0.025, y: Math.min(at, BUNDLE_BACKS - 1) * 0.02, rotate: (Math.min(at, BUNDLE_BACKS - 1) - 1) * 1.5 }));
    return handLayout(count, { open: state.open });
  }

  /** The state last told to the page, so each change is told once, and the first drawing not at all. */
  #told: string | null = null;

  #announce(state: { down: boolean; scrunched: boolean; open: number }): void {
    const now = JSON.stringify(state);
    const first = this.#told === null;
    if (now === this.#told) return;
    this.#told = now;
    if (first) return;
    this.dispatchEvent(new CustomEvent("toranpu-hand", { bubbles: true, composed: true, detail: { faceDown: state.down, scrunched: state.scrunched, open: state.open } }));
  }
}

const HAND_STYLE = `
:host { display: inline-block; vertical-align: middle; -webkit-tap-highlight-color: transparent; max-width: 100%; width: calc(var(--toranpu-w, 70px) * var(--toranpu-across, 1)); container-type: inline-size; }
:host([reveal]) { cursor: pointer; }
:host(:focus-visible) { outline: 3px solid var(--toranpu-focus, #b5452c); outline-offset: 4px; border-radius: 8px; }
.hand { --cw: min(var(--toranpu-w, 70px), calc(100cqw / var(--across))); position: relative; width: 100%; height: calc(var(--cw) * (1.4 + var(--drop) + .14 + var(--side) * .45)); }
.slot { position: absolute; left: calc(var(--cw) * (var(--x) + var(--side) + .06)); top: calc(var(--cw) * (var(--y) + .05)); width: var(--cw); aspect-ratio: 5 / 7; transform: rotate(var(--r)); transform-origin: 50% 120%; perspective: 800px; }
.turn { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
.slot[data-down="true"] .turn { transform: rotateY(180deg); }
.side { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.back { transform: rotateY(180deg); }
.side svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 1px 2px rgba(0,0,0,.28)); }
.hand[data-moving="true"] .slot { transition: left .45s cubic-bezier(.3,.7,.3,1), top .45s cubic-bezier(.3,.7,.3,1), transform .45s cubic-bezier(.3,.7,.3,1); }
.hand[data-moving="true"] .turn { transition: transform var(--toranpu-flip-ms, 450ms) cubic-bezier(.3,.7,.3,1) var(--delay, 0ms); }
@media (prefers-reduced-motion: reduce) { .hand[data-moving="true"] .slot, .hand[data-moving="true"] .turn { transition: none; } }
`;
