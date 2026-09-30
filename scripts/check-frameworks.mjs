// Proves the claim in the README: the packed package works in React, Vue, Svelte, Angular and a
// plain page, with nothing for the consumer to configure. It packs the package, makes a small
// project for each in a scratch folder, installs the tarball and each framework's own tools
// there (never here: the package has no dependencies), and builds it. Then it opens each built
// page in Chromium and WebKit and plays a game of Go Fish to its end by tapping the buttons,
// and checks that the winner is the one the seed and those taps must give. The components are
// the ones the README shows.
//
//   pnpm test:frameworks [scratch folder]        (TORANPU_FRAMEWORKS=vue,react for some of them)
//
// Run it before a release that names a framework. It needs the network and a few minutes.
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { extname, join, resolve } from "node:path";
import process from "node:process";

import { chromium, webkit } from "@playwright/test";

import { moveText, namesList, newGame, playComputers, rulesFor } from "../dist/index.js";

const root = resolve(process.argv[2] ?? mkdtempSync(join(tmpdir(), "toranpu-frameworks-")));
rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });
const run = (cwd, command, args) => execFileSync(command, args, { cwd, stdio: "pipe", shell: process.platform === "win32", env: { ...process.env, NG_CLI_ANALYTICS: "false" } }).toString();
const write = (dir, files) => {
  for (const [name, text] of Object.entries(files)) {
    mkdirSync(join(dir, name, ".."), { recursive: true });
    writeFileSync(join(dir, name), typeof text === "string" ? text : JSON.stringify(text, null, 2));
  }
};

