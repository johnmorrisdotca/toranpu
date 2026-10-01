// The table panel: <toranpu-table> on its own, any game, in the cloth chosen on the header's patches and the
// look chosen on this page, with the tag that puts the same table on another page.
import "./dist/table-define.js";
import { CARD_GAME_LIST, CARD_GAME_TABLES, gameName } from "./dist/index.js";
import { look, onLook, wear } from "./look.js";

const $ = (id) => document.getElementById(id);
const CDN = "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/table-define.js";
const kebab = (kind) => kind.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function draw(lang) {
  const table = $("table-demo");
  const kind = CARD_GAME_LIST.find((one) => kebab(one) === table.getAttribute("game")) ?? "crazyEights";
  $("table-game").replaceChildren(...CARD_GAME_LIST.map((one) => Object.assign(document.createElement("option"), { value: kebab(one), textContent: gameName(one, lang()), selected: one === kind })));
  const { fewestPlayers, mostPlayers } = CARD_GAME_TABLES[kind];
  const players = Math.min(mostPlayers, Math.max(fewestPlayers, Number(table.getAttribute("players")) || CARD_GAME_TABLES[kind].defaultPlayers));
  $("table-players").replaceChildren(
    ...Array.from({ length: mostPlayers - fewestPlayers + 1 }, (_, at) => Object.assign(document.createElement("option"), { value: String(fewestPlayers + at), textContent: String(fewestPlayers + at), selected: fewestPlayers + at === players })),
  );
  const cloth = document.documentElement.dataset.cloth ?? "green";
  wear(table);
  table.setAttribute("messiness", String(look.messiness));
  if (cloth === "green") table.removeAttribute("cloth");
  else table.setAttribute("cloth", cloth);
  if (lang() === "ja") table.setAttribute("lang", "ja");
  else table.removeAttribute("lang");
  const worn = ["cloth", "design", "back", "back-colour", "mark", "messiness"].filter((name) => table.hasAttribute(name)).map((name) => ` ${name}="${table.getAttribute(name)}"`).join("");
  $("table-code").textContent = `<script type="module" src="${CDN}"></script>
<toranpu-table game="${kebab(kind)}" players="${players}"${worn}></toranpu-table>`;
}

/** Wires the panel; returns what redraws it when the language changes. */
export function wire(lang) {
  const table = $("table-demo");
  $("table-game").addEventListener("change", () => {
    table.setAttribute("game", $("table-game").value);
    table.removeAttribute("players");
    draw(lang);
  });
  $("table-players").addEventListener("change", () => {
    table.setAttribute("players", $("table-players").value);
    draw(lang);
  });
  $("table-deal").addEventListener("click", () => table.deal());
  document.addEventListener("family-cloth", () => draw(lang));
  onLook(() => draw(lang));
  draw(lang);
  return () => draw(lang);
}
