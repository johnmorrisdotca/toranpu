// Two panels for <toranpu-hand>: hiding a hand (face down all at once or one by one, face up,
// scrunched and spread out), and a closed hand that opens on a tap, as closed as the slider says.
// Both are drawn in the look chosen above, and each shows the code that does what was last pressed.
import { cardId, shuffledDeck } from "./dist/deck.js";
import { randomSeed } from "./dist/index.js";
import { onLook, wear } from "./look.js";

const $ = (id) => document.getElementById(id);
const handOf = (seed, size) => shuffledDeck(seed).slice(0, size).map(cardId).join(" ");
let seed = 2026;

/** The element as written in a page: its cards, the look it wears, how it lies now (face down, squared up), and what else is asked. */
const tag = (hand, extra = "") => {
  const worn = ["design", "back", "back-colour", "mark"].filter((name) => hand.hasAttribute(name)).map((name) => ` ${name}="${hand.getAttribute(name)}"`).join("");
  const lies = ["face-down", "scrunched"].filter((name) => hand.hasAttribute(name)).map((name) => ` ${name}`).join("") + (hand.hasAttribute("order") ? ` order="${hand.getAttribute("order")}"` : "");
  return `<toranpu-hand cards="${hand.getAttribute("cards")}"${worn}${lies}${extra}></toranpu-hand>`;
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
      said(`${tag(hidden)}\n\nhand.show({ oneByOne: true });`);
      return hidden.show({ oneByOne: true });
    },
    "hand-scrunch": () => {
      said(`${tag(hidden)}\n\nhand.scrunch();   // or the attributes: scrunched face-down`);
      return hidden.scrunch();
    },
    "hand-spread": () => {
      said(`${tag(hidden)}\n\nhand.spread();`);
      return hidden.spread();
    },
    "hand-sort": () => {
      said(`${tag(hidden)}\n\nhand.sort();   // or the attribute: order="rank"`);
      return hidden.sort();
    },
    "hand-group": () => {
      said(`${tag(hidden)}\n\nhand.group();   // or the attribute: order="suit"`);
      return hidden.group();
    },
    "hand-unsort": () => {
      said(`${tag(hidden)}\n\nhand.unsort();   // the order it was dealt in`);
      return hidden.unsort();
    },
    "hand-mix": () => {
      said(`${tag(hidden)}\n\nhand.mixUp();`);
      return hidden.mixUp();
    },
    "hand-toss": () => {
      // The middle card goes, so it is seen leaving from among the others.
      const cards = hidden.cards;
      const out = cards[Math.floor(cards.length / 2)];
      if (out === undefined || cards.length < 2) return Promise.resolve();
      said(`${tag(hidden)}\n\nhand.toss("${out}");`);
      return hidden.toss(out);
    },
    "hand-replace": () => {
      const cards = hidden.cards;
      const out = cards[Math.floor(cards.length / 2)];
      // The next card of the deck the hand does not hold.
      const next = shuffledDeck(seed + 7).map(cardId).find((card) => !cards.includes(card));
      if (out === undefined || next === undefined) return Promise.resolve();
      const lands = $("hand-receive").value;
      said(`${tag(hidden)}\n\nhand.replace("${out}", "${next}");   // receive="${lands}": the new card goes ${lands === "front" ? "to the front" : "to the end"}`);
      return hidden.replace(out, next, lands);
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
  $("hand-receive").addEventListener("change", () => hidden.setAttribute("receive", $("hand-receive").value));
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
