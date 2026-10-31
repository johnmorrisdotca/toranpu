import { MARKER_STYLE } from "./element-kit.ts";
import { type CardPlace, handLayout, partedHandLayout } from "./layout.ts";

/** How many backs a squared-up bundle shows, whatever the hand: a bundle never tells how many cards are in it.
 *
 * @example
 * ```ts
 * import { BUNDLE_BACKS } from "@johnmorrisdotca/toranpu/element";
 * console.log(BUNDLE_BACKS);
 * ```
 */
export const BUNDLE_BACKS = 3;

/** How long a tossed card takes to lift away, before the hand closes up after it. */
export const TOSS_MS = 300;

/** How long the old cards of a new deal take to gather in, before the new ones open: the cards' move (.45 s) and a breath. */
export const DEAL_GATHER_MS = 470;

/** The hand's stylesheet: the fan, the turn, and the room a card keeps as it moves. */
export const HAND_STYLE = `
:host { display: inline-block; user-select: none; -webkit-user-select: none; vertical-align: middle; -webkit-tap-highlight-color: transparent; max-width: 100%; width: calc(var(--toranpu-w, 70px) * var(--toranpu-across, 1)); container-type: inline-size; }
:host([reveal]) { cursor: pointer; }
:host(:focus-visible) { outline: 3px solid var(--toranpu-focus, #b5452c); outline-offset: 4px; border-radius: 8px; }
.hand { --cw: min(var(--toranpu-w, 70px), calc(100cqw / var(--across))); position: relative; width: 100%; height: calc(var(--cw) * (1.4 + var(--drop) + .14 + var(--side) * .45)); }
.slot { position: absolute; left: calc(var(--cw) * (var(--x) + var(--side) + .06)); top: calc(var(--cw) * (var(--y) + .05)); width: var(--cw); aspect-ratio: 5 / 7; transform: rotate(var(--r)); transform-origin: 50% 120%; perspective: 800px; }
.spin { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
.turn { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; }
.slot[data-down="true"] .turn { transform: rotateY(180deg); }
.side { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.back { transform: rotateY(180deg); }
.side svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 1px 2px rgba(0,0,0,.28)); }
.hand[data-moving="true"] .slot { transition: left .45s cubic-bezier(.3,.7,.3,1), top .45s cubic-bezier(.3,.7,.3,1), transform .45s cubic-bezier(.3,.7,.3,1); }
.hand[data-moving="true"] .turn { transition: transform var(--toranpu-flip-ms, 450ms) cubic-bezier(.3,.7,.3,1) var(--delay, 0ms); }
@media (prefers-reduced-motion: reduce) { .hand[data-moving="true"] .slot, .hand[data-moving="true"] .turn { transition: none; } }
${MARKER_STYLE}
`;

/** Where each of these cards lies for a state: squared up into a bundle when scrunched, parted at a card, or fanned as open as asked. */
export function handPlaces(
  cards: readonly string[],
  state: { open: number; scrunched: boolean; parted: string | null },
): CardPlace[] {
  const count = cards.length;
  if (state.scrunched)
    return Array.from({ length: count }, (_, at) => ({
      x: Math.min(at, BUNDLE_BACKS - 1) * 0.025,
      y: Math.min(at, BUNDLE_BACKS - 1) * 0.02,
      rotate: (Math.min(at, BUNDLE_BACKS - 1) - 1) * 1.5,
    }));
  const parted = state.parted === null ? -1 : cards.indexOf(state.parted);
  if (parted !== -1) return partedHandLayout(count, parted);
  return handLayout(count, { open: state.open });
}
