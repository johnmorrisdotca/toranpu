// The messy piles panel: a stock and a discard pile in the look chosen above, as messy as the slider
// says and laid out from their seed; Draw a card moves the stock's top card onto the discard pile.
import { cardId, shuffledDeck } from "./dist/deck.js";
import { look, onLook, setLook, wear } from "./look.js";
import { player, table } from "./sound.js";

const $ = (id) => document.getElementById(id);
const SEED_MOST = 2147483647;
const state = { seed: 7, drawn: 3 };

function draw() {
  const deck = shuffledDeck(state.seed).map(cardId);
  const stock = $("stock-demo");
  const discard = $("discard-demo");
  for (const pile of [stock, discard]) {
    wear(pile);
    pile.setAttribute("messiness", String(look.messiness));
    pile.setAttribute("seed", String(state.seed));
  }
  stock.setAttribute("count", String(deck.length - state.drawn));
  discard.setAttribute("cards", deck.slice(0, state.drawn).join(" "));
  $("messiness").value = String(look.messiness);
  $("pile-seed").value = String(state.seed);
  $("draw-card").disabled = state.drawn >= deck.length;
  $("piles-code").textContent = `<toranpu-pile count="${deck.length - state.drawn}" face-down messiness="${look.messiness}" seed="${state.seed}"></toranpu-pile>
<toranpu-pile cards="${deck.slice(0, state.drawn).join(" ")}" messiness="${look.messiness}" seed="${state.seed}"></toranpu-pile>`;
}

export function wire() {
  $("messiness").addEventListener("input", () => setLook({ messiness: Number($("messiness").value) }));
  $("pile-seed").addEventListener("change", () => {
    const seed = Number($("pile-seed").value.trim());
    if (/^\d{1,10}$/.test($("pile-seed").value.trim()) && seed >= 1 && seed <= SEED_MOST) state.seed = seed;
    draw();
  });
  $("draw-card").addEventListener("click", () => {
    state.drawn += 1;
    if (table.on) player.play("deal");
    draw();
  });
  onLook(draw);
  draw();
}
