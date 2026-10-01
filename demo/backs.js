// The card backs panel: choose one of the three, give it a colour or words in its middle, and see
// the code that draws it. The choice is the demo's look, kept in the address.
import { CARD_BACKS, CARD_BACK_LOOK, cardBackSvg, cardBackUrl } from "./dist/card-backs.js";
import { backOptions, look, onLook, setLook } from "./look.js";

const $ = (id) => document.getElementById(id);
const NAMES = { "classic-red": "pageBackClassicRed", "classic-blue": "pageBackClassicBlue", "ink-dots": "pageBackInkDots" };

/** The code that draws the back as chosen. */
function code() {
  const options = backOptions();
  const shown = Object.keys(options).length === 0 ? "" : `, { ${Object.entries(options).map(([name, value]) => `${name}: ${JSON.stringify(value)}`).join(", ")} }`;
  return `import { cardBackSvg, cardBackUrl } from "@johnmorrisdotca/toranpu/card-backs";

element.innerHTML = cardBackSvg(${JSON.stringify(look.back)}${shown});
image.src = cardBackUrl(${JSON.stringify(look.back)}${shown});`;
}

function draw() {
  for (const button of document.querySelectorAll("[data-back]")) {
    button.setAttribute("aria-pressed", String(button.dataset.back === look.back));
    button.querySelector("img").src = cardBackUrl(button.dataset.back, backOptions());
  }
  $("back-colour").value = look.colour ?? CARD_BACK_LOOK[look.back].field;
  if (document.activeElement !== $("back-mark")) $("back-mark").value = look.mark;
  $("back-own").disabled = look.colour === null;
  $("back-show").innerHTML = cardBackSvg(look.back, { ...backOptions(), title: look.back });
  $("back-code").textContent = code();
}

/** `say` gives a word in the page's language. */
export function wire(say) {
  $("back-picks").replaceChildren(
    ...CARD_BACKS.map((name) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "back-pick";
      button.dataset.back = name;
      button.dataset.testid = `back-${name}`;
      const image = document.createElement("img");
      image.alt = "";
      image.width = 46;
      image.height = 64;
      const words = document.createElement("span");
      words.dataset.say = NAMES[name];
      words.textContent = say(NAMES[name]);
      button.append(image, words);
      button.addEventListener("click", () => setLook({ back: name }));
      return button;
    }),
  );
  $("back-colour").addEventListener("input", () => setLook({ colour: $("back-colour").value }));
  $("back-own").addEventListener("click", () => setLook({ colour: null }));
  $("back-mark").addEventListener("input", () => setLook({ mark: $("back-mark").value.slice(0, 12) }));
  onLook(draw);
  draw();
}
