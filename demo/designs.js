// The card designs panel: plain, four colour or the English pattern, shown on a spread of cards
// with the code that draws them. The English pattern is fetched only when it is chosen.
import { CARD_DESIGNS, cardFaceSvg, loadCardDesign } from "./dist/card-faces.js";
import { look, onLook, setLook } from "./look.js";

const $ = (id) => document.getElementById(id);
const NAMES = { plain: "pageDesignPlain", "four-colour": "pageDesignFourColour", english: "pageDesignEnglish", realistic: "pageDesignRealistic" };
const SPREAD = ["AS", "KS", "QH", "JD", "TC", "7D", "2H", "RJ", "BJ", "R1", "R2", "BL"];
const loaded = {};

/** The design as cardFaceSvg takes it: a name for the two drawn in the package, the loaded set for the English pattern. */
export async function designNamed(name) {
  if (name !== "english" && name !== "realistic") return name;
  loaded[name] ??= await loadCardDesign(name);
  return loaded[name];
}

function code() {
  if (look.design === "english" || look.design === "realistic")
    return `import { cardFaceSvg, loadCardDesign } from "@johnmorrisdotca/toranpu/card-faces";

const ${look.design} = await loadCardDesign("${look.design}");
element.innerHTML = cardFaceSvg("KS", { design: ${look.design} });`;
  return `import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";

element.innerHTML = cardFaceSvg("KS"${look.design === "plain" ? "" : `, { design: "${look.design}" }`});`;
}

let drawing = 0;
async function draw(lang) {
  const mine = ++drawing;
  for (const button of document.querySelectorAll("[data-design]")) button.setAttribute("aria-pressed", String(button.dataset.design === look.design));
  const design = await designNamed(look.design);
  // A choice made while the English pattern was being fetched wins over it.
  if (mine !== drawing) return;
  $("design-spread").replaceChildren(
    ...SPREAD.map((card) => {
      const box = document.createElement("div");
      box.className = "face";
      box.dataset.card = card;
      box.innerHTML = cardFaceSvg(card, { design, language: lang() });
      return box;
    }),
  );
  $("design-spread").dataset.design = look.design;
  $("design-code").textContent = code();
}

/** `say` gives a word in the page's language, and `lang` the language. */
export function wire(say, lang) {
  $("design-picks").replaceChildren(
    ...CARD_DESIGNS.map((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "fam-button";
      button.dataset.design = name;
      button.dataset.testid = `design-${name}`;
      button.dataset.say = NAMES[name];
      button.textContent = say(NAMES[name]);
      button.addEventListener("click", () => setLook({ design: name }));
      return button;
    }),
  );
  onLook(() => void draw(lang));
  void draw(lang);
  return () => void draw(lang);
}
