// The embed panel: a hand written in the card codes, a size, and the two ways to put it on another
// page, an iframe of embed/ and one tag, each written out and the iframe shown as it would be framed.
import { readHand } from "./dist/element.js";
import { look, onLook } from "./look.js";

const $ = (id) => document.getElementById(id);
const SITE = "https://johnmorrisdotca.github.io/toranpu/";
const CDN = "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js";
/** How tall each size's frame is, room enough for five cards at 360 pixels wide. */
export const FRAME_HEIGHTS = { small: 160, medium: 200, large: 360 };
const state = { cards: "AS KH QD JC 10S", size: "medium" };

function draw(lang) {
  const cards = readHand(state.cards);
  const good = cards !== null && cards.length > 0;
  $("embed-cards").setAttribute("aria-invalid", String(!good));
  $("embed-error").textContent = good ? "" : lang().embedBad;
  for (const button of document.querySelectorAll("[data-embed-size]")) button.setAttribute("aria-pressed", String(button.dataset.embedSize === state.size));
  if (!good) return;
  const query = new URLSearchParams({ hand: cards.join(" "), size: state.size });
  if (look.design !== "plain") query.set("design", look.design);
  if (look.back !== "classic-red") query.set("back", look.back);
  if (look.colour !== null) query.set("back-colour", look.colour.slice(1));
  if (look.mark.trim() !== "") query.set("mark", look.mark.trim());
  const height = FRAME_HEIGHTS[state.size];
  const frame = $("embed-frame");
  const src = `embed/?${query}`;
  if (frame.getAttribute("src") !== src) frame.setAttribute("src", src);
  frame.height = String(height);
  $("embed-frame-code").textContent = `<iframe src="${SITE}${src}" title="A hand of cards" width="360" height="${height}" style="border:0;max-width:100%" loading="lazy"></iframe>`;
  const attributes = [`cards="${cards.join(" ")}"`, `size="${state.size}"`];
  if (look.design !== "plain") attributes.push(`design="${look.design}"`);
  if (look.back !== "classic-red") attributes.push(`back="${look.back}"`);
  if (look.colour !== null) attributes.push(`back-colour="${look.colour}"`);
  if (look.mark.trim() !== "") attributes.push(`mark="${look.mark.trim()}"`);
  $("embed-tag-code").textContent = `<script type="module" src="${CDN}"></script>\n<toranpu-hand ${attributes.join(" ")}></toranpu-hand>`;
}

/** `words` gives the page's table of words. */
export function wire(words) {
  $("embed-cards").value = state.cards;
  $("embed-cards").addEventListener("input", () => {
    state.cards = $("embed-cards").value;
    draw(words);
  });
  for (const button of document.querySelectorAll("[data-embed-size]"))
    button.addEventListener("click", () => {
      state.size = button.dataset.embedSize;
      draw(words);
    });
  onLook(() => draw(words));
  draw(words);
  return () => draw(words);
}