run(process.cwd(), "npm", ["pack", "--ignore-scripts", "--pack-destination", root]);
const tarball = join(root, readdirSync(root).find((name) => name.endsWith(".tgz")));
const toranpu = `file:${tarball}`;
const SEED = 2026;
const page = (script) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>tane</title></head><body><div id="app"></div>${script}</body></html>`;

const projects = {
  vue: {
    out: "dist",
    files: {
      "package.json": { name: "check-vue", private: true, type: "module", dependencies: { "@johnmorrisdotca/toranpu": toranpu, vue: "^3.5.0" }, devDependencies: { vite: "^7.0.0", "@vitejs/plugin-vue": "^6.0.0" } },
      "vite.config.js": `import vue from "@vitejs/plugin-vue";\nexport default { base: "./", plugins: [vue()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.js"></script>`),
      "src/main.js": `import { createApp } from "vue";\nimport GoFish from "./GoFish.vue";\ncreateApp(GoFish, { seed: ${SEED} }).mount("#app");\n`,
      "src/GoFish.vue": `<script setup>
import { computed, shallowRef } from "vue";
import { moveText, namesList, newGame, playComputers, rulesFor } from "@johnmorrisdotca/toranpu";

const props = defineProps({ seed: Number });
const players = ["You", "Aiko", "Ben"];
const rules = rulesFor("goFish");
const game = shallowRef(playComputers("goFish", newGame("goFish", { players, seed: props.seed, computers: [false, true, true] })).game);
const over = computed(() => rules.over(game.value));
const moves = computed(() => (over.value ? [] : rules.moves(game.value)));
const status = computed(() => (over.value ? \`Won by \${namesList(rules.winners(game.value).map((seat) => players[seat]))}\` : "Your turn"));
const play = (move) => (game.value = playComputers("goFish", rules.play(game.value, move)).game);
</script>

<template>
  <p id="status">{{ status }}</p>
  <div id="moves">
    <button v-for="move in moves" :key="JSON.stringify(move)" @click="play(move)">{{ moveText("goFish", move, { players }) }}</button>
  </div>
</template>
`,
    },
  },
  svelte: {
    out: "dist",
    files: {
      "package.json": { name: "check-svelte", private: true, type: "module", dependencies: { "@johnmorrisdotca/toranpu": toranpu, svelte: "^5.0.0" }, devDependencies: { vite: "^7.0.0", "@sveltejs/vite-plugin-svelte": "^6.0.0" } },
      "vite.config.js": `import { svelte } from "@sveltejs/vite-plugin-svelte";\nexport default { base: "./", plugins: [svelte()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.js"></script>`),
      "src/main.js": `import { mount } from "svelte";\nimport GoFish from "./GoFish.svelte";\nmount(GoFish, { target: document.getElementById("app"), props: { seed: ${SEED} } });\n`,
      "src/GoFish.svelte": `<script>
  import { moveText, namesList, newGame, playComputers, rulesFor } from "@johnmorrisdotca/toranpu";

  let { seed } = $props();
  const players = ["You", "Aiko", "Ben"];
  const rules = rulesFor("goFish");
  let game = $state.raw(playComputers("goFish", newGame("goFish", { players, seed, computers: [false, true, true] })).game);
  const over = $derived(rules.over(game));
  const play = (move) => (game = playComputers("goFish", rules.play(game, move)).game);
</script>

<p id="status">{over ? \`Won by \${namesList(rules.winners(game).map((seat) => players[seat]))}\` : "Your turn"}</p>
<div id="moves">
  {#each over ? [] : rules.moves(game) as move (JSON.stringify(move))}
    <button onclick={() => play(move)}>{moveText("goFish", move, { players })}</button>
  {/each}
</div>
`,
    },
  },
  angular: {
    out: "dist/check-angular/browser",
    files: {
      "package.json": {
        name: "check-angular",
        private: true,
        dependencies: { "@johnmorrisdotca/toranpu": toranpu, "@angular/common": "^20.0.0", "@angular/compiler": "^20.0.0", "@angular/core": "^20.0.0", "@angular/platform-browser": "^20.0.0", rxjs: "^7.8.0", tslib: "^2.8.0" },
        devDependencies: { "@angular/build": "^20.0.0", "@angular/cli": "^20.0.0", "@angular/compiler-cli": "^20.0.0", typescript: "~5.8.0" },
      },
      "angular.json": {
        version: 1,
        projects: {
          "check-angular": {
            projectType: "application",
            root: "",
            sourceRoot: "src",
            architect: { build: { builder: "@angular/build:application", options: { outputPath: "dist/check-angular", index: "src/index.html", browser: "src/main.ts", tsConfig: "tsconfig.json", baseHref: "./" }, configurations: { production: {} }, defaultConfiguration: "production" } },
          },
        },
      },
      "tsconfig.json": { compilerOptions: { target: "ES2022", module: "ES2022", moduleResolution: "bundler", strict: true, experimentalDecorators: true, skipLibCheck: true, lib: ["ES2022", "dom"] }, files: ["src/main.ts"] },
      "src/index.html": page(`<check-root></check-root>`),
      "src/go-fish.ts": `import { Component, computed, input, linkedSignal } from "@angular/core";
import { moveText, namesList, newGame, playComputers, rulesFor, type MoveOf } from "@johnmorrisdotca/toranpu";

const players = ["You", "Aiko", "Ben"];
const rules = rulesFor("goFish");

@Component({
  selector: "go-fish",
  template: \`
    <p id="status">{{ status() }}</p>
    <div id="moves">
      @for (move of moves(); track words(move)) {
        <button (click)="play(move)">{{ words(move) }}</button>
      }
    </div>
  \`,
})
export class GoFish {
  seed = input.required<number>();
  game = linkedSignal(() => playComputers("goFish", newGame("goFish", { players, seed: this.seed(), computers: [false, true, true] })!).game);
  over = computed(() => rules.over(this.game()));
  moves = computed(() => (this.over() ? [] : rules.moves(this.game())));
  status = computed(() => (this.over() ? \`Won by \${namesList(rules.winners(this.game()).map((seat) => players[seat]))}\` : "Your turn"));
  words = (move: MoveOf<"goFish">) => moveText("goFish", move, { players });
  play(move: MoveOf<"goFish">) {
    this.game.set(playComputers("goFish", rules.play(this.game(), move)!).game);
  }
}
`,
      "src/main.ts": `import { Component, provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { GoFish } from "./go-fish";

@Component({
  selector: "check-root",
  imports: [GoFish],
  template: \`<go-fish [seed]="seed" />\`,
})
class App {
  seed = ${SEED};
}

bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] });
`,
    },
  },
  react: {
    out: "dist",
    files: {
      "package.json": { name: "check-react", private: true, type: "module", dependencies: { "@johnmorrisdotca/toranpu": toranpu, react: "^19.0.0", "react-dom": "^19.0.0" }, devDependencies: { vite: "^7.0.0", "@vitejs/plugin-react": "^5.0.0" } },
      "vite.config.js": `import react from "@vitejs/plugin-react";\nexport default { base: "./", plugins: [react()] };\n`,
      "index.html": page(`<script type="module" src="/src/main.jsx"></script>`),
      "src/GoFish.jsx": `import { moveText, namesList } from "@johnmorrisdotca/toranpu";
import { useCardGame } from "@johnmorrisdotca/toranpu/react";

const players = ["You", "Aiko", "Ben"];

export function GoFish({ seed }) {
  const table = useCardGame("goFish", { players, seed, computers: [false, true, true] }, 0);
  return (
    <>
      <p id="status">{table.over ? \`Won by \${namesList(table.winners.map((seat) => players[seat]))}\` : table.computerToPlay ? "Thinking…" : "Your turn"}</p>
      <div id="moves">
        {table.moves.map((move) => (
          <button key={JSON.stringify(move)} onClick={() => table.play(move)}>
            {moveText("goFish", move, { players })}
          </button>
        ))}
      </div>
    </>
  );
}
`,
      "src/main.jsx": `import { createRoot } from "react-dom/client";
import { GoFish } from "./GoFish.jsx";

createRoot(document.getElementById("app")).render(<GoFish seed={${SEED}} />);
`,
    },
  },
  // No framework and no bundler: a script tag and the files as they are published.
  plain: {
    out: ".",
    build: (dir) => run(dir, "npm", ["install", "--no-audit", "--no-fund", "--ignore-scripts", "--install-links"]),
    files: {
      "package.json": { name: "check-plain", private: true, dependencies: { "@johnmorrisdotca/toranpu": toranpu } },
      "index.html": page(`<p id="status"></p>
<div id="moves"></div>
<script type="module">
  import { moveText, namesList, newGame, playComputers, rulesFor } from "./node_modules/@johnmorrisdotca/toranpu/dist/index.js";

  const players = ["You", "Aiko", "Ben"];
  const rules = rulesFor("goFish");
  let game = playComputers("goFish", newGame("goFish", { players, seed: 2026, computers: [false, true, true] })).game;

  function draw() {
    const over = rules.over(game);
    document.getElementById("status").textContent = over ? \`Won by \${namesList(rules.winners(game).map((seat) => players[seat]))}\` : "Your turn";
    document.getElementById("moves").replaceChildren(
      ...(over ? [] : rules.moves(game)).map((move) => {
        const button = Object.assign(document.createElement("button"), { textContent: moveText("goFish", move, { players }) });
        button.addEventListener("click", () => {
          game = playComputers("goFish", rules.play(game, move)).game;
          draw();
        });
        return button;
      }),
    );
  }
  draw();
</script>`),
    },
  },
};

