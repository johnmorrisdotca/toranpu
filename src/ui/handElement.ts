import { STRINGS, fillIn } from "../strings.ts";
import { namesList } from "../words.ts";
import { faceName } from "./cardFaces.ts";
import { followLanguage, cardDrawing, designNamed, ElementBase, isOn, languageOf, lessMotion, pageSounds, widthOf } from "./elementKit.ts";
import { arrangeCards, handLayout, mixCards, readHand, replaceCard, tossCard, type CardLands, type CardOrder, type CardPlace } from "./layout.ts";

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
 *   scrunched   squared up into one bundle that never says how many; with face-down (as scrunch() leaves it), no faces
 *               in the page either; face up, its top card showing
 *   closed      how closed the hand lies, from 0 (a clear fan) to 1 (squared up, only the top card showing)
 *   reveal      a tap, Enter or Space opens a closed hand into a fan, and closes it again
 *   order       "rank" sorts the hand low to high, the ace high; "suit" groups it by suit, each in rank order;
 *               left out, the cards lie as they were dealt (`arrangeCards`)
 *   receive     where a card given by replace() lands: "front", or "end" (unless said)
 *   deal-after  given new cards, how many milliseconds the hand waits before it gathers the old ones in and
 *               opens on the new; a table gives each seat a little more, so the hands are dealt in turn
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
    return ["cards", "order", "receive", "deal-after", "face-down", "scrunched", "closed", "reveal", "design", "back", "back-colour", "mark", "size", "width", "lang"];
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
  /** A new deal on its way: the old cards gathering in, drawn in place of the new until they are squared up. */
  #dealing: { cards: string[]; target: { down: boolean; scrunched: boolean; open: number } } | null = null;
  #dealTimer: ReturnType<typeof setTimeout> | null = null;

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
    this.#scrunchTurned = false;
    return this.#change(() => this.toggleAttribute("face-down", false), options, "flip");
  }

  /**
   * Square the hand up into one face-down bundle that shows neither the cards nor how many. Turned
   * face up (`show()`), the bundle stays squared, its top card showing and still no count.
   */
  scrunch(): Promise<void> {
    return this.#change(() => {
      this.#scrunchTurned = !this.hasAttribute("face-down");
      this.toggleAttribute("scrunched", true);
      this.toggleAttribute("face-down", true);
    }, {}, "gather");
  }

  /** Lay a squared-up hand out again: face up if the scrunch turned it down, otherwise as it now faces. */
  spread(): Promise<void> {
    return this.#change(() => {
      this.toggleAttribute("scrunched", false);
      if (this.#scrunchTurned) this.toggleAttribute("face-down", false);
      this.#scrunchTurned = false;
    }, {}, "fan");
  }

  /** Whether the last scrunch turned a face-up hand down, so that spreading it turns it back; a turn by hand since forgets it. */
  #scrunchTurned = false;

  /** Sort the hand by rank, low to high with the ace high, the cards sliding to their places. */
  sort(): Promise<void> {
    return this.#reorder("rank");
  }

  /** Group the hand by suit (spades, hearts, clubs, diamonds), each suit in rank order. */
  group(): Promise<void> {
    return this.#reorder("suit");
  }

  /** Lay the hand out again in the order it was dealt. */
  unsort(): Promise<void> {
    return this.#reorder("dealt");
  }

  #reorder(order: CardOrder): Promise<void> {
    this.#moving = !lessMotion();
    return new Promise((done) => {
      this.#settle?.();
      this.#settle = done;
      const before = this.getAttribute("order") ?? "dealt";
      if (order === "dealt") this.removeAttribute("order");
      else this.setAttribute("order", order);
      if (isOn(this, "sound") && before !== order) pageSounds().play("fan");
      if (before === order) this.#finish();
    });
  }

  /** Mix the hand up: the same cards in another order, each sliding to its new place. A sorted hand is unsorted first. */
  mixUp(): Promise<void> {
    if (new Set(this.cards).size < 2) return Promise.resolve();
    return this.#change(() => {
      this.removeAttribute("order");
      this.setAttribute("cards", mixCards(this.cards).join(" "));
    }, {}, "gather", true);
  }

  /** Toss a card out of the hand: it lifts away, and the rest close up. Nothing happens for a card the hand does not hold. */
  toss(card: string): Promise<void> {
    return this.#tossThen(card, (cards) => tossCard(cards, card));
  }

  /**
   * Toss a card out and take another in its stead: the new one drops in at the front or the end, as `lands`
   * says, or as the hand's `receive` attribute says, or at the end.
   */
  replace(card: string, next: string, lands?: CardLands): Promise<void> {
    const where: CardLands = lands ?? (this.getAttribute("receive") === "front" ? "front" : "end");
    return this.#tossThen(card, (cards) => replaceCard(cards, card, next, where));
  }

  #tossThen(card: string, make: (cards: string[]) => string[]): Promise<void> {
    const cards = this.cards;
    if (!cards.includes(card)) return Promise.resolve();
    const lay = () => this.#change(() => this.setAttribute("cards", make(this.cards).join(" ")), {}, "play", true);
    const at = this.#onScreen.indexOf(card);
    const slot = at === -1 || lessMotion() ? null : (this.#root?.querySelectorAll<HTMLElement>(".slot")[at] ?? null);
    if (slot === null) return lay();
    // The card lifts up and away, turning a little as it goes; then the hand closes up after it.
    slot.style.transition = `transform ${TOSS_MS}ms ease-in, opacity ${TOSS_MS}ms ease-in`;
    slot.style.transform = "translateY(-115%) rotate(-14deg)";
    slot.style.opacity = "0";
    return new Promise((done) => setTimeout(() => void lay().then(done), TOSS_MS));
  }

  /** The cards as they lie on screen now, in their order: where a reordering moves each one from. */
  #onScreen: string[] = [];

  /** Open a closed hand into a clear fan. */
  open(): Promise<void> {
    return this.#change(() => this.setAttribute("closed", "0"), {}, "fan");
  }

  /** Square the hand up so that only the top card shows: to `closed` (unless said, all the way). */
  close(closed = 1): Promise<void> {
    return this.#change(() => this.setAttribute("closed", String(closed)), {}, "gather");
  }

  #change(apply: () => void, options: HandTurnOptions, sound: "flip" | "gather" | "fan" | "play", always = false): Promise<void> {
    const before = this.#state();
    this.#stagger = options.oneByOne === true ? Math.max(0, options.gap ?? 110) : 0;
    this.#moving = !lessMotion();
    return new Promise((done) => {
      this.#settle?.();
      this.#settle = done;
      // One change, however many attributes it sets: drawn and told once.
      this.#batching = true;
      this.#batched = false;
      apply();
      this.#batching = false;
      if (this.#batched && this.#root !== null) this.#draw();
      const after = this.#state();
      const count = this.cards.length;
      if (isOn(this, "sound") && (always || before.down !== after.down || before.scrunched !== after.scrunched || before.open !== after.open)) pageSounds().play(sound, sound === "flip" ? { count, gap: this.#stagger || 25 } : {});
      // A change that changed nothing settles at once.
      if (!always && before.down === after.down && before.scrunched === after.scrunched && before.open === after.open) this.#finish();
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

  /** Whether a method is setting several attributes as one change, and whether any was set meanwhile. */
  #batching = false;
  #batched = false;

  attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (this.#root === null) return;
    if (this.#batching) {
      this.#batched = true;
      return;
    }
    if (name === "cards") {
      const old = readHand(before) ?? [];
      const next = readHand(after) ?? [];
      // The same cards in another order: they slide to their new places, never gathered and dealt again.
      if (old.length > 0 && old.join(" ") !== next.join(" ") && [...old].sort().join() === [...next].sort().join()) {
        this.#moving = !lessMotion();
        this.#draw();
        return;
      }
      if (this.#redeal(before, after)) return;
    }
    if (name === "deal-after" || name === "receive") return;
    this.#draw();
  }

  /**
   * A NEW DEAL IS SEEN. John, 2026-10-01: a shuffle that only swapped the cards was "so subtle that
   * you don't know cards changed". When a hand already on the page is given other cards, the old
   * ones gather into a stack where the hand lies, and the stack opens on the new ones — in the same
   * box, with the shuffle's sound where sound is on. Instant where motion is reduced, for a hand
   * squared into a bundle (which shows no cards to change), and for the first cards a hand is given.
   */
  #redeal(before: string | null, after: string | null): boolean {
    const old = readHand(before) ?? [];
    const next = readHand(after) ?? [];
    const now = this.#state();
    if (this.#shown === null || old.length === 0 || next.length === 0 || old.join(" ") === next.join(" ") || now.scrunched || lessMotion() || !this.isConnected) return false;
    const gathered = { down: now.down, scrunched: false, open: 0 };
    if (this.#dealTimer !== null) clearTimeout(this.#dealTimer);
    // `deal-after`: how long this hand waits, still showing its old cards, before it gathers in. A table gives each seat
    // a little more than the one before, so the hands are dealt in turn round the table, as a dealer deals them.
    const wait = Math.max(0, Math.min(10_000, Number(this.getAttribute("deal-after")) || 0));
    const gather = () => {
      if (isOn(this, "sound")) pageSounds().play("shuffle");
      // The old cards gather in…
      this.#dealing = { cards: old, target: gathered };
      this.#moving = true;
      this.#draw();
      // …and the new ones open out of the stack, before the gathering's own redraw would come.
      this.#dealTimer = setTimeout(() => {
        this.#dealTimer = null;
        this.#dealing = null;
        this.#shown = gathered;
        this.#moving = true;
        this.#draw();
      }, DEAL_GATHER_MS);
    };
    if (wait === 0) gather();
    else {
      // Waiting its turn, the hand goes on showing the old cards.
      this.#dealing = { cards: old, target: now };
      this.#dealTimer = setTimeout(gather, wait);
    }
    return true;
  }

  #finish(): void {
    const done = this.#settle;
    this.#settle = null;
    done?.();
  }

  #draw(): void {
    const root = this.#root as ShadowRoot;
    const order = this.getAttribute("order");
    const cards = arrangeCards(this.#dealing?.cards ?? this.cards, order === "rank" || order === "suit" ? order : "dealt");
    const language = languageOf(this);
    const { design, ready } = designNamed(this.getAttribute("design"));
    if (ready !== null) void ready.then(() => this.#draw());
    const target = this.#dealing?.target ?? this.#state();
    const moving = this.#moving && this.#shown !== null;
    // Drawn where it ends, unless it is to move there.
    const from = moving ? (this.#shown ?? target) : target;
    const stagger = this.#stagger;
    this.#moving = false;
    this.#stagger = 0;
    if (this.#timer !== null) clearTimeout(this.#timer);

    // What a screen reader hears: the cards, or that they are face down and how many, or only that it is a bundle.
    const words = STRINGS[language];
    const top = cards[cards.length - 1];
    const label = target.scrunched ? (target.down || top === undefined ? words.handScrunched : fillIn(words.handSquared, { card: faceName(top, language) })) : target.down ? fillIn(words.handFaceDown, { n: cards.length }) : fillIn(words.handLabel, { cards: namesList(cards.map((card) => faceName(card, language)), language) });
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
    // A bundle face up shows its top card: the hand's last, on top, with the cards before it under it (the earliest
    // repeated where the hand is shorter than the bundle), so it still says nothing of how many there are.
    const bundleCards = Array.from({ length: BUNDLE_BACKS }, (_, at) => cards[Math.max(0, cards.length - BUNDLE_BACKS + at)] ?? "");
    // ONE FRAME FOR EVERY STATE: the hand keeps the room its whole fan takes, open or closed, face up or
    // squared into a bundle, and each state lies in the middle of it. So closing gathers the cards to
    // where the hand lies and opening spreads them from there, and the hand never changes size when an
    // effect ends: a hand drawn smaller once still would slide across the page (a centred one most).
    const fan = this.#places(cards.length, { open: 1, scrunched: false });
    const widest = (places: CardPlace[]) => Math.max(0, ...places.map((spot) => spot.x));
    const frame = Math.max(widest(fan), widest(this.#places(count, from)), widest(this.#places(count, target)));
    const centred = (places: CardPlace[]) => places.map((spot) => ({ ...spot, x: Math.round((spot.x + (frame - widest(places)) / 2) * 1000) / 1000 }));
    const endPlaces = centred(this.#places(count, target));
    // The same cards moved about (sorted, mixed up), or a card tossed out or given: each card that was on the table
    // starts from the place it lay in, so it is seen to slide to its new one, and a card given drops in from above.
    // Cards that have nothing to do with the ones before (a new deal) are simply laid where they go.
    const startAt = centred(this.#places(count, from));
    const before = [...this.#onScreen];
    const related = !bundle && before.length > 0 && cards.some((card) => before.includes(card));
    const prior = related ? centred(this.#places(before.length, from)) : startAt;
    const startPlaces = related
      ? cards.map((card, at) => {
          const was = before.indexOf(card);
          if (was !== -1) {
            before[was] = "";
            return prior[was] as CardPlace;
          }
          const lands = endPlaces[at] as CardPlace;
          return { ...lands, y: lands.y - 0.9 };
        })
      : startAt;
    this.#onScreen = bundle ? [] : [...cards];
    // Faces are in the page only while some card may show one: never for a bundle face down at both ends, nor once a hand is still face down.
    const facesNeeded = (!from.down || !target.down) && !(target.down && target.scrunched && !moving);
    const slots = Array.from({ length: count }, (_, at) => {
      const card = bundle ? (facesNeeded ? (bundleCards[at] as string) : "") : (cards[at] as string);
      const face = facesNeeded && card !== "" ? cardDrawing(card, false, this, design, language) : "";
      const back = cardDrawing(card || "AS", true, this, design, language);
      return `<div class="slot" part="card" data-at="${at}"><div class="turn"><div class="side face"${face === "" ? "" : ` data-card="${card}"`}>${face}</div><div class="side back">${back}</div></div></div>`;
    });
    const every = [...fan, ...startPlaces, ...endPlaces];
    const span = frame;
    const drop = Math.max(...every.map((place) => place.y), 0);
    // A card turned about a point below it swings out sideways: room is kept on both sides for the most any card of the frame turns.
    const turn = Math.max(...every.map((place) => Math.abs(place.rotate)), 0);
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
    all.forEach((slot, at) => place(slot, (moving ? startPlaces : endPlaces)[at], moving ? from.down : target.down));
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
      place(slot, endPlaces[at], target.down);
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

/** How long a tossed card takes to lift away, before the hand closes up after it. */
const TOSS_MS = 300;

/** How long the old cards of a new deal take to gather in, before the new ones open: the cards' move (.45 s) and a breath. */
const DEAL_GATHER_MS = 470;

const HAND_STYLE = `
:host { display: inline-block; user-select: none; -webkit-user-select: none; vertical-align: middle; -webkit-tap-highlight-color: transparent; max-width: 100%; width: calc(var(--toranpu-w, 70px) * var(--toranpu-across, 1)); container-type: inline-size; }
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
