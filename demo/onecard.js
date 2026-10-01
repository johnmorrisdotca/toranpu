// One card on any page: a <toranpu-card> in the design and back chosen above, turned over by a tap,
// and the same card as a picture by its address on this site, with the code for each.
import "./dist/element-define.js";
import { FULL_DECK } from "./dist/index.js";
import { JOKERS, faceName } from "./dist/card-faces.js";
import { look, onLook } from "./look.js";

const $ = (id) => document.getElementById(id);
const SITE = "https://johnmorrisdotca.github.io/toranpu/";
let card = "KS";

function attributes() {
  const parts = [`card="${card}"`];
  if (look.design !== "plain") parts.push(`design="${look.design}"`);
  if (look.back !== "classic-red") parts.push(`back="${look.back}"`);
  if (look.colour !== null) parts.push(`back-colour="${look.colour}"`);
  if (look.mark.trim() !== "") parts.push(`mark="${look.mark.trim()}"`);
  return parts;
}

function draw(lang) {
  const shown = $("one-card");
  for (const name of ["design", "back", "back-colour", "mark"]) shown.removeAttribute(name);
  for (const part of attributes()) {
    const [name, value] = part.split("=");
    shown.setAttribute(name, value.slice(1, -1));
  }
  $("one-card-code").textContent = `<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js"></script>
<toranpu-card ${attributes().join(" ")} flip></toranpu-card>`;
  const picture = `${SITE}cards/${look.design}/${card}.svg`;
  $("one-card-img").src = `cards/${look.design}/${card}.svg`;
  $("one-card-img").alt = faceName(card, lang());
  $("one-card-url").textContent = `<img src="${picture}" alt="${faceName(card, "en")}" width="70">

// or, drawn on the page itself:
import { cardFaceUrl${look.design === "english" ? ", loadCardDesign" : ""} } from "@johnmorrisdotca/toranpu/card-faces";
${look.design === "english" ? `image.src = cardFaceUrl("${card}", { design: await loadCardDesign("english") });` : `image.src = cardFaceUrl("${card}"${look.design === "four-colour" ? ', { design: "four-colour" }' : ""});`}`;
}

/** `lang` gives the page's language. */
export function wire(lang) {
  const pick = $("one-card-pick");
  pick.replaceChildren(
    ...[...FULL_DECK, ...JOKERS].map((id) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = faceName(id, lang());
      return option;
    }),
  );
  pick.value = card;
  pick.addEventListener("change", () => {
    card = pick.value;
    draw(lang);
  });
  onLook(() => draw(lang));
  draw(lang);
  // In the page's language: the names in the list, and the picture's words.
  return () => {
    for (const option of pick.options) option.textContent = faceName(option.value, lang());
    draw(lang);
  };
}
