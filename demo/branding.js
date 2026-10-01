// The branding panel: a site's own card backs, faces for the standard cards, and wholly new cards, drawn by Toranpu.
// Everything here is invented for the demo: a game of territories, each with a place and a soldier, a horse or a cannon.
// The pictures are ours, drawn for this page; nothing in them is anybody's mark or artwork.
import "./dist/element-define.js";
import { SUIT_PATHS, registerCardBack } from "./dist/card-backs.js";
import { registerCardDesign } from "./dist/card-faces.js";

const $ = (id) => document.getElementById(id);

const GREEN = "#2f4a3a";
const CREAM = "#f3ead2";
const GOLD = "#c98b2b";

/** The six places of the invented game: their names in both languages, the ground's colour and the outline of the land. */
const PLACES = {
  ridgeway: { en: "Ridgeway", ja: "尾根道", tint: "#d9c7a0", land: "M14 84L26 60L40 68L54 42L70 64L86 56L90 94L60 104L28 98Z" },
  harbour: { en: "Harbour", ja: "港町", tint: "#b9d3dc", land: "M12 70L30 52L52 58L72 44L88 62L82 88L60 80L50 104L26 96Z" },
  saltmarsh: { en: "Saltmarsh", ja: "塩沼", tint: "#cfd9b0", land: "M16 60L44 46L64 54L88 50L84 80L90 102L56 96L34 104L18 88Z" },
  highfell: { en: "Highfell", ja: "高原", tint: "#e0c9c0", land: "M20 98L14 70L38 50L50 62L66 44L84 66L88 100L54 90Z" },
  oakmere: { en: "Oakmere", ja: "樫の湖", tint: "#bcd8c2", land: "M24 50L58 44L86 58L78 82L88 98L50 104L16 90L28 70Z" },
  stonebridge: { en: "Stonebridge", ja: "石橋", tint: "#d6d2dc", land: "M12 62L40 48L62 62L90 46L86 78L64 90L72 106L36 98L20 82Z" },
};
const KIND_WORDS = { soldier: { en: "soldier", ja: "歩兵" }, horse: { en: "horse", ja: "騎兵" }, cannon: { en: "cannon", ja: "大砲" } };

/** A soldier, a horse and a cannon, each drawn in a box about 24 across with its middle at 0, 0, in one ink. */
const ICONS = {
  soldier: (ink) => `<circle cx="0" cy="-7" r="3.4" fill="${ink}"/><path d="M-4 -8.4A4 4 0 0 1 4 -8.4Z" fill="${ink}"/><path d="M-6 9L-5 -1Q0 -3.4 5 -1L6 9Z" fill="${ink}"/><rect x="6" y="-9" width="1.8" height="19" rx=".7" fill="${ink}" transform="rotate(8 7 0)"/>`,
  horse: (ink) => `<path d="M-7 9L-6 2C-6 -4 -2 -9 4 -10L3 -6L8 -8C8 -4 7 -1 5 1C7 4 7 6 7 9Z" fill="${ink}"/>`,
  cannon: (ink) => `<rect x="-10" y="-5.5" width="16" height="6.5" rx="2.4" fill="${ink}" transform="rotate(-18 -2 -2)"/><circle cx="0" cy="4.5" r="5.6" fill="none" stroke="${ink}" stroke-width="1.8"/><path d="M-5.6 4.5H5.6M0 -1.1V10.1" stroke="${ink}" stroke-width="1"/>`,
};
const icon = (kind, x, y, scale, ink) => `<g transform="translate(${x} ${y}) scale(${scale})">${ICONS[kind](ink)}</g>`;

/** One territory card's drawing, in the 100 by 140 box: the place's name over its land, a soldier, a horse or a cannon under it. */
function territory(place, kind, language) {
  const where = PLACES[place];
  const name = language === "ja" ? where.ja : where.en;
  return [
    `<rect x="8" y="8" width="84" height="21" rx="3" fill="${GREEN}"/>`,
    `<text x="50" y="22.5" text-anchor="middle" font-size="${language === "ja" ? 11.5 : name.length > 9 ? 10 : 11}" font-weight="700" font-family="system-ui, sans-serif" fill="${CREAM}">${name}</text>`,
    `<rect x="8" y="34" width="84" height="76" rx="3" fill="${where.tint}" fill-opacity=".55"/>`,
    `<path d="${where.land}" fill="${where.tint}" stroke="${GREEN}" stroke-width="1.6" stroke-linejoin="round"/>`,
    `<circle cx="50" cy="123" r="13" fill="${GREEN}"/>`,
    icon(kind, 50, 123, 0.78, CREAM),
  ].join("");
}

/** The wild card: all three at once under the word. */
function wild(language) {
  return [
    `<rect x="8" y="8" width="84" height="124" rx="4" fill="${GREEN}"/>`,
    `<rect x="12" y="12" width="76" height="116" rx="2.5" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`,
    `<text x="50" y="40" text-anchor="middle" font-size="${language === "ja" ? 15 : 17}" font-weight="800" letter-spacing="1" font-family="system-ui, sans-serif" fill="${GOLD}">${language === "ja" ? "ワイルド" : "WILD"}</text>`,
    icon("soldier", 50, 66, 1.5, CREAM),
    icon("horse", 28, 102, 1.2, CREAM),
    icon("cannon", 72, 102, 1.2, CREAM),
  ].join("");
}

