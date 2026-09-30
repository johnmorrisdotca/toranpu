// Builds the static demo for GitHub Pages into ./site: the table's page and the API reference,
// each put together from the family's shared header and footer and this package's own body,
// the two stylesheets, and the compiled library.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

import { apiBody } from "./api.mjs";
import { FAMILY_SCRIPT, familyFooter, familyHead, familyHeader, familyUnreviewed } from "./family-template.mjs";

const id = "toranpu";
const icon = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect x='14' y='6' width='72' height='88' rx='12' fill='%23fffdf8' stroke='%232f5d4a' stroke-width='8'/%3E%3Cpath d='M50 26 C 66 44, 74 52, 74 62 C 74 74, 58 76, 54 66 L 58 80 L 42 80 L 46 66 C 42 76, 26 74, 26 62 C 26 52, 34 44, 50 26 Z' fill='%231f2320'/%3E%3C/svg%3E`;
const frame = ({ title, description, links, body, scripts }) => `<!doctype html>
<html lang="en">
  <head>
    ${familyHead({ id, title, description, ogTitle: "Toranpu トランプ: ten card games with computer players", ogDescription: "A deck of playing cards and ten card games, each with a computer player." })}
    <link rel="icon" href="${icon}" />
    <link rel="stylesheet" href="family.css" />
    <link rel="stylesheet" href="site.css" />
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
for (const file of ["family.css", "site.css", "page.js"]) cpSync(`demo/${file}`, `site/${file}`);
cpSync("dist", "site/dist", { recursive: true });

writeFileSync(
  "site/index.html",
  frame({
    title: "Toranpu トランプ: ten card games with computer players",
    description: "Play a hand of Hearts, Spades, Euchre, Cribbage, Oh Hell, Crazy Eights, Go Fish, Big Two, President or Gin Rummy against computer players, all run by the Toranpu TypeScript package. Free and open source.",
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
console.log(`site/ is ready (${api.total} exports in api.html): serve it, or let the Pages workflow publish it.`);
