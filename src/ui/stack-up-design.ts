import { STRINGS } from "../strings.ts";

import type { CardDesign } from "./card-faces.types.ts";

/**
 * THE CARDS OF STACK UP, drawn here and used by the table: its own deck has no suits, so the standard faces cannot draw
 * it. A number card is a number on a field coloured by its third (1 to 4 blue, 5 to 8 green, 9 to 12 red), a wild is
 * gold with a star. The box is the standard 100 by 140.
 */

const FIELD = { low: "#2b5f9e", mid: "#2f7d4f", high: "#b23a3a", wild: "#b88a1a" } as const;

function drawn(card: string): string | null {
  if (card === "nw") {
    return `<rect x="2" y="2" width="96" height="136" rx="10" fill="${FIELD.wild}" stroke="#f6e7b4" stroke-width="3"/><path d="M50 36 L58.8 58.4 L82.6 60 L64.2 75.4 L70.2 98.6 L50 85.8 L29.8 98.6 L35.8 75.4 L17.4 60 L41.2 58.4 Z" fill="#fff6d0"/>`;
  }
  const value = Number.parseInt(card.slice(1), 10);
  if (!/^n\d\d$/.test(card) || value < 1 || value > 12) return null;
  const field = value <= 4 ? FIELD.low : value <= 8 ? FIELD.mid : FIELD.high;
  return `<rect x="2" y="2" width="96" height="136" rx="10" fill="${field}" stroke="#f4f0e6" stroke-width="3"/><rect x="12" y="12" width="76" height="116" rx="6" fill="none" stroke="#f4f0e6" stroke-opacity=".45" stroke-width="1.5"/><text x="50" y="84" text-anchor="middle" font-family="system-ui, sans-serif" font-weight="700" font-size="${value > 9 ? 46 : 58}" fill="#fbf8ee">${value}</text><text x="16" y="30" font-family="system-ui, sans-serif" font-weight="700" font-size="15" fill="#fbf8ee">${value}</text><text x="84" y="124" text-anchor="end" font-family="system-ui, sans-serif" font-weight="700" font-size="15" fill="#fbf8ee">${value}</text>`;
}

/** Stack Up's cards as a design: `n01` to `n12` and the wild `nw`. */
export const STACK_UP_DESIGN: CardDesign = {
  name: "stack-up",
  box: [100, 140],
  art: {},
  frame: "none",
  draw: (card) => drawn(card),
  label: (card, language) =>
    card === "nw"
      ? STRINGS[language].cardStackUpWild
      : drawn(card) === null
        ? null
        : String(Number.parseInt(card.slice(1), 10)),
};