/** A king in the site's own pattern: the suit's mark and the letter in the corners, a crown over a shield. */
function king(suit) {
  const red = suit === "H" || suit === "D";
  const ink = red ? "#a3342e" : "#1b1b1b";
  const mark = (x, y, size) => `<path d="${SUIT_PATHS[suit]}" fill="${ink}" transform="translate(${x - size / 2} ${y - size / 2}) scale(${size / 100})"/>`;
  const corner = `<text x="11" y="22" text-anchor="middle" font-size="16" font-weight="800" font-family="Georgia, serif" fill="${ink}">K</text>${mark(11, 32, 11)}`;
  return [
    `<g>${corner}</g><g transform="rotate(180 50 70)">${corner}</g>`,
    `<path d="M50 30L84 42V72C84 94 68 108 50 114C32 108 16 94 16 72V42Z" fill="${GREEN}" stroke="${GOLD}" stroke-width="2.4"/>`,
    `<path d="M34 62L38 46L45 56L50 42L55 56L62 46L66 62Z" fill="${GOLD}"/>`,
    mark(50, 84, 24),
  ].join("");
}

/** The site's mark: a shield and a star, in a box 100 by 100, for a logo on a back. */
const SHIELD = `<path d="M50 6L90 20V52C90 76 70 92 50 98C30 92 10 76 10 52V20Z" fill="${CREAM}" stroke="${GREEN}" stroke-width="5"/><path d="M50 26L56 44H75L60 55L66 73L50 62L34 73L40 55L25 44H44Z" fill="${GOLD}"/>`;

/** A whole back of the site's own: dark ground, ridges in two tones, a border. */
const BACK_ART = `<rect x="4" y="4" width="92" height="132" rx="5" fill="#243b2e"/><path d="M4 100L22 72L38 90L58 56L78 86L96 70V131Q96 136 91 136H9Q4 136 4 131Z" fill="#1a2c22"/><path d="M4 114L26 92L44 108L66 80L96 104V131Q96 136 91 136H9Q4 136 4 131Z" fill="#2f4a3a"/><rect x="9" y="9" width="82" height="122" rx="3" fill="none" stroke="${GOLD}" stroke-width="1.2"/>`;

/** A picture for a back, as an address: drawn here with stripes, standing in for a photograph or a raster file a site would have. */
const PICTURE = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140"><rect width="100" height="140" fill="#7a2f3a"/><g stroke="#f0c9a0" stroke-width="4" opacity=".55">${Array.from({ length: 12 }, (_, at) => `<path d="M-10 ${at * 14}L110 ${at * 14 - 60}"/>`).join("")}</g></svg>`)}`;

/** Registers the demo's design and backs once, so `design="frontier"` and `back="frontier"` work on any element of the page. */
export function register() {
  registerCardDesign({
    name: "frontier",
    box: [100, 140],
    art: { KS: king("S"), KH: king("H"), KD: king("D"), KC: king("C") },
    // The wild card is drawn by the function so that it speaks both languages; the kings above stay as they are.
    draw: (card, { language }) => {
      if (card === "wild") return wild(language);
      const found = /^([a-z]+)-(soldier|horse|cannon)$/.exec(card);
      return found !== null && found[1] in PLACES ? territory(found[1], found[2], language) : null;
    },
    label: (card, language) => {
      if (card === "wild") return language === "ja" ? "ワイルドカード" : "Wild card";
      const found = /^([a-z]+)-(soldier|horse|cannon)$/.exec(card);
      if (found === null || !(found[1] in PLACES)) return null;
      const where = PLACES[found[1]];
      return language === "ja" ? `${where.ja}（${KIND_WORDS[found[2]].ja}）` : `${where.en} (${KIND_WORDS[found[2]].en})`;
    },
  });
  registerCardBack("frontier", { base: "classic-blue", colour: GREEN, ink: "#e7d9a8", logo: SHIELD, logoSize: 36 });
  registerCardBack("frontier-art", { art: BACK_ART, logo: SHIELD, logoSize: 34 });
}

/** The cards a hand of the site's own holds: six territories with a soldier, a horse or a cannon each, and the wild card. */
export const BRAND_HAND = ["ridgeway-soldier", "harbour-horse", "saltmarsh-cannon", "highfell-soldier", "oakmere-horse", "stonebridge-cannon", "wild"];

/** Wires the panel: the hand of territory cards, the three backs, and the buttons that turn them over. */
export function wire() {
  register();
  // The territory cards, one card each so that every one is seen whole, turned over by a tap.
  const row = $("brand-hand");
  row.replaceChildren(
    ...BRAND_HAND.map((id) => {
      const card = document.createElement("toranpu-card");
      for (const [name, value] of Object.entries({ card: id, design: "frontier", back: "frontier", size: "large", sound: "" })) card.setAttribute(name, value);
      card.toggleAttribute("flip", true);
      return card;
    }),
  );
  const hand = $("brand-kings");
  $("brand-picture").setAttribute("back-image", PICTURE);
  $("brand-turn").addEventListener("click", () => {
    void hand.toggle();
    for (const card of document.querySelectorAll("#brand-panel toranpu-card")) card.faceDown = !card.faceDown;
  });
  // A card whose face is worked out from its id, by a function: a pennant with the number on it.
  $("brand-fn").face = (card, { language }) => `<rect x="14" y="14" width="72" height="112" rx="4" fill="${CREAM}" stroke="${GREEN}" stroke-width="2"/><path d="M26 30H74V74L50 60L26 74Z" fill="${GOLD}"/><text x="50" y="56" text-anchor="middle" font-size="22" font-weight="800" font-family="system-ui, sans-serif" fill="${GREEN}">${card}</text><text x="50" y="104" text-anchor="middle" font-size="${language === "ja" ? 10 : 9}" font-family="system-ui, sans-serif" fill="${GREEN}">${language === "ja" ? "関数で描いた面" : "by a function"}</text>`;
}
