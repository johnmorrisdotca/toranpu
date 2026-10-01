// Two panels for <toranpu-hand>: its controls (turning it and its cards over, gathering and parting
// it, ordering it, changing a card, marking and spinning), a row for each kind, acting on the card
// chosen; and a closed hand that opens on a tap, as closed as the slider says.
// Both are drawn in the look chosen above, and each shows the code that does what was last pressed.
import { cardId, shuffledDeck } from "./dist/deck.js";
import { randomSeed } from "./dist/index.js";
import { faceName } from "./dist/card-faces.js";
import { arrangeCards } from "./dist/element.js";
import { onLook, wear } from "./look.js";

const $ = (id) => document.getElementById(id);
const handOf = (seed, size) => shuffledDeck(seed).slice(0, size).map(cardId).join(" ");
let seed = 2026;

/** The element as written in a page: its cards, the look it wears, how it lies now (face down, squared up), and what else is asked. */
const tag = (hand, extra = "") => {
  const worn = ["design", "back", "back-colour", "mark"].filter((name) => hand.hasAttribute(name)).map((name) => ` ${name}="${hand.getAttribute(name)}"`).join("");
  const lies = ["face-down", "scrunched"].filter((name) => hand.hasAttribute(name)).map((name) => ` ${name}`).join("") + ["order", "turned", "parted", "marked"].filter((name) => hand.hasAttribute(name)).map((name) => ` ${name}="${hand.getAttribute(name)}"`).join("");
  return `<toranpu-hand cards="${hand.getAttribute("cards")}"${worn}${lies}${extra}></toranpu-hand>`;
};

export function wire() {
  const hidden = $("hide-hand");
  const closed = $("reveal-hand");
  const said = (code) => ($("hide-code").textContent = code);
  const chooser = $("hand-card");
  /** The card chosen to act on: the one picked, or the middle card, so it is seen among the others. */
  const chosen = () => {
    const cards = hidden.cards;
    return cards.includes(chooser.value) ? chooser.value : cards[Math.floor(cards.length / 2)];
  };
  /** The chooser lists the hand as it lies, keeping the card picked while the hand holds it. */
  const listCards = () => {
    const was = chosen();
    const order = hidden.getAttribute("order");
    const cards = arrangeCards(hidden.cards, order ?? "dealt");
    const language = document.documentElement.lang === "ja" ? "ja" : "en";
    chooser.replaceChildren(
      ...cards.map((card) => {
        const option = document.createElement("option");
        option.value = card;
        option.textContent = faceName(card, language);
        return option;
      }),
    );
    chooser.value = cards.includes(was) ? was : (cards[Math.floor(cards.length / 2)] ?? "");
  };
  const deal = () => {
    hidden.setAttribute("cards", handOf(seed, 7));
    closed.setAttribute("cards", handOf(seed + 1, 5));
    listCards();
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
    "hand-toggle": () => {
      said(`${tag(hidden)}\n\nhand.toggle("${chosen()}");   // that card over, the rest as they lie`);
      return hidden.toggle(chosen());
    },
    "hand-toggle-all": () => {
      said(`${tag(hidden)}\n\nhand.toggle();   // every card over, each to its other side`);
      return hidden.toggle();
    },
    "hand-scrunch": () => {
      said(`${tag(hidden)}\n\nhand.scrunch();   // or the attribute: scrunched`);
      return hidden.scrunch();
    },
    "hand-part": () => {
      said(`${tag(hidden)}\n\nhand.partAt("${chosen()}");   // or the attribute: parted="${chosen()}"`);
      return hidden.partAt(chosen());
    },
    "hand-unpart": () => {
      said(`${tag(hidden)}\n\nhand.unpart();`);
      return hidden.unpart();
    },
    "hand-group-face": () => {
      said(`${tag(hidden)}\n\nhand.group("face");   // or the attribute: order="face"`);
      return hidden.group("face");
    },
    "hand-mark": () => {
      hidden.mark(chosen());
      said(`${tag(hidden)}\n\nhand.mark("${chosen()}");   // a dot on its corner, face up or face down`);
      return Promise.resolve();
    },
    "hand-unmark": () => {
      hidden.unmark();
      said(`${tag(hidden)}\n\nhand.unmark();`);
      return Promise.resolve();
    },
    "hand-spin": () => {
      const direction = $("hand-spin-way").value;
      said(`${tag(hidden)}\n\nhand.spin("${chosen()}", { direction: "${direction}" });`);
      return hidden.spin(chosen(), { direction });
    },
    "hand-spin-all": () => {
      const direction = $("hand-spin-way").value;
      said(`${tag(hidden)}\n\nhand.spin(undefined, { direction: "${direction}" });   // every card`);
      return hidden.spin(undefined, { direction });
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
      const cards = hidden.cards;
      const out = chosen();
      if (out === undefined || cards.length < 2) return Promise.resolve();
      said(`${tag(hidden)}\n\nhand.toss("${out}");`);
      return hidden.toss(out);
    },
    "hand-replace": () => {
      const cards = hidden.cards;
      const out = chosen();
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
      for (const name of ["face-down", "scrunched", "turned", "parted", "marked"]) hidden.removeAttribute(name);
      deal();
      return Promise.resolve();
    },
  };
  for (const [id, act] of Object.entries(actions)) $(id).addEventListener("click", () => void act().then(listCards));
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
  // The chooser names the cards in the page's language: listed again when it changes.
  return listCards;
}
