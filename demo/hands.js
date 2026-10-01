// Two panels for <toranpu-hand>: hiding a hand (face down all at once or one by one, face up,
// scrunched and spread out), and a closed hand that opens on a tap, as closed as the slider says.
// Both are drawn in the look chosen above, and each shows the code that does what was last pressed.
import { cardId, shuffledDeck } from "./dist/deck.js";
import { randomSeed } from "./dist/index.js";
import { look, onLook } from "./look.js";

const $ = (id) => document.getElementById(id);
const handOf = (seed, size) => shuffledDeck(seed).slice(0, size).map(cardId).join(" ");
let seed = 2026;

/** The look's attributes, as both hands wear them. */
function wear(hand) {
  for (const name of ["design", "back", "back-colour", "mark"]) hand.removeAttribute(name);
  if (look.design !== "plain") hand.setAttribute("design", look.design);
  if (look.back !== "classic-red") hand.setAttribute("back", look.back);
  if (look.colour !== null) hand.setAttribute("back-colour", look.colour);
  if (look.mark.trim() !== "") hand.setAttribute("mark", look.mark.trim());
}

/** The element as written in a page: its cards, the look it wears, and what else is asked. */
const tag = (hand, extra = "") => {
  const worn = ["design", "back", "back-colour", "mark"].filter((name) => hand.hasAttribute(name)).map((name) => ` ${name}="${hand.getAttribute(name)}"`).join("");
  return `<toranpu-hand cards="${hand.getAttribute("cards")}"${worn}${extra}></toranpu-hand>`;
};

export function wire() {
  const hidden = $("hide-hand");
  const closed = $("reveal-hand");
  const said = (code) => ($("hide-code").textContent = code);
  const deal = () => {
    hidden.setAttribute("cards", handOf(seed, 7));
    closed.setAttribute("cards", handOf(seed + 1, 5));
  };
  const actions = {
    "hand-hide": () => {
      said(`${tag(hidden)}\n\nhand.hide();`);
      return hidden.hide();
    },
    "hand-one-by-one": () => {
      said(`${tag(hidden)}\n\nhand.hide({ oneByOne: true, gap: 110 });`);
      return hidden.hide({ oneByOne: true });
    },
    "hand-show": () => {
      said(`${tag(hidden, " face-down")}\n\nhand.show({ oneByOne: true });`);
      return hidden.show({ oneByOne: true });
    },
    "hand-scrunch": () => {
      said(`${tag(hidden)}\n\nhand.scrunch();   // or the attribute: scrunched`);
      return hidden.scrunch();
    },
    "hand-spread": () => {
      said(`${tag(hidden, " scrunched")}\n\nhand.spread();`);
      return hidden.spread();
    },
    "hand-new": () => {
      seed = randomSeed();
      // A new hand is dealt face up and spread out.
      hidden.removeAttribute("face-down");
      hidden.removeAttribute("scrunched");
      deal();
      return Promise.resolve();
    },
  };
  for (const [id, act] of Object.entries(actions)) $(id).addEventListener("click", () => void act());
  const slider = $("closed-amount");
  const showClosed = () => {
    closed.setAttribute("closed", slider.value);
    $("reveal-code").textContent = `${tag(closed, ` closed="${slider.value}" reveal`)}\n\n// or by hand:\nhand.open();\nhand.close(${slider.value});`;
  };
  slider.addEventListener("input", showClosed);
  deal();
  showClosed();
  const both = () => {
    wear(hidden);
    wear(closed);
  };
  onLook(both);
  both();
}