const only = process.env.TORANPU_FRAMEWORKS?.split(",");
const built = [];
for (const [name, project] of Object.entries(projects)) {
  if (only !== undefined && !only.includes(name)) continue;
  const dir = join(root, name);
  write(dir, project.files);
  const started = Date.now();
  try {
    if (project.build !== undefined) project.build(dir);
    else {
      run(dir, "npm", ["install", "--no-audit", "--no-fund"]);
      run(dir, "npx", name === "angular" ? ["ng", "build"] : ["vite", "build"]);
    }
    if (!existsSync(join(dir, project.out, "index.html"))) throw new Error(`no index.html in ${project.out}`);
    built.push([name, join(dir, project.out)]);
    console.log(`built   ${name.padEnd(8)} in ${Math.round((Date.now() - started) / 1000)} s`);
  } catch (error) {
    console.log(`FAILED  ${name}: ${String(error.stderr ?? error.stdout ?? error.message).split("\n").slice(-12).join("\n")}`);
    process.exitCode = 1;
  }
}

// The game the taps must make: the person always presses the first button, the computers answer.
const players = ["You", "Aiko", "Ben"];
const rules = rulesFor("goFish");
let game = playComputers("goFish", newGame("goFish", { players, seed: SEED, computers: [false, true, true] })).game;
const taps = [];
while (!rules.over(game)) {
  const move = rules.moves(game)[0];
  taps.push(moveText("goFish", move, { players }));
  game = playComputers("goFish", rules.play(game, move)).game;
}
const want = `Won by ${namesList(rules.winners(game).map((seat) => players[seat]))}`;

// Open each built page and play it to the end by tapping.
const types = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json" };
for (const [engine, launcher] of [["chromium", chromium], ["webkit", webkit]]) {
  const browser = await launcher.launch();
  for (const [name, out] of built) {
    const context = await browser.newContext({ viewport: { width: 390, height: 800 } });
    const tab = await context.newPage();
    const errors = [];
    tab.on("pageerror", (error) => errors.push(String(error)));
    await tab.route("http://check.test/**", (route) => {
      let file = join(out, decodeURIComponent(new URL(route.request().url()).pathname));
      if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
      if (!existsSync(file)) return route.fulfill({ status: 404, body: "" });
      return route.fulfill({ body: readFileSync(file), contentType: types[extname(file)] ?? "application/octet-stream" });
    });
    await tab.goto("http://check.test/");
    let got = "nothing";
    let tapped = 0;
    try {
      for (const text of taps) {
        // The person's turn, with the button the rules say comes first.
        await tab.waitForFunction((wanted) => document.querySelector("#status")?.textContent === "Your turn" && document.querySelector("#moves button")?.textContent.trim() === wanted, text, { timeout: 5000 });
        await tab.evaluate(() => {
          window.moved = new Promise((resolve) => {
            new MutationObserver(resolve).observe(document.body, { subtree: true, childList: true, characterData: true });
            setTimeout(resolve, 200);
          });
        });
        await tab.locator("#moves button").first().click();
        await tab.evaluate(() => window.moved);
        tapped += 1;
      }
      await tab.waitForFunction(() => document.querySelector("#status").textContent.startsWith("Won by"), null, { timeout: 5000 });
      got = await tab.locator("#status").textContent();
    } catch {
      got = (await tab.locator("#status").textContent().catch(() => null)) ?? "nothing";
    }
    const ok = errors.length === 0 && got.trim() === want && tapped === taps.length;
    console.log(`${ok ? "played " : "FAILED "} ${name.padEnd(8)} in ${engine}: ${tapped} of ${taps.length} taps, and the page says “${got.trim()}”; the rules say “${want}”${errors.length > 0 ? ` ${errors.join("; ")}` : ""}`);
    if (!ok) process.exitCode = 1;
    await context.close();
  }
  await browser.close();
}
console.log(`scratch projects are in ${root}`);
