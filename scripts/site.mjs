// Builds the static demo for GitHub Pages into ./site: the table's page and the API reference,
// each put together from the family's shared header and footer and this package's own body,
// the two stylesheets, and the compiled library.
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";

import { apiBody } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "toranpu";
const icon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='14' y='6' width='72' height='88' rx='12' fill='%23fffdf8' stroke='%232f5d4a' stroke-width='8'/%3E%3Cpath d='M50 26 C 66 44, 74 52, 74 62 C 74 74, 58 76, 54 66 L 58 80 L 42 80 L 46 66 C 42 76, 26 74, 26 62 C 26 52, 34 44, 50 26 Z' fill='%231f2320'/%3E%3C/svg%3E`;
const frame = ({ title, description, links, body, scripts }) => `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({ id, title, description, ogTitle: "Toranpu トランプ: eleven card games with computer players", ogDescription: "A deck of playing cards and eleven card games, each with a computer player." })}
    <link rel="icon" href="${icon}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="toranpu.css" />
  </head>
  <body>
    <main>
      ${familyHeader({ id, links })}
${body}
      ${familyFooter({ id })}
    </main>
    <script>${FAMILY_SCRIPT}</script>
    ${scripts}
  </body>
</html>
`;

rmSync("site", { recursive: true, force: true });
mkdirSync("site", { recursive: true });
for (const file of readdirSync("demo").filter((name) => /\.(css|js)$/.test(name))) cpSync(`demo/${file}`, `site/${file}`);
// The page another site frames: a hand of cards and nothing else, at embed/?hand=AS+KH+10D.
mkdirSync("site/embed", { recursive: true });
cpSync("demo/embed.html", "site/embed/index.html");
cpSync("dist", "site/dist", { recursive: true });

writeFileSync(
  "site/index.html",
  frame({
    title: "Toranpu · eleven card games with computer players",
    description: "Play a hand of Hearts, Spades, Euchre, Cribbage, Oh Hell, Crazy Eights, Go Fish, Big Two, President, Gin Rummy or War against computer players, all run by the Toranpu TypeScript package. Free and open source.",
    links: [{ href: "api.html", say: "pageApi" }],
    body: readFileSync("demo/body.html", "utf8").replace("__UNREVIEWED__", familyUnreviewed({ id })).trimEnd(),
    scripts: `<script type="module" src="page.js"></script>`,
  }),
);

const api = apiBody();
writeFileSync(
  "site/api.html",
  frame({
    title: "Toranpu API reference: every export, with its signature",
    description: "The API reference of the Toranpu card game package: every export of every entry point, with its signature and its documentation, made from the source.",
    links: [{ href: "./", say: "pageBack" }],
    body: `      ${api.html}\n      ${familyUnreviewed({ id })}`,
    scripts: `<script type="module">
      import { STRINGS } from "./dist/index.js";
      const words = (lang) => ({ pitch: STRINGS[lang].pageApiIntro, name: STRINGS[lang].pageName, nameLink: STRINGS[lang].pageNameLink, foot: STRINGS[lang].pageFoot, pageBack: STRINGS[lang].pageBack });
      familyLanguage({ id: "toranpu", words: { en: words("en"), ja: words("ja") } });
    </script>`,
  }),
);
// Every card and back as a picture of its own, for an <img> on any page: cards/<design>/<id>.svg and backs/<name>.svg.
const faces = await import("../dist/card-faces.js");
const backs = await import("../dist/card-backs.js");
const { FULL_DECK } = await import("../dist/index.js");
let pictures = 0;
// Every design the package lists, and every card it draws: the deck and its extras.
for (const name of faces.CARD_DESIGNS) {
  const design = (await faces.loadCardDesign(name)) ?? name;
  mkdirSync(`site/cards/${name}`, { recursive: true });
  for (const card of [...FULL_DECK, ...faces.EXTRA_CARDS]) {
    writeFileSync(`site/cards/${name}/${card}.svg`, faces.cardFaceSvg(card, { design }));
    pictures += 1;
  }
}
mkdirSync("site/backs", { recursive: true });
for (const name of backs.CARD_BACKS) {
  writeFileSync(`site/backs/${name}.svg`, backs.cardBackSvg(name));
  pictures += 1;
}
console.log(`site/ is ready (${api.total} exports in api.html, ${pictures} pictures of cards and backs): serve it, or let the Pages workflow publish it.`);
