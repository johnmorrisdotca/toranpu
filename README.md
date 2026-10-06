<h1 align="center">Toranpu <sub>トランプ</sub></h1>

<p align="center"><strong>A deck of playing cards and eleven card games, each with a computer player.</strong><br>
Hearts, Spades, Euchre, Cribbage, Oh Hell, Crazy Eights, Go Fish, Big Two, President, Gin Rummy and War: the rules as pure functions, seeded deals, saved games, and a table that runs anywhere, in your own card backs and faces if you like.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/toranpu/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/toranpu/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/toranpu"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/toranpu?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="MIT licence" src="https://img.shields.io/badge/licence-MIT-2f5d4a"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/toranpu/"><strong>Play a hand against the computer →</strong></a></p>

<p align="center">
  <img src="docs/desktop.jpg" alt="A game of Hearts for four a few tricks in, under the demo's header with its language chooser, five cloth patches and Help switch: the eleven games to choose from, a trick on the felt, and your hand of eleven with the cards you may not play dimmed" width="720">
  <img src="docs/phone.jpg" alt="A game of Go Fish for three on a phone in dark mode, in Japanese: the stock, your hand of nine and the buttons that ask a computer for a rank" width="220">
</p>

A playing card library and a card game engine for JavaScript and TypeScript:
a standard 52-card deck with a seeded shuffle, and the full rules of eleven
classic card games, each with a computer opponent (a bot) for every seat.

- **What is different.** The games are complete, down to the rules a table
  argues about, and every one answers the same few questions, so one table
  plays all eleven. The computers see only what their seat could see. A game is
  its seed and its moves, so it can be saved, shared, replayed and checked.
- **What it costs a project.** Nothing: no dependencies, and one import. One
  game on its own is about 8 kB.

## In 30 seconds

```sh
npm install @johnmorrisdotca/toranpu    # or pnpm add, or yarn add
```

```ts
import { moveText, newGame, playComputers, rulesFor } from "@johnmorrisdotca/toranpu";

const players = ["You", "Aiko", "Ben"];
const rules = rulesFor("goFish");
let game = newGame("goFish", { players, seed: 2026, computers: [false, true, true] })!;

game = playComputers("goFish", game).game;        // the computers move until it is your turn
const offered = rules.moves(game);                // every move you may make: 12 of them
moveText("goFish", offered[0], { players });      // "Ask Aiko for fours"
game = rules.play(game, offered[0])!;             // the game after your move; the old one is untouched
```

And from a terminal, on Linux, macOS or Windows:

```sh
npx @johnmorrisdotca/toranpu deal --hands 2 --each 5 --seed 42   # Seat 1: 3♣ 2♥ K♣ 7♠ 10♦ …
```

Or with nothing to install, [play a hand in the demo](https://johnmorrisdotca.github.io/toranpu/).

## Who it is for

- **Anybody building a card table.** The rules, the deal, the turn order, the
  scoring and the computer players are done. You draw the cards.
- **Games sites and apps.** Eleven games behind one interface, playable by
  people, computers or any mix, with saves that cannot be tampered with.
- **Bots and research.** Pure functions over plain data: play a million games
  in a loop, pit your own player against the ones here, replay any game from
  its seed.
- **A game of your own.** The deck by itself: fifty-two cards, a seeded
  shuffle, dealing, and codes short enough for a link.
- **Teaching.** Each game's rules are a few hundred lines you can read, with
  its tests beside them.

The games are traditional and in the public domain. Toranpu is not affiliated
with or endorsed by any publisher of an edition of them.

## Use it in your project

Toranpu is three things, each usable without the others: **the games**, as
plain functions over plain data; **the deck**, for a game of your own; and
**a React hook** that holds a game in state. The table is yours to draw; the
[backs](#card-backs) and the [sounds](#card-sounds) are there if you want
them. The example below is the same small table each time, a game of Go
Fish against two computers with a button for every move you may make.

### 1. The API alone

```ts
import { CARD_GAME_TABLES, fromJSON, newGame, playComputers, rulesFor, toJSON, toText } from "@johnmorrisdotca/toranpu";

CARD_GAME_TABLES.euchre;      // { fewestPlayers: 4, mostPlayers: 4, defaultPlayers: 4, sizes: [5, 10], defaultSize: 10 }

const start = newGame("euchre", { players: ["North", "East", "South", "West"], seed: 42, computers: [true, true, true, true] })!;
const { game, moves } = playComputers("euchre", start);   // computers in every seat play it out
const rules = rulesFor("euchre");
rules.over(game);             // true
rules.winners(game);          // [0, 2]: North and South
game.scores;                  // [11, 6]
moves.length;                 // 330

const saved = toJSON("euchre", game);    // the table, the seed and the moves; never a hand
fromJSON(saved)!.kind;                   // "euchre": every move played through the rules again
toText("euchre", game).split("\n")[0];   // "Euchre for 4, seed 42: North, East, South, West"
```

### 2. Plain HTML

```html
<p id="status"></p>
<div id="moves"></div>
<script type="module">
  import { moveText, namesList, newGame, playComputers, rulesFor } from "./node_modules/@johnmorrisdotca/toranpu/dist/index.js";

  const players = ["You", "Aiko", "Ben"];
  const rules = rulesFor("goFish");
  let game = playComputers("goFish", newGame("goFish", { players, seed: 2026, computers: [false, true, true] })).game;

  function draw() {
    const over = rules.over(game);
    document.getElementById("status").textContent = over ? `Won by ${namesList(rules.winners(game).map((seat) => players[seat]))}` : "Your turn";
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
</script>
```

No bundler is needed: every file in `dist` is an ES module that imports
nothing outside the package.

### 3. React

```tsx
import { moveText, namesList } from "@johnmorrisdotca/toranpu";
import { useCardGame } from "@johnmorrisdotca/toranpu/react";

const players = ["You", "Aiko", "Ben"];

export function GoFish({ seed }: { seed: number }) {
  const table = useCardGame("goFish", { players, seed, computers: [false, true, true] }, 0);
  return (
    <>
      <p id="status">{table.over ? `Won by ${namesList(table.winners.map((seat) => players[seat]))}` : table.computerToPlay ? "Thinking…" : "Your turn"}</p>
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
```

`useCardGame(kind, options, computerDelay)` holds the game, offers the moves
of the person to play, and lets the computers take their turns by themselves,
one move every `computerDelay` milliseconds (700 unless said, so that a person
can follow them; 0 here). In Next.js, use it from a client component
(`"use client"`).

### 4. Vue

```vue
<script setup>
import { computed, shallowRef } from "vue";
import { moveText, namesList, newGame, playComputers, rulesFor } from "@johnmorrisdotca/toranpu";

const props = defineProps({ seed: Number });
const players = ["You", "Aiko", "Ben"];
const rules = rulesFor("goFish");
const game = shallowRef(playComputers("goFish", newGame("goFish", { players, seed: props.seed, computers: [false, true, true] })).game);
const over = computed(() => rules.over(game.value));
const moves = computed(() => (over.value ? [] : rules.moves(game.value)));
const status = computed(() => (over.value ? `Won by ${namesList(rules.winners(game.value).map((seat) => players[seat]))}` : "Your turn"));
const play = (move) => (game.value = playComputers("goFish", rules.play(game.value, move)).game);
</script>

<template>
  <p id="status">{{ status }}</p>
  <div id="moves">
    <button v-for="move in moves" :key="JSON.stringify(move)" @click="play(move)">{{ moveText("goFish", move, { players }) }}</button>
  </div>
</template>
```

### 5. Svelte and Angular

```svelte
<script>
  import { moveText, namesList, newGame, playComputers, rulesFor } from "@johnmorrisdotca/toranpu";

  let { seed } = $props();
  const players = ["You", "Aiko", "Ben"];
  const rules = rulesFor("goFish");
  let game = $state.raw(playComputers("goFish", newGame("goFish", { players, seed, computers: [false, true, true] })).game);
  const over = $derived(rules.over(game));
  const play = (move) => (game = playComputers("goFish", rules.play(game, move)).game);
</script>

<p id="status">{over ? `Won by ${namesList(rules.winners(game).map((seat) => players[seat]))}` : "Your turn"}</p>
<div id="moves">
  {#each over ? [] : rules.moves(game) as move (JSON.stringify(move))}
    <button onclick={() => play(move)}>{moveText("goFish", move, { players })}</button>
  {/each}
</div>
```

```ts
// Angular: a standalone component
import { Component, computed, input, linkedSignal } from "@angular/core";
import { moveText, namesList, newGame, playComputers, rulesFor, type MoveOf } from "@johnmorrisdotca/toranpu";

const players = ["You", "Aiko", "Ben"];
const rules = rulesFor("goFish");

@Component({
  selector: "go-fish",
  template: `
    <p id="status">{{ status() }}</p>
    <div id="moves">
      @for (move of moves(); track words(move)) {
        <button (click)="play(move)">{{ words(move) }}</button>
      }
    </div>
  `,
})
export class GoFish {
  seed = input.required<number>();
  game = linkedSignal(() => playComputers("goFish", newGame("goFish", { players, seed: this.seed(), computers: [false, true, true] })!).game);
  over = computed(() => rules.over(this.game()));
  moves = computed(() => (this.over() ? [] : rules.moves(this.game())));
  status = computed(() => (this.over() ? `Won by ${namesList(rules.winners(this.game()).map((seat) => players[seat]))}` : "Your turn"));
  words = (move: MoveOf<"goFish">) => moveText("goFish", move, { players });
  play(move: MoveOf<"goFish">) {
    this.game.set(playComputers("goFish", rules.play(this.game(), move)!).game);
  }
}
```

Each of the five is built from the packed tarball, opened in Chromium and
WebKit, and played to the end by tapping its buttons, by
`scripts/check-frameworks.mjs`, before a release names it. The game each one
reaches has to be the game the seed and those taps must give.

### What a developer gets

- **Typed results.** TypeScript types for everything, each game's state and
  moves included, with a doc comment on every export. `rulesFor("hearts")` is
  typed with Hearts' own game and move.
- **Pure and immutable.** Plain data in, new plain data out. No classes, no
  mutation, no timers, no DOM. It runs in a browser, a worker, Node, Deno,
  Bun or a serverless function.
- **No dependencies**, ES modules, an entry point for each game, a `default`
  export condition for tools that resolve from CommonJS, and
  `sideEffects: false`, so a bundler drops what you do not import.
- **Sizes.** The deck alone is about 3 kB minified (1.4 kB gzipped). One game
  from its own entry point is 7 to 12 kB (Hearts is 9 kB, 3.5 kB gzipped).
  All eleven, with the words in two languages and the command line, are about
  95 kB (30 kB gzipped). What is drawn is apart from the games: the backs
  alone are about 2 kB gzipped, the three elements with the plain faces and
  the backs about 68 kB (21 kB gzipped), and the English pattern (166 kB
  gzipped) and the sounds (50 kB) are fetched only by a page that uses them.
- **Where it runs.** Every current browser, Node 22 and later, Deno and Bun.

## Architecture

Each game is a folder of its own under `src/games/`: its rules as pure
functions, its types, its computer player, and the code that keeps a table as
text. The eleven card games and three solitaires share the deck, the saving and
the words. Drawing sits apart under `ui/`, so the rules run with no DOM, and
every game and every browser part is an entry point of its own, so a page
loads only what it uses.

```text
src/
├── big-two.ts         the "/big-two" entry: Big Two, with its rules, computer player and saved-game format
├── card-backs.ts      the "/card-backs" entry: the backs of the cards, drawn as SVG
├── card-faces.ts      the "/card-faces" entry: the faces of the cards, drawn as SVG
├── card-sounds.ts     the "/card-sounds" entry: the sounds of a card table, played on request
├── cli.ts             the command line as a pure function: arguments in, text and an exit code out
├── crazy-eights.ts    the "/crazy-eights" entry: Crazy Eights, with its rules, computer player and saved-game format
├── cribbage.ts        the "/cribbage" entry: Cribbage, with its rules, computer player and saved-game format
├── deck.ts            the "/deck" entry: the deck on its own, for a solitaire or any game of your own
├── element-define.ts  the "/element/define" entry: registers the custom elements by being imported
├── element.ts         the "/element" entry: the card, hand and pile custom elements, and the arithmetic behind them
├── euchre.ts          the "/euchre" entry: Euchre, with its rules, computer player and saved-game format
├── freecell.ts        the "/freecell" entry: FreeCell, the same way
├── gin-rummy.ts       the "/gin-rummy" entry: Gin Rummy, with its rules, computer player and saved-game format
├── go-fish.ts         the "/go-fish" entry: Go Fish, with its rules, computer player and saved-game format
├── hearts.ts          the "/hearts" entry: Hearts, with its rules, computer player and saved-game format
├── index.ts           the main entry: the deck, the eleven games' front door, saving, words and the command line
├── klondike.ts        the "/klondike" entry: Klondike, with its table, rules, moves as text, solver and what a tap means
├── oh-hell.ts         the "/oh-hell" entry: Oh Hell, with its rules, computer player and saved-game format
├── play.ts            the friendly front door: start any game by name, let the computers play, play yours
├── president.ts       the "/president" entry: President, with its rules, computer player and saved-game format
├── random.ts          seeded randomness, the one thing every deal is made from
├── react.ts           the "/react" entry: a card game in React state, with computers taking their turns
├── save.ts            a game written out and read back: JSON, a short code, a record in words, CSV
├── sounds.ts          the "/sounds" entry: the recorded sounds themselves, as data
├── spades.ts          the "/spades" entry: Spades, with its rules, computer player and saved-game format
├── spider.ts          the "/spider" entry: Spider, at one, two or four suits, the same way
├── strings.ts         every word Toranpu says to a person, in English and Japanese
├── table-define.ts    the "/table/define" entry: registers <toranpu-table> by being imported
├── table.ts           the "/table" entry: the <toranpu-table> element, any of the eleven games ready to play on a page
├── version.ts         the version of this package, as package.json has it
├── war.ts             the "/war" entry: War, with its rules, computer player and saved-game format
├── words.ts           the games, the cards and the moves in words, English or Japanese
├── cards/  the deck's vocabulary and what any game does with a deck before its own rules begin
│   ├── cards.constants.ts  the suits and ranks, in the order a fresh deck is sorted
│   ├── cards.types.ts      the types of a deck of playing cards
│   └── deck.ts             make a deck, shuffle it from a seed, deal it out, write it down
├── designs/  the two ready-made card designs
│   ├── english.ts    the "/card-faces/english" entry: the English pattern, kings, queens and jacks drawn as vectors
│   └── realistic.ts  the "/card-faces/realistic" entry: the realistic design: number cards and aces from a public-domain set, with the English pattern's court cards
├── games/  the rules of every game, one folder each, and what they share
│   ├── cardGameCodec.ts        how a card game is kept as text
│   ├── cardGameRules.ts        each game's game and move types, so a table can be written for any of them
│   ├── cardGames.constants.ts  what a game's table offers: how many may sit and how long it lasts
│   ├── cardGames.types.ts      the card games' shared vocabulary: every game answers the same questions
│   ├── cards.ts                the cards a table game is dealt, as short names such as QS
│   ├── bigTwo/  Big Two
│   │   ├── bigTwo.ts          the rules of Big Two
│   │   ├── bigTwo.types.ts    Big Two's types
│   │   ├── bigTwoComputer.ts  Big Two's computer player
│   │   ├── bigTwoHands.ts     what a play is worth in Big Two, and every play a hand could make
│   │   └── bigTwoRules.ts     Big Two kept as its table, seed and moves, and what a table asks of its rules
│   ├── climbing/  what Big Two and President share
│   │   ├── climbing.ts        whose turn it is after a play or a pass, and when a trick is cleared
│   │   └── climbing.types.ts  the types of a climbing game's play
│   ├── crazyEights/  Crazy Eights
│   │   ├── crazyEights.ts          the rules of Crazy Eights
│   │   ├── crazyEights.types.ts    Crazy Eights' types
│   │   ├── crazyEightsComputer.ts  Crazy Eights' computer player
│   │   └── crazyEightsRules.ts     Crazy Eights kept as its table, seed and moves, and what a table asks of its rules
│   ├── cribbage/  Cribbage
│   │   ├── cribbage.ts          the rules of Cribbage, with its scoring of hands and pegging
│   │   ├── cribbage.types.ts    Cribbage's types
│   │   ├── cribbageComputer.ts  Cribbage's computer player
│   │   └── cribbageRules.ts     Cribbage kept as its table, seed and moves, and what a table asks of its rules
│   ├── euchre/  Euchre
│   │   ├── euchre.ts          the rules of Euchre
│   │   ├── euchre.types.ts    Euchre's types
│   │   ├── euchreComputer.ts  Euchre's computer player
│   │   └── euchreRules.ts     Euchre kept as its table, seed and moves, and what a table asks of its rules
│   ├── freecell/  FreeCell
│   │   ├── code.ts            a FreeCell game written down: the deal and the moves as short strings
│   │   ├── freecell.types.ts  the vocabulary of a FreeCell table
│   │   ├── intent.ts          what a person meant by a drag or a tap, read against the rules, as a move
│   │   ├── rules.ts           the rules of FreeCell, pure
│   │   └── solve.ts           the FreeCell solver
│   ├── ginRummy/  Gin Rummy
│   │   ├── ginComputer.ts     Gin Rummy's computer player
│   │   ├── ginRummy.ts        the rules of Gin Rummy, with its melds and deadwood
│   │   ├── ginRummy.types.ts  Gin Rummy's types
│   │   └── ginRummyRules.ts   Gin Rummy kept as its table, seed and moves, and what a table asks of its rules
│   ├── goFish/  Go Fish
│   │   ├── goFish.ts          the rules of Go Fish
│   │   ├── goFish.types.ts    Go Fish's types
│   │   ├── goFishComputer.ts  Go Fish's computer player
│   │   └── goFishRules.ts     Go Fish kept as its table, seed and moves, and what a table asks of its rules
│   ├── hearts/  Hearts
│   │   ├── hearts.ts          the rules of Hearts
│   │   ├── hearts.types.ts    Hearts' types
│   │   ├── heartsComputer.ts  Hearts' computer player
│   │   └── heartsRules.ts     Hearts kept as its table, seed and moves, and what a table asks of its rules
│   ├── klondike/  Klondike
│   │   ├── code.ts            a Klondike game written down: the deal and the moves as short strings
│   │   ├── intent.ts          what a person meant by a drag or a tap, read against the rules, as a move
│   │   ├── klondike.ts        the rules of Klondike, pure
│   │   ├── klondike.types.ts  the vocabulary of a Klondike table
│   │   └── solve.ts           the Klondike solver, which gives up after a fixed number of tables, never a fixed time
│   ├── ohHell/  Oh Hell
│   │   ├── ohHell.ts          the rules of Oh Hell
│   │   ├── ohHell.types.ts    Oh Hell's types
│   │   ├── ohHellComputer.ts  Oh Hell's computer player
│   │   └── ohHellRules.ts     Oh Hell kept as its table, seed and moves, and what a table asks of its rules
│   ├── president/  President
│   │   ├── president.ts          the rules of President
│   │   ├── president.types.ts    President's types
│   │   ├── presidentComputer.ts  President's computer player
│   │   └── presidentRules.ts     President kept as its table, seed and moves, and what a table asks of its rules
│   ├── solitaire/  what the solitaires share
│   │   └── bestFirst.ts  a best-first search for a game played alone, shared by the FreeCell and Spider solvers
│   ├── spades/  Spades
│   │   ├── spades.ts          the rules of Spades
│   │   ├── spades.types.ts    Spades' types
│   │   ├── spadesComputer.ts  Spades' computer player
│   │   └── spadesRules.ts     Spades kept as its table, seed and moves, and what a table asks of its rules
│   ├── spider/  Spider
│   │   ├── code.ts          a Spider game written down: the deal and the moves as short strings
│   │   ├── intent.ts        what a person meant by a drag or a tap, read against the rules, as a move
│   │   ├── rules.ts         the rules of Spider, pure
│   │   ├── solve.ts         the Spider solver
│   │   └── spider.types.ts  the vocabulary of a Spider table
│   └── war/  War
│       ├── war.ts          the rules of War: a turn through however many wars it takes, and the end
│       ├── war.types.ts    War's types
│       ├── warComputer.ts  War's computer player, which turns the cards over, there being nothing else to do
│       └── warRules.ts     War kept as its table, seed and moves, and what a table asks of its rules
└── ui/  everything that draws or plays something on a page
    ├── cardBacks.ts        the backs of the cards
    ├── cardElement.ts      <toranpu-card>: one card on any page, in any design and with any back, or your own face as a slot
    ├── cardFaces.ts        the faces of the cards, drawn as SVG
    ├── cardFaces.types.ts  a set of drawn cards: its name, its box and each card's drawing
    ├── cardSounds.ts       the sounds of a card table
    ├── elementKit.ts       what the custom elements share: a base class, the designs, the language
    ├── handElement.ts      <toranpu-hand>: a hand of cards, fanned or squared up
    ├── layout.ts           where cards lie: the arithmetic behind the elements, with no DOM
    ├── markup.ts           a page's own artwork made safe to draw: scripts and handlers taken out, picture addresses checked
    ├── pileElement.ts      <toranpu-pile>: a stock or a discard pile, as neat or as messy as asked
    ├── registry.ts         the designs and backs a page registered, by name, and what tells elements to draw again
    ├── svg.ts              what every drawing shares: the card's box, the suits as shapes, safe SVG helpers
    ├── svg.types.ts        a suit as one letter, as a card's id writes it
    └── tableElement.ts     the <toranpu-table> element itself, and the cloths it may be laid in
```

Tests sit beside the code they test (`*.test.ts`). `bin/` is the few lines
that hand the command line the real process, `scripts/` builds the demo, the
sounds and the card designs and checks the package as npm packs it, `sounds/`
holds the recorded sources, `demo/` is the page published on GitHub Pages and
`e2e/` taps it in real browsers.

## The name

*Toranpu* (トランプ) is the everyday Japanese word for a deck of playing cards,
and for card games played with one. It comes from the English word "trump".
Say it in four beats: to-ra-n-pu.

## Where it comes from, and where it is used

Toranpu was built for [Itsutsu](https://itsutsu.com), a site for board games,
puzzles, card games and dice games played at your own pace. *Itsutsu* (五つ) is
Japanese for "five", after five in a row, the game the site began with. The
card tables there play their games through this package, exactly as published
here.

### Used by

- [Itsutsu](https://itsutsu.com), for its card games.

That is the whole list so far. Using Toranpu in something? Open an
[*Add my project*](https://github.com/johnmorrisdotca/toranpu/issues/new?template=add-my-project.md)
issue and we will add you.

### The family

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Toranpu is one of twenty-four packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Toranpu.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->

## Features

- **Eleven games, complete.** Every rule a table argues about is in: Hearts'
  pass and shooting the moon, Spades' nil and bags, Euchre's bowers and stick
  the dealer, Cribbage's pegging and the show, Oh Hell's hook on the dealer's
  bid, Gin Rummy's layoffs and undercuts, President's card swaps, Big Two's
  five-card hands, and War down to the wars inside wars. [The eleven
  games](./docs/games.md) says which rules are played, with a source for each.
- **A computer for every seat.** Each game has its own player, which sees
  only what its seat could see: its hand, the table and everything said
  aloud. It never peeks, and the tests hold it to that.
- **One interface for all of them.** Every game answers the same questions
  (`moves`, `play`, `toPlay`, `computer`, `over`, `winners`), so one table,
  one bot runner or one test harness plays any of them.
- **Seeded deals.** A game is its seed and its moves. The same seed deals the
  same cards on every device, for ever.
- **Saved games.** As a one-line code, as JSON with a format number, as a
  record in words and as CSV. What is read back is played through the rules
  again, so a tampered save is refused rather than trusted.
- **Every move in words**, in English and Japanese: "Play Q♠",
  "愛子にクイーンを聞く".
- **The deck on its own.** Fifty-two card objects, a seeded shuffle, dealing,
  one-character codes (a whole deck is a 52-letter string) and card names.
- **A command line.** `toranpu deal`, `toranpu play hearts`, `toranpu check`.
  See [The command line](#the-command-line).
- **Card sounds**, recorded from real cards: shuffle, deal, turn over, play,
  gather and fan, off until a table asks. See [Card sounds](#card-sounds).
- **A hand on any page**: `<toranpu-hand>`, turned face down all at once or
  one by one, or scrunched into a bundle that shows nothing, or held closed
  to open into a fan on a tap. See [Hand controls](#hand-controls) and
  [A closed hand](#a-closed-hand-that-opens-with-a-tap).
- **Embedding**: any hand on any page, as an iframe or one tag, at three
  sizes. See [Embed a hand](#embed-a-hand).
- **Messy piles**: `<toranpu-pile>`, a stock or a discard pile from neatly
  squared to very messy, the same every time for the same seed. See
  [Messy piles](#messy-piles).
- **One card on any page**: `<toranpu-card>`, turned over by a tap, or any
  card as a picture. See [One card on any page](#one-card-on-any-page).
- **Card designs**: plain, four colour and the traditional English pattern
  with drawn kings, queens and jacks, jokers included. See
  [Card designs](#card-designs).
- **Card backs**, drawn as SVG: a classic red, a classic blue and ink with
  dots, recoloured or marked with a site's name. See [Card backs](#card-backs).
- **Your own branding.** Card backs from your own colours, art, picture or
  logo; faces for the standard cards in your own art; and wholly new cards,
  such as a territory card with a place and a soldier, a horse or a cannon,
  by a design you register, a slot or a function. See
  [Your own branding](#your-own-branding).
- **An optional React hook**, `useCardGame`.

## The games

[docs/games.md](./docs/games.md) has each game's rules in full, in our own
words, with a source. In short:

| Game | Players | `size` (how long a game lasts) | The computer |
| --- | --- | --- | --- |
| **Hearts** | 3–4 | 50 or 100: the score that ends it, lowest wins | Passes the queen of spades and the cards that catch her, ducks tricks, dumps the queen as soon as it is safe |
| **Spades** | 4, partners | 200, 300 or 500 to win | Bids what its hand is worth, nil only on a hand of nothing, ducks bags once the contract is made, covers its partner's nil |
| **Euchre** | 4, partners | 5 or 10 to win | Weighs the bowers, trump honours and outside aces before making trump, leads trump when its side made it |
| **Cribbage** | 2 | 61 or 121 to win | Keeps the four worth most over every possible starter, counting its throw for or against its crib; pegs for points and never leads a five |
| **Oh Hell** | 3–4 | 7 deals (one card up to seven) or 13 (and back down), highest score wins | Bids the tricks its high and long trumps and outside aces should take, the nearest it may; takes tricks as cheaply as it can until its bid is made, then sheds its dangerous cards |
| **Crazy Eights** | 2–7 | 50, 100 or 200 to win | Saves its eights, stays in its longest suit, sheds its points |
| **Go Fish** | 2–6 | 1: a single deal | Remembers everything asked and answered, and asks whoever it knows holds the rank |
| **Big Two** | 2–4 | 1, 3 or 5 deals, fewest points wins | Sheds low cards first, beats cheaply without breaking up pairs, holds its aces and twos for the end |
| **President** | 3–8 | 3, 5 or 7 rounds, most points wins | Hands back its lowest cards, leads low, keeps its twos and aces back |
| **Gin Rummy** | 2 | 50, 100 or 150 to win | Takes the discard only into a meld, throws the card that leaves least deadwood, never feeds the other player's melds, knocks as soon as it may |
| **War** | 2 | 25, 50, 100, 200 or 1000 turns, the most cards winning when they run out | Turns the cards over: there is nothing else to do, so a table of computers plays itself |

Cards are two-letter ids in play: rank `A 2 3 4 5 6 7 8 9 T J Q K`, then suit
`S H D C`. `"QS"` is the queen of spades and `"TD"` the ten of diamonds.

Moves are small objects, one shape per kind of action:

| Game | Moves |
| --- | --- |
| Hearts | `{ pass: [a, b, c] }`, `{ play: card }` |
| Spades | `{ bid: n }` (0 is nil), `{ play: card }` |
| Euchre | `{ order: true }`, `{ pass: true }`, `{ call: suit }`, `{ discard: card }`, `{ play: card }` |
| Cribbage | `{ crib: [a, b] }`, `{ play: card }` |
| Oh Hell | `{ bid: n }`, `{ play: card }` |
| Crazy Eights | `{ play: card, suit? }` (the suit an eight calls), `{ draw: true }`, `{ pass: true }` |
| Go Fish | `{ ask: seat, rank }` |
| Big Two | `{ play: cards }`, `{ pass: true }` |
| President | `{ give: cards }`, `{ play: cards }`, `{ pass: true }` |
| Gin Rummy | `{ draw: "stock" }`, `{ draw: "discard" }`, `{ discard: card }`, `{ knock: card }` |
| War | `{ turn: true }` |

`rules.moves(game)` always lists every move the player to move may make, so a
table never needs to know the rules to offer them.

## Every game's rules

Every game answers the same questions, whatever the game:

```ts
type CardGameRules<Game, Move> = {
  start(size: number, players: readonly string[], _reserved?: unknown, seed?: number, computers?: readonly boolean[]): Game | null;
  moves(game: Game): readonly Move[];          // every move the player to move may make
  play(game: Game, move: Move): Game | null;   // the next game, or null for a move the rules refuse
  toPlay(game: Game): number | null;           // the seat to move; null once it is over
  computer(game: Game): Move;                  // what a computer in that seat plays
  over(game: Game): boolean;
  winners(game: Game): readonly number[];      // seats; two for a winning partnership
  seats(game: Game): { players: readonly string[]; computers: readonly boolean[] };
  encode(game: Game): string;
  decode(text: string | null): Game | null;
  sensible?(game: Game, random: () => number): Move;  // a random move that still ends the game, for simulations
};
```

| Option of `newGame` | Means | Unless said |
| --- | --- | --- |
| `players` | one name a seat; the number of names is the number of players | required |
| `size` | how long the game lasts, in its own terms | the game's usual length |
| `seed` | the seed every deal is shuffled from, 1 to 2,147,483,647 | a random one |
| `computers` | one a seat: `true` where a computer plays | every seat a person's |

`newGame` gives `null` for a table the game is not offered for: too many or
too few players, or a size it does not play to. `CARD_GAME_TABLES` says what
each game offers.

## Solitaire: Klondike, FreeCell and Spider

Three games played alone, each its own entry point:
`@johnmorrisdotca/toranpu/klondike`, `/freecell` and `/spider`. Each has the
table as plain data, the rules as pure functions, a seed that deals the same
cards everywhere, its moves written as a short string, a solver, and what a
tap on a card means.

```ts
import { dealKlondike, dealOfSeed, deckOf, klondikeWon, movesFrom, playKlondike, solveKlondike } from "@johnmorrisdotca/toranpu/klondike";

const table = dealKlondike(deckOf(dealOfSeed(2026))!, { draw: 1, passes: Infinity });
movesFrom(table);                       // every legal move from here
const next = playKlondike(table, { kind: "draw" });   // a new table, or null for a move the rules refuse
const { moves } = solveKlondike(table); // a winning line, or null within the search's budget
```

- **Klondike**: seven columns, turn one card or three, and a limit on passes
  through the stock if you want one (`{ draw: 3, passes: 3 }`).
- **FreeCell**: eight columns, one to four free cells, and the longest run a
  move may carry worked out from the free cells and empty columns.
- **Spider**: two decks at one, two or four suits; a run from king to ace in
  one suit goes home by itself.
- **Seeds.** `dealOfSeed(seed)` (Klondike and FreeCell) and
  `spiderDealOfSeed(seed, suits)` write a deal as text you can store or send;
  `deckOf` and `spiderDeckOf` read it back and refuse anything that is not a
  whole deck.
- **Moves as text.** `encodeMoves` and `decodeMoves` write a game as a string
  of short codes (`d` draws, `w1` carries the waste to column 1), and
  `replay`, `replayFreeCell` and `replaySpider` play one back, table by table,
  or say it cannot be played.
- **Solvers.** `solveKlondike`, `solveFreeCell` and `solveSpider` search best
  first for a winning line within a budget of tables, never of time, so the
  same deal gets the same answer on a phone and on a server. That is what lets
  a site deal only winnable games, or name "the first winnable deal after this
  seed". `bestFirst` is the search itself, for a game of your own.
- **Taps.** `moveFor`, `homeMove`, `finishingMoves` and `stuck` (and their
  `freeCell…` and `spider…` forms) turn a tap on a card into the move a
  person means, send cards home, and say when no move is left.

These three came from [itsutsu.com](https://itsutsu.com), where people had
already played their deals: a seed deals exactly the cards it dealt there, and
the solvers find exactly the lines they found there, which the tests check
against deals and lines written down on the site before the move.

## The deck

```ts
import { cardName, cardShortName, dealRound, shuffledDeck, writeCards } from "@johnmorrisdotca/toranpu/deck";

const deck = shuffledDeck(42);                  // [{ suit: "clubs", rank: 3 }, …]: the same order for seed 42, always
const { hands, rest } = dealRound(deck, 4, 5);  // four hands of five, dealt one card at a time round the table
cardName(hands[0][0]);                          // "three of clubs"
hands[0].map(cardShortName).join(" ");          // "3♣ K♣ 10♦ A♥ 2♦"
rest.length;                                    // 32
writeCards(deck);                               // "pvOZziGxjrXCNQoybFwJnDstTEelhRBaPAVuSHLdkKUmcMYIgqWf": a letter a card
```

A card is `{ suit, rank }`, with the ace as rank 1 and the king as 13. A deck
is written as fifty-two letters, `A`–`Z` then `a`–`z`, in the order of a fresh
pack (spades, hearts, diamonds, clubs, each ace to king), so a deal is safe in
an address, a JSON body and a file name.

## Card sounds

Recordings of real cards for a table to play: the deck shuffled, a card dealt,
turned over or laid down, a trick gathered in, a hand fanned. Nothing sounds
unless a table asks, and nothing is fetched until the first sound.

```ts
import { createCardSounds } from "@johnmorrisdotca/toranpu/card-sounds";

const sounds = createCardSounds();                 // silent until asked: nothing is fetched yet
sounds.play("shuffle");
sounds.play("deal", { count: 13, delay: 900 });     // thirteen cards, one after another, after the shuffle
sounds.play("play");                               // a card laid on the table
muteButton.onclick = () => sounds.setMuted(!sounds.muted);
```

| Kind | What it is |
| --- | --- |
| `shuffle` | the deck shuffled |
| `deal` | a card slid to a hand; `{ count }` deals several, one every `gap` milliseconds |
| `flip` | a card turned over |
| `play` | a card laid on the table |
| `gather` | a trick or a pile swept in |
| `fan` | a hand spread open |

| Option of `createCardSounds` | Means | Unless said |
| --- | --- | --- |
| `muted` | start muted; nothing plays and nothing is fetched until `setMuted(false)` | `false` |
| `volume` | from 0 to 1, and a property to change later | `0.6` |
| `load` | where the recordings come from | the package's own `/sounds` |
| `window` | the window to make sound in; `null` for silence | the page's |

- **What it costs.** The player is about 3 kB. The thirteen recordings are
  50 kB of AAC (68 kB as the module that carries them), fetched by the first
  sound played and never before: a muted table, or one that never asks, never
  downloads them. Thirteen cards dealt are eight slides, not a wall of noise.
- **A browser only lets a page make sound after somebody has touched it**, so
  a sound asked for by code before any tap is silent, and `load()` fetches and
  decodes the recordings ahead of the first one.
- If the recordings cannot be fetched or decoded, a short sound made in the
  browser stands in. Nothing throws where there is no audio, as on a server or
  in a test.

The demo's table has a **Sound** switch by its Deal button, off until pressed,
and a panel that plays each sound. Card sounds from Kenney's
[Casino Audio](https://kenney.nl/assets/casino-audio), CC0;
[docs/credits.md](./docs/credits.md) names the files and what was done to them.

## Card backs

One home for the backs of the cards, for every card game in the family: this
package's tables, [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) and
[itsutsu.com](https://itsutsu.com). Three backs, drawn for Toranpu as SVG in
the same 100 by 140 box as every card: a classic red and a classic blue in the
manner of a casino back, and ink with dots.

```ts
import { cardBackSvg, cardBackUrl } from "@johnmorrisdotca/toranpu/card-backs";

cardBackSvg("classic-blue", { width: 70 });                    // '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="70" height="98" …'
cardBackUrl("ink-dots", { colour: "#8f2826", mark: "五つ" });  // "data:image/svg+xml;charset=utf-8,…": for an <img>, a CSS background or a canvas
```

| Back | Looks like |
| --- | --- |
| `classic-red` | a fine lattice on red inside a white border, a rosette in the middle |
| `classic-blue` | the same on blue |
| `ink-dots` | ivory dots on ink, the four suits in the middle |

| Option of `cardBackSvg` and `cardBackUrl` | Means | Unless said |
| --- | --- | --- |
| `colour` | the field's colour: a hex colour, a name, or `rgb()`, `hsl()`, `oklch()` | the back's own |
| `ink` | the colour of the lines and dots | the back's own |
| `paper` | the colour of the border | the back's own |
| `mark` | up to twelve characters in the middle, such as a site's name, in place of the ornament | none |
| `width` | pixels wide; the height is 1.4 times it | none: it fills what holds it |
| `title` | what a screen reader says | nothing: it is decoration |
| `art` | your own artwork for the whole back: SVG markup in the 100 by 140 box, in place of the lattice and the ornament | none |
| `image` | your own picture for the whole back: a `data:image/` address, an `https:` address or one on your own site | none |
| `logo` | your logo in the middle: SVG markup in a 100 by 100 box, or a picture's address; on a plate over the lattice, as it is over your own `art` or `image` | none |
| `logoSize` | how wide the logo is drawn, in units of the card's 100: at most 80 | `34` |

A colour that is not one is ignored rather than written into the drawing, and
the mark is escaped, so neither can put markup into a page. Drawn into a page
with no colour given, a back takes the CSS custom properties
`--toranpu-back`, `--toranpu-back-ink` and `--toranpu-back-paper` where they
are set, so a site's theme can recolour every back at once; as an image it
keeps its own colours. Each back is under 5 kB of SVG.

Your own back can be kept under a name, so that `back="frontier"` asks for it
on every card, hand, pile and table of the page: see
[Your own branding](#your-own-branding).

## Card designs

The faces of the cards, drawn as SVG in the same 100 by 140 box as the backs.
Plain is the default; four colour and the English pattern are there to
choose. A card is a picture, never text: its letters cannot be selected by a
drag or a long press.

```ts
import { cardFaceSvg, cardFaceUrl, loadCardDesign } from "@johnmorrisdotca/toranpu/card-faces";

cardFaceSvg("QS");                                    // '<svg … role="img" aria-label="queen of spades" …>…': the plain queen of spades
cardFaceUrl("TD", { design: "four-colour" });         // "data:image/svg+xml;charset=utf-8,…": a blue ten of diamonds
const english = await loadCardDesign("english");      // the English pattern, fetched now and not before
cardFaceSvg("KS", { design: english, width: 120 });   // the traditional king of spades, 120 pixels wide
cardFaceSvg("RJ", { language: "ja" });                // the red joker, ジョーカー down its corners
cardFaceSvg("R1");                                    // a rules card: the rules of Hearts in five lines
```

| Design | What it is | Size |
| --- | --- | --- |
| `plain` | drawn for Toranpu: big corners, the pips laid out as a real deck lays them, kings, queens and jacks as their letter in a frame, jokers in a jester's cap | in the package's 35 kB (11 kB gzipped) with the cards' names |
| `four-colour` | plain, with diamonds blue and clubs green, as many poker players like them | the same |
| `english` | the traditional English pattern, with its drawn kings, queens and jacks, by Dmitry Fomin, who gave it to the public domain (CC0); his jokers too | 715 kB (166 kB gzipped), its own entry point, fetched only when asked for |
| `realistic` | Byron Knoll's public-domain deck, round pips and a shaded ace, with Fomin's kings, queens, jacks, ace of spades and jokers | 91 kB of its own, and the English pattern for its courts; its own entry point, fetched only when asked for |

| Option of `cardFaceSvg` and `cardFaceUrl` | Means | Unless said |
| --- | --- | --- |
| `design` | `"plain"`, `"four-colour"`, a design handed in (`ENGLISH_PATTERN`, or what `loadCardDesign` gives), or the name of a design the page registered | `"plain"` |
| `width` | pixels wide; the height is 1.4 times it | none: it fills what holds it |
| `title` | what a screen reader says; `""` for none | the card's name in `language` |
| `language` | `"en"` or `"ja"`, for the card's name and a joker's corner word | `"en"` |

- **Every card, and the extras of a real deck.** A card is its id, as
  everywhere in Toranpu (`"QS"`, `"TD"`). The extras a pack is sold with are
  there too, though no game here deals them: the jokers `"RJ"` and `"BJ"`, two
  rules cards, `"R1"` (the rules of Hearts) and `"R2"` (of Spades), and the
  blank `"BL"`, each drawn in every design and named in both languages.
  Anything else gives `null`. A table of your own may deal them, as wild
  cards or for the look of it.
- **A hand writes them as words too.** `JOKER` is the next joker, red then
  black; `RULES` the next rules card; `BLANK` the blank. A hand holds at most
  what a pack might (`EXTRA_LIMITS`): four jokers, two rules cards and two
  blanks.

  ```html
  <toranpu-hand cards="AS KH QD JC JOKER"></toranpu-hand>
  <toranpu-hand cards="JOKER JOKER RULES BLANK"></toranpu-hand>
  ```
- **The English pattern by import**, where a bundler should carry it:
  `import { ENGLISH_PATTERN } from "@johnmorrisdotca/toranpu/card-faces/english"`.
  **By name**, where it should be fetched only when somebody chooses it:
  `await loadCardDesign("english")`. The realistic design the same way:
  `REALISTIC` from `@johnmorrisdotca/toranpu/card-faces/realistic`, or
  `await loadCardDesign("realistic")`.
- **A design of your own** is `{ name, box: [width, height], art: { KS: "<path …/>", … } }`:
  each card's drawing inside an `<svg>` of that box. A card it has no drawing
  for is drawn by its `fallback` design if it names one (the realistic design
  names the English pattern), and otherwise plain. It can draw cards no deck
  has too, and be registered by name: see [Your own branding](#your-own-branding).
- Plain and four colour take the CSS custom properties under
  [The drawings](#the-drawings) when put into a page. The English pattern
  keeps its own colours, as a printed deck does.

The English pattern's 54 files, their licence and what was done to them are
listed in [docs/credits.md](./docs/credits.md). The plain and four-colour
faces were drawn for Toranpu.

## Your own branding

A site's own cards: its own backs, its own faces for the standard cards, and
cards no deck has. Toranpu draws them all, turns them over and lays them out
in hands, piles and tables, so a game of your own, or a standard game in your
own colours, looks like yours and not like a library's. The demo's panel does
this with invented cards, a game of territories each showing a place and a
soldier, a horse or a cannon, every picture drawn for the demo.

Nobody's trademark or artwork ships with Toranpu, and none should be put in a
page that is not yours to put it in. What follows only draws what you give it.

**A back of your own.** Colours and a logo, your own art, or a picture:

```ts
import { cardBackSvg, registerCardBack } from "@johnmorrisdotca/toranpu/card-backs";

registerCardBack("frontier", { base: "classic-blue", colour: "#2f4a3a", ink: "#e7d9a8", logo: shield });   // a logo on the lattice
registerCardBack("frontier-art", { art: ridges, logo: shield });                                          // art of your own, the logo on it
cardBackSvg("frontier", { width: 70 });                                                                    // or draw it straight away
```

```html
<toranpu-card back="frontier" card="KS" face-down flip></toranpu-card>
<toranpu-hand cards="AS KH" back="frontier-art" face-down></toranpu-hand>
<toranpu-card back-image="/art/back.jpg" back-logo="/art/logo.svg" card="KS" face-down></toranpu-card>
```

A registered back is its options with the built-in back it starts from
(`base`, the classic red unless said); an option given later wins. `back-image`
and `back-logo` on an element are the page's own picture and logo by address,
for a page that registers nothing.

**Faces of your own, for the standard cards or for cards no deck has.** A
design is `{ name, box, art, draw?, label?, frame?, fallback? }`. A card
it draws takes any id of letters, digits, `-`, `_`, `.` or `:` (up to forty),
and a hand or a pile written as text reads those ids beside the usual ones.

```ts
import { registerCardDesign } from "@johnmorrisdotca/toranpu/card-faces";

registerCardDesign({
  name: "frontier",
  box: [100, 140],
  art: { KS: kingOfSpades },                                  // a face for a standard card, as SVG
  draw: (card, { language }) => territory(card, language),    // cards no deck has; null for a card that is not one
  label: (card, language) => nameOf(card, language),          // what a screen reader says; null leaves the usual name
});
```

```html
<toranpu-card card="ridgeway-horse" design="frontier" flip></toranpu-card>
<toranpu-hand cards="AS KS ridgeway-horse wild" design="frontier"></toranpu-hand>
<toranpu-table game="hearts" design="frontier" back="frontier"></toranpu-table>
```

| Field of a design | Means | Unless said |
| --- | --- | --- |
| `name` | kebab case, up to forty characters; never one of the package's own (`plain`, `four-colour`, `english`, `realistic`) | required |
| `box` | the width and height each card's drawing is made in, fitted to the card's height and centred | required |
| `art` | each card's drawing by its id, inside an `<svg>` of `box`: `KS`, or any id of your own | required, empty if every card is drawn by `draw` |
| `draw(card, { language })` | a card's drawing worked out from its id, in `"en"` or `"ja"`, or `null` where the design has no such card | none |
| `label(card, language)` | what a screen reader says for the card; `null` leaves it to the card's usual name, or its id | the usual name, or the id |
| `frame` | `"paper"` draws the card's paper and edge under the art; `"none"` for art that fills the whole card and draws its own edge | `"paper"` |
| `fallback` | the design that draws a card this one does not | plain |

A card the design does not draw is drawn plain if it is a standard card, and
is nothing if it is not, so a mistyped id shows as an empty card with no name
rather than somebody else's. Registering a design or a back again under the
same name replaces it, and every element on the page draws again with it, even
one on the page before the registering. `registerCardDesign` and
`registerCardBack` are also exported from `@johnmorrisdotca/toranpu/element`,
for a page that loads only the tags. Names are listed by
`registeredCardDesigns()` and `registeredCardBacks()`, and forgotten by
`unregisterCardDesign(name)` and `unregisterCardBack(name)`.

**A face put into the card.** An element in the card with `slot="face"` (or
`slot="back"`) is drawn as that side, in the card's box, on the card's
paper, in place of the card's own. It is in the page only while the card lies
that way up, as the drawn face is. The card's `label` attribute says what a
screen reader hears, as the card has no name in any deck. Style it with
`::part(face)` and `::part(back)`.

```html
<toranpu-card label="Harbour, soldier" flip>
  <svg slot="face" viewBox="0 0 100 140">…</svg>
  <img slot="back" src="/art/back.svg" alt="">
</toranpu-card>
```

**A face drawn by a function.** The card's `face` property is a function from
a card's id and its context (`{ language, design }`) to SVG markup, drawn on
the card's paper in a box 100 by 140 (or a whole `<svg>`), or to an element,
or to `null` to draw the card as its design does:

```js
card.face = (id, { language }) => `<text x="50" y="70" text-anchor="middle">${id}</text>`;
```

`cardFaceFromArt(art, options?)` does the same for one picture with no design
registered: the card's paper under your art, as an SVG document.

**What is kept out.** The markup you give is your own, and it is drawn into
shadow roots and other people's pages as a string, so what could run or fetch
is taken out of it first: `<script>`, `<foreignObject>`, frames, animation
elements and `<style>`, every `on…` handler, and any `href` that is not a
picture or a `#fragment` of the drawing (`cleanMarkup`). A picture's address is
a `data:image/` address, an `https:` or `http:` address, an address on your own
site, or a file name; `javascript:` and every other kind is refused
(`safeImageUrl`). That is a guard for your own code, not a sanitiser for
strangers' files: never give it what a visitor typed. As an image of its own
(`cardBackUrl`, `cardFaceUrl`), a drawing can load only a `data:image/`
picture, which is how browsers treat a picture inside a picture.

## One card on any page

A card as an element, in any design and with any back, turned over by a tap.
One script tag and one element, with nothing to install:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js"></script>
<toranpu-card card="KS" design="english" back="classic-blue" flip></toranpu-card>
```

Or from your own bundle, choosing when the elements are registered:

```ts
import { defineToranpuElements } from "@johnmorrisdotca/toranpu/element";

defineToranpuElements();
document.addEventListener("toranpu-flip", (event) => console.log(event.detail));   // { card: "KS", faceDown: true }
```

| Attribute of `<toranpu-card>` | What it does |
| --- | --- |
| `card` | the card: `QS`, `TD`, `RJ`, `BJ`; or the id of a card of a design the page registered |
| `design` | `plain` (unless said), `four-colour` or `english`, fetched the first time a card asks for it; or the name of a design the page registered |
| `back` | `classic-red` (unless said), `classic-blue` or `ink-dots`; or the name of a back the page registered |
| `back-colour`, `back-image`, `back-logo`, `mark` | the back's colour, a picture for the whole back, a logo in its middle, and the words in its middle, as `cardBackSvg` takes them |
| `label` | what a screen reader says for a card of your own, which has no name in any deck |
| `face-down` | shows the back. While the card lies face down its face is not in the page at all |
| `flip` | a tap, Enter or Space turns it over, with a turn a device asking for less motion skips. The card is then a button |
| `marked` | a dot on its corner, seen face up and face down, to follow it as it moves |
| `size` | `small` (46 pixels wide), `medium` (70, unless said) or `large` (104) |
| `width` | its width in pixels, in place of `size` |
| `sound` | the turn makes a sound (see [Card sounds](#card-sounds)) |
| `lang` | `ja` for the card's name in Japanese; the page's language unless said |

- `slot="face"` and `slot="back"` put your own element in as a side, and a
  `face` property that is a function draws the face from the card's id: see
  [Your own branding](#your-own-branding).
- A framework that sets a property rather than an attribute (React 19, Vue 3
  and Svelte 5 do, when the element has a property of that name) is covered:
  `flip` is a method and an attribute, and `card.flip = true` sets the
  attribute while `card.flip()` goes on turning the card. So do `mark` on a
  hand, `cards` on a hand or a pile, `count` on a pile and `game` on a table.
- `faceDown` is a property too, `flip()` a method that turns it as a tap
  does, and `spin(options?)` spins it where it lies, as on a hand. Each turn is a `toranpu-flip` event that bubbles, its `detail`
  `{ card, faceDown }`.
- A screen reader hears the card's name ("king of spades", "スペードのキング"),
  or "a card, face down".
- It is drawn in its own shadow DOM, so the page's styles cannot upset it,
  and it takes the custom properties under [The drawings](#the-drawings), so
  the page's theme still colours it. Imported on a server, the elements are
  defined and do nothing.

**As a picture.** Every card and back is on the demo site as an SVG file of
its own, for an `<img>` anywhere:
`https://johnmorrisdotca.github.io/toranpu/cards/<design>/<card>.svg` (such
as [`cards/english/KS.svg`](https://johnmorrisdotca.github.io/toranpu/cards/english/KS.svg))
and `https://johnmorrisdotca.github.io/toranpu/backs/<back>.svg`. Or drawn by
the page itself, with no request at all, as a data URL from `cardFaceUrl`
and `cardBackUrl`.

## Hand controls

`<toranpu-hand>` is a hand of cards on any page, fanned, in any design and
with any back, and everything a person does with a hand where it lies: turn
it face down, all at once or one card after another, or turn chosen cards
over; gather it into one bundle that never says how many; part it at one card
to bring that card out; sort it, group it, mix it up, toss a card or swap
one; mark a card to follow it while it is face down; and spin a card on the
table.

```html
<toranpu-hand id="mine" cards="AS KH QD JC 10S" design="english"></toranpu-hand>
<script type="module">
  import "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js";

  const hand = document.getElementById("mine");
  await hand.hide({ oneByOne: true });   // face down, one card after another; settles once all are down
  await hand.show();                     // face up again, all at once
  await hand.scrunch();                  // one bundle: no faces and no count in the page
  await hand.spread();                   // laid out again as it was
  await hand.show();                     // face up
  await hand.toggle(["KH", "QD"]);       // just those two turned over
  await hand.partAt("QD");               // the queen lifted out, the cards either side drawn away
  hand.mark("KH");                       // a dot on the king's corner, face up or face down
  await hand.spin("KH", { direction: "anticlockwise" });
</script>
```

| Attribute of `<toranpu-hand>` | What it does |
| --- | --- |
| `cards` | the hand: ids separated by spaces or commas (`AS KH 10D`), or the deck's one-letter codes |
| `face-down` | every card shows its back, and no face is in the page |
| `turned` | cards that show the other side from the rest: face up in a hand face down, face down in one face up |
| `scrunched` | squared up into one bundle of three cards whatever the hand, so nothing says how many; face down no face is in the page either, and face up its top card shows |
| `parted` | the card the hand is parted at: lifted out, upright and wholly in view, the cards either side drawn away from it |
| `marked` | cards that carry a mark, a dot on the corner seen face up and face down alike (`--toranpu-marker` colours it) |
| `order` | `rank` sorts the hand low to high, the ace high; `suit` groups it by suit (spades, hearts, clubs, diamonds), each in rank order; `face` puts the number cards, ace to ten, before the face cards; left out, the cards lie as dealt |
| `receive` | where a card given by `replace()` lands: `front`, or `end` unless said |
| `closed` | how closed the hand lies, from `0` (a clear fan) to `1` (squared up, only the top card showing): see [A closed hand that opens with a tap](#a-closed-hand-that-opens-with-a-tap) |
| `reveal` | a tap, Enter or Space opens a closed hand into a fan, and closes it again |
| `deal-after` | given new cards, how many milliseconds this hand waits before it gathers the old ones in and opens on the new: give each seat a little more than the one before, and the hands are dealt in turn round the table |
| `design`, `back`, `back-colour`, `back-image`, `back-logo`, `mark`, `size`, `width`, `lang`, `sound` | as on `<toranpu-card>` |

| Method | What it does |
| --- | --- |
| `hide({ oneByOne?, gap? })` | turns every card face down: at once, or one by one, `gap` milliseconds apart (110 unless said) |
| `show({ oneByOne?, gap? })` | turns them face up again |
| `toggle(cards?, { oneByOne?, gap? })` | turns the cards named (one id or a list) over, each to its other side; every card unless named |
| `scrunch()`, `spread()` | squares the hand into a bundle, each card keeping its side, and lays it out again |
| `partAt(card)`, `unpart()` | parts the hand at a card, a group either side of it (one at an end), and closes it up again |
| `open()`, `close(closed?)` | fans a closed hand, and squares it again (all the way unless said) |
| `sort()`, `group(by?)`, `unsort()` | sorts by rank, groups by suit (or with `"face"`, number cards then face cards), and lays the hand out as dealt again: each card slides to its new place |
| `mixUp()` | mixes the hand up, the same cards in another order, never the one it was in |
| `toss(card)` | tosses a card out: it lifts away and the rest close up |
| `replace(card, next, lands?)` | tosses a card out and takes the next card in its stead, dropped in at the front or the end (`lands`, else `receive`, else the end) |
| `mark(cards)`, `unmark(cards?)` | marks the cards named, and takes the marks off them (or off every card) |
| `spin(cards?, { direction?, turns?, ms? })` | spins the cards named, or all, where they lie: fast, then slowing to a stop as they were, `turns` whole turns later (3 unless said), `clockwise` unless said `anticlockwise` |

- Each returns a promise that settles when the cards have stopped moving, and
  each change is a `toranpu-hand` event that bubbles, its `detail`
  `{ faceDown, scrunched, open, turned, parted }`. The `cards` property reads and sets the
  hand as a list.
- The cards turn over in place and slide together; a device that asks for less
  motion gets the end at once.
- **A new deal is seen.** Given other cards (a shuffle, a new seed), a hand
  already on the page gathers its old cards into a stack where it lies, then
  opens on the new ones, in the same room, with the shuffle's sound where
  `sound` is on. Seat after seat, with `deal-after`:

  ```js
  seats.forEach((hand, seat) => {
    hand.setAttribute("deal-after", String(seat * 150)); // seat 1 at once, seat 2 after 150 ms, …
    hand.cards = newHands[seat];
  });
  ```
- **Scrunch only gathers.** `scrunch()` squares the hand where it lies, each
  card keeping its side: a hand face down becomes a bundle that says nothing,
  one face up shows its top card and still no count. (Before 2.13 it also
  turned the hand face down; `hide()` then `scrunch()` does that now.)
- **Turn over, part, mark, spin.** `toggle()` turns any cards over, so a hand
  can lie half face up. `partAt()` brings one card out: it lifts upright and
  wholly in view, and the cards either side are drawn away into a group on
  each side, closing up so the hand keeps its room wherever it can. A mark is
  a dot on a card's corner, seen face up and face down, to follow a card as it
  moves about; a screen reader hears "king of hearts, marked". A spin turns a
  card about its own middle, slowing as a card on a cloth does.
- **Sort, group, mix, toss, replace.** The cards move as a person would move
  them: sorted or mixed, each slides from where it lay to its new place; a
  tossed card lifts away and the rest close up; a card given drops in.

  ```js
  await hand.group();                    // spades, hearts, clubs, diamonds, each in rank order
  await hand.toss("QH");                 // the queen of hearts lifts away
  await hand.replace("2C", "AS", "front"); // the two of clubs out, the ace of spades in at the front
  ```
- **A hand keeps one box.** Open, closed, squared up or face down, it keeps
  the room its whole fan takes and lies in the middle of it, so nothing moves
  when an effect ends.
- A face down card's face, and a bundle's cards, are taken out of the page
  once the cards are still: a screen reader hears "a hand face down, cards:
  5", or for a bundle only "a hand of cards, squared up face down". What
  the page itself was given (the `cards` attribute) is the page's to keep
  secret: a game should not put an opponent's cards in the page at all.
- The hand is as wide as its whole fan, and never wider than the room it is
  given: in less room its cards are drawn smaller, so it never pokes out of a
  phone's screen.

## A closed hand that opens with a tap

A hand can lie squared up, only its top card showing and the rest partly
hidden, and open into a clear fan when it is tapped, as a reveal. `closed`
says how closed it starts, from `0` (a fan) to `1` (squared up).

```html
<toranpu-hand id="yours" cards="KS 7C 4C QH 10H" closed="0.9" reveal></toranpu-hand>
<script type="module">
  import "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js";

  document.getElementById("yours").addEventListener("toranpu-hand", (event) => console.log(event.detail.open));   // 1 once it is open
</script>
```

- A tap, Enter or Space opens it with the cards sliding into a fan, and the
  next closes it again, as far as it was. A device that asks for less motion
  gets the fan at once.
- `open()` and `close(closed?)` do the same from code, and `closed` can be
  set at any time: `0.5` leaves it half open.
- It is a button to a screen reader, with `aria-expanded` saying whether it is
  open, and it names its cards.
- Where the cards lie is `handLayout(count, { open })`, the same arithmetic
  the element uses, for a table of your own.

## Messy piles

`<toranpu-pile>` is a stock to draw from or a discard pile: its top card on
top, and the cards under it showing as a stack, from neatly squared to very
messy. Each pile is laid out from its own seed, so it always looks the same,
and a card put on top moves none of those under it.

```html
<toranpu-pile count="24" face-down messiness="0.4" seed="7"></toranpu-pile>
<toranpu-pile cards="3C 9D QS 7H" messiness="0.6" seed="7"></toranpu-pile>
```

| Attribute of `<toranpu-pile>` | What it does |
| --- | --- |
| `cards` | the pile from the bottom up, its top card last: ids or one-letter codes |
| `count` | for a face-down pile, how many cards, with no need to say which |
| `face-down` | every card shows its back, and no face is in the page |
| `messiness` | from `0` (squared up, each card's edge showing under the one above) to `1` (very messy): unless said, `0.3` |
| `seed` | the pile's own seed, a whole number: unless said, `1` |
| `depth` | how many cards under the top are drawn at most, so a pile of fifty costs what a pile of ten does: unless said, `10` |
| `design`, `back`, `back-colour`, `back-image`, `back-logo`, `mark`, `size`, `width`, `lang` | as on `<toranpu-card>` |

- A pile keeps its size as cards come and go: the room round it is set by
  its messiness and depth, never by what it holds, so nothing next to it
  moves when a card is drawn.
- A screen reader hears "a pile face down, cards: 24" or "a pile, queen of
  spades on top, cards: 4"; an empty pile is drawn as a dashed outline.
- Where each card lies is `pileLayout(count, { messiness, seed, depth })`, the
  same arithmetic the element uses, for a pile of your own.
- The demo's own table draws its stock and its discard pile this way, in
  the look and the messiness chosen on the page.

## Embed a hand

Any hand of cards on any web page, written in the card codes (`AS KH 10D`, or
the deck's one-letter codes). Two ways, at three sizes.

An iframe, where the page allows no scripts (a blog, a wiki, a forum):

```html
<iframe src="https://johnmorrisdotca.github.io/toranpu/embed/?hand=AS+KH+QD+JC+10S&size=medium" title="A hand of cards" width="360" height="200" style="border:0;max-width:100%" loading="lazy"></iframe>
```

One tag, where the page may run a script, with nothing to install:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js"></script>
<toranpu-hand cards="AS KH QD JC 10S" size="medium"></toranpu-hand>
```

| Size | The iframe shows | Its height, for five cards at 360 pixels wide |
| --- | --- | --- |
| `small` | the hand alone, its cards 46 pixels wide | 160 |
| `medium` | the hand, its cards 70 pixels wide | 200 |
| `large` | the hand, its cards 104 pixels wide, named in words, with a button that turns it face down one card at a time and back | 360 |

The iframe's address takes `hand` (or `card` for one card, which turns over
on a tap), `size`, `lang` (`en` or `ja`), `design`, `back`, `back-colour` and
`felt` and `ink` as `rrggbb`, `mark`, `face-down`, `closed` (a closed hand
that opens on a tap) and `sound`. Anything that is not a hand is answered
with a line saying how to write one, and only what looks like a colour is
taken as one. The page tracks nothing, loads nothing from anywhere else and
keeps nothing on the visitor's device. It tells the page that frames it its
height, `{ toranpu: "height", height }`, so a frame can be made to fit, and
each change, `{ toranpu: "hand", faceDown, scrunched, open, turned, parted }` or
`{ toranpu: "flip", card, faceDown }`, by `postMessage`.

The tag is the element of [Hand controls](#hand-controls), so it takes every
attribute listed there. [The demo](https://johnmorrisdotca.github.io/toranpu/#embed-panel)
writes both for any hand typed into it, in the look chosen there, and shows
the iframe as it will be framed.

## A whole table on a page

Any of the eleven games, ready to play, in one tag: the seats round the felt,
what lies on the table (the trick, the pile to beat, the stock and the
discard), the hand of whoever is to play and the moves they may make, with
computers in the other seats, playing after a short pause.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/table-define.js"></script>
<toranpu-table game="crazy-eights" players="3" cloth="blue" messiness="0.4"></toranpu-table>
```

| Attribute of `<toranpu-table>` | What it does |
| --- | --- |
| `game` | any of the eleven, by its key or in kebab case: `hearts` (unless said), `spades`, `euchre`, `cribbage`, `oh-hell`, `crazy-eights`, `go-fish`, `big-two`, `president`, `gin-rummy`, `war` |
| `players` | how many sit at the table, within the game's own range (its usual number unless said) |
| `people` | how many seats, the first ones, are people's; the rest are computers (1 unless said) |
| `names` | the seats' names, separated by commas; the first is "You" unless said |
| `seed` | the deal: the same seed deals the same cards |
| `cloth` | the felt: `green` (unless said), `blue`, `red`, `black` or `wood`, the family's five |
| `messiness` | how untidy the stock and the discard lie, from 0 to 1 (0.3 unless said) |
| `delay` | how long a computer thinks before it plays, in milliseconds (550 unless said) |
| `design`, `back`, `back-colour`, `back-image`, `back-logo`, `mark`, `size`, `width`, `lang`, `sound` | as on `<toranpu-card>` |

- `deal(seed?)` deals again; the `game` property is the game as it stands,
  in the game's own form (`toCode` and the rest save it).
- Each move is a `toranpu-table` event that bubbles, its `detail`
  `{ seat, move, over, winners }`.
- The table carries the rules of all eleven games, so it is an entry point of
  its own: a page that wants only a card or a hand imports `element`.

## Words

```ts
import { cardShort, cardText, gameName, gameSays, moveText } from "@johnmorrisdotca/toranpu";

gameName("president");                       // "President"
gameName("president", "ja");                 // "大富豪"
cardText("QS");                              // "queen of spades"
cardText("QS", "ja");                        // "スペードのクイーン"
cardShort("TD");                             // "10♦"

moveText("hearts", { play: "QS" });                                       // "Play Q♠": a button's words
moveText("hearts", { play: "QS" }, { form: "did" });                      // "plays Q♠": a record's
moveText("hearts", { pass: ["QS", "AH", "KH"] }, { form: "hidden" });     // "passes cards: 3": what the table saw
moveText("spades", { bid: 0 });                                           // "Bid nil"
moveText("crazyEights", { play: "8S", suit: "D" }, { language: "ja" });   // "8♠を出してダイヤを指定する"
```

| Option of `moveText` | Means | Unless said |
| --- | --- | --- |
| `language` | `"en"` or `"ja"` | `"en"` |
| `form` | `"offer"` for a button, `"did"` for a record, `"hidden"` for what another player saw | `"offer"` |
| `players` | names by seat, for a move that names a player | "Seat 2" |

## Export and import

A game is its table, its seed and its moves, and that is all that is ever
written. Four forms:

```ts
import { fromCode, fromJSON, newGame, rulesFor, toCSV, toCode, toJSON, toText } from "@johnmorrisdotca/toranpu";

const players = ["You", "Aiko", "Ben"];
const game = newGame("goFish", { players, seed: 2026, computers: [false, true, true] })!;

toCode("goFish", game);    // one line: what each game's own `encode` writes
toJSON("goFish", game);    // the JSON below
toText("goFish", game);    // a record in words, a line a move
toCSV("goFish", game);     // a row a move, for a spreadsheet

fromJSON(toJSON("goFish", game));   // { kind: "goFish", game }: the same game
fromCode(toCode("goFish", game));   // the same; either reads either
fromJSON("not a game");             // null
```

The code:

```json
{"v":1,"g":"goFish","size":1,"players":["You","Aiko","Ben"],"computers":[false,true,true],"seed":2026,"moves":[]}
```

The JSON:

```json
{
  "format": 1,
  "generator": "toranpu 2.14.1",
  "game": "goFish",
  "size": 1,
  "players": [
    "You",
    "Aiko",
    "Ben"
  ],
  "computers": [
    false,
    true,
    true
  ],
  "seed": 2026,
  "moves": []
}
```

| Field of the JSON | Holds |
| --- | --- |
| `format` | 1. It goes up only when a reader of the old shape would be wrong about the new one |
| `generator` | what wrote it, for people |
| `game` | which of the eleven |
| `size` | how long the game lasts, in its own terms |
| `players` | one name a seat |
| `computers` | one a seat: `true` where a computer plays |
| `seed` | the seed every deal is shuffled from |
| `moves` | every move so far, in order |

**Nothing read is trusted.** `fromJSON` starts the game from its table and
seed and plays every move through the rules again. A move the rules refuse, a
table the game is not offered for, a later format or a game it has never
heard of all give `null`. Hands, piles and scores are never read, because they
are never written: the moves make them again.

The record in words names every card, the ones passed face down too, so it is
for afterwards and not for a player in the middle of a game. The CSV's columns
are `move`, `seat`, `player`, `action`, `cards`, `detail` (the move as JSON)
and `text`; its lines end CRLF, and it is not read back.

## The command line

```sh
npm install -g @johnmorrisdotca/toranpu    # then `toranpu`, or use npx with nothing installed
```

```
Usage: toranpu <command> [options]

A deck of playing cards and eleven card games, dealt from a seed.

  toranpu games                     the eleven games, and their tables
  toranpu deal --seed 42            four hands of thirteen from a seeded shuffle
  toranpu deal -n 2 -e 5 -s 42      two hands of five, and what is left
  toranpu deal hearts --seed 42     a game's own first deal, seat by seat
  toranpu play euchre --seed 42     computers play a whole game; who won
  toranpu play hearts -s 42 --text  the same, with every move in words
  toranpu check saved.json          is this a saved game? (or --stdin)

Options:
  -s, --seed <n>       a whole number from 1; the same seed deals the same cards
  -p, --players <n>    how many sit down (each game's usual number unless said)
      --size <n>       how long the game lasts, in its own terms (see games)
  -n, --hands <n>      deal: how many hands (4 unless said)
  -e, --each <n>       deal: cards to a hand (the whole deck unless said)
      --text           play: print every move in words
  -j, --json           print JSON (format 1)
      --csv            print CSV
      --stdin          check: read the saved game from standard input
      --lang <en|ja>   English or Japanese (default: your system's)
      --no-color       no colour (NO_COLOR is honoured too)
  -h, --help           this help
  -v, --version        the version

With no seed, one is drawn and named on standard error, so that the run can
be repeated. Exit codes: 0 done, 1 what was asked for could not be done
(a saved game that is not one), 2 the command was wrong.
```

```sh
$ toranpu deal euchre --seed 42
Seat 1: 9♥ 10♥ Q♥ J♣ K♣
Seat 2: 9♠ K♠ A♠ 9♣ 10♣
Seat 3: Q♠ K♥ A♥ J♦ Q♦
Seat 4: J♠ A♣ 10♦ K♦ A♦
Turned up: 10♠
$ toranpu play euchre --seed 42
Euchre for 4, seed 42: 330 moves. Won by Seat 1, Seat 3.
Scores: 11 6
$ toranpu play euchre --seed 42 --json | toranpu check --stdin
Euchre for 4, seed 42, 330 moves. Over: won by Seat 1, Seat 3.
```

A game is found by its key or its name in either language (`crazyEights`,
`crazy-eights`, `大富豪`). The language follows `--lang`, then `LC_ALL`,
`LC_MESSAGES` and `LANG`, then the system's. Output is plain when piped. It is
run as a child process on Linux, macOS and Windows in CI.

From code, the whole command line is one pure function:

```ts
import { runCli } from "@johnmorrisdotca/toranpu";

runCli(["deal", "--hands", "2", "--each", "2", "--seed", "42"]).out.split("\n")[0];   // "Seat 1: 3♣ 2♥"
```

## API

Everything is typed, and your editor shows each function's documentation. The
[API reference](https://johnmorrisdotca.github.io/toranpu/api.html) lists
every export of every entry point with its signature and its doc comment; it
is made from the source by `pnpm site`. What follows is the map.

### `@johnmorrisdotca/toranpu`

| Export | What it does |
| --- | --- |
| `newGame(kind, { players, size?, seed?, computers? })` | A new game, or `null` for a table the game is not offered for |
| `rulesFor(kind)` | That game's `CardGameRules`, typed with its own game and move |
| `playComputers(kind, game)` | Plays every computer move due; returns `{ game, moves }` |
| `randomSeed()` | A fresh seed, 1 to 2³¹ − 1 |
| `CARD_GAME_RULES` | Every game's rules, by kind |
| `CARD_GAME_TABLES` | Every game's table: fewest, most and usual players, the sizes offered and the usual one |
| `CARD_GAME_LIST`, `CARD_GAME_KINDS` | The eleven kinds |
| `HEARTS_SIZES`, `SPADES_SIZES`, `EUCHRE_SIZES`, `CRIBBAGE_SIZES`, `OH_HELL_DEALS`, `CRAZY_EIGHTS_SIZES`, `GO_FISH_SIZES`, `BIG_TWO_DEALS`, `PRESIDENT_ROUNDS`, `GIN_SIZES`, `WAR_ROUNDS` | The sizes each game offers |
| `hearts`, `spades`, `euchre`, `cribbage`, `ohHell`, `crazyEights`, `goFish`, `bigTwo`, `president`, `ginRummy`, `war` | Each game's own exports, as a namespace |
| `toJSON`, `fromJSON`, `toCode`, `fromCode`, `toText`, `toCSV`, `savedGame`, `recordOf`, `SAVE_FORMAT`, `CSV_COLUMNS` | A game written out and read back: see [Export and import](#export-and-import) |
| `gameName`, `gameSays`, `cardText`, `cardShort`, `cardsShort`, `suitName`, `suitSymbol`, `rankName`, `namesList`, `moveText` | The games, the cards and the moves in words: see [Words](#words) |
| `STRINGS`, `fillIn`, `languageOf` | Every string in English and Japanese, and the two helpers that read it |
| `cardGameCodec(name, start, play, isMove)`, `computerSeats`, `isCardList` | The save format, for a game of your own |
| Card ids: `FULL_DECK`, `RANK_LETTERS`, `isCard`, `rankOf`, `suitOf`, `cardOf`, `cardOfId`, `cardWords`, `rankWords`, `suitWords` | Reading and naming `"QS"`-style cards |
| Dealing: `shuffledDeck(seed, deal)`, `reshuffled`, `mixSeed`, `dealRound`, `without`, `allDifferent`, `choices`, `nextSeat` | What every game does before its own rules begin |
| `seededRandom(seed)`, `shuffled(list, random)` | The seeded stream every deal comes from |
| `runCli(args, surroundings?)`, `cliLanguage` | The command line as a function |
| `VERSION` | This package's version |

Types: `CardGameKind`, `CardGameRules`, `CardGameTable`, `CardSeats`,
`CardId`, `CardSuit`, `CardRank`, `GameOf`, `MoveOf`, `NewGameOptions`,
`CardGamePlays`, `KeptCardGame`, `CardGameCodec`, `SavedGame`, `ReadGame`,
`RecordedMove`, `MoveTextOptions`, `Language`, `ToranpuStrings`,
`CliSurroundings`, `CliResult`, `Random`.

### `@johnmorrisdotca/toranpu/<game>`

Each game is also its own entry point, so a table that plays one game loads
one game. They follow one naming pattern (shown for Hearts):

| Export | What it does |
| --- | --- |
| `startHearts`, `playHearts`, `heartsMoves`, `heartsWinners` | The rules as plain functions |
| `heartsComputer(game)`, `heartsView(game)` | The computer's move, and the part of the game its seat can see |
| `encodeHearts`, `decodeHearts` | The save format |
| `HEARTS_RULES` | All of the above as one `CardGameRules` |
| `HeartsGame`, `HeartsMove`, … | The game's types |
| Game helpers | Scoring and ordering: `heartsPoints`, `trickWinner`, `spadesTrickWinner`, `euchreHeight`, `showCount` (Cribbage), `bestLayout` and `deadwoodOf` (Gin), `bigTwoBeats`, `presidentTitle` and more |

Entry points, each a game's name in kebab case: `hearts`, `spades`, `euchre`,
`cribbage`, `oh-hell`, `crazy-eights`, `go-fish`, `big-two`, `president`,
`gin-rummy`, `war`. A game's key in a saved game stays as it was (`ohHell`), so a game
saved before 2.0 still reads.

The solitaires, Klondike, FreeCell and Spider, are entry points too (by those names in lower case),
with a pattern of their own (they have no seats and no computer player): see
[Solitaire](#solitaire-klondike-freecell-and-spider) above.

### `@johnmorrisdotca/toranpu/deck`

| Export | What it does |
| --- | --- |
| `freshDeck()`, `shuffledDeck(seed)` | Fifty-two `{ suit, rank }` cards, sorted or shuffled from a seed |
| `dealRound(deck, hands, each)`, `dealAll(deck, hands)`, `take(deck, n)` | Dealing, one card at a time round the table |
| `cardCode`, `cardFromCode`, `writeCards`, `readCards`, `isWholeDeck` | One character a card: a deck as a 52-letter string, safe in an address |
| `cardId`, `cardFromId` | The two-letter ids the games use |
| `cardName`, `cardShortName`, `colourOf`, `isRed`, `sameCard`, `cardIndex`, `cardAt`, `sortedHand` | Naming, colour, place and sorting |
| `SUITS`, `RANKS`, `DECK_SIZE`, `SUIT_DISPLAY`, `RANK_DISPLAY`, `CARD_ALPHABET` | The vocabulary |
| `seededRandom`, `shuffled` | The seeded stream, and the shuffle |

### `@johnmorrisdotca/toranpu/react`

`useCardGame(kind, options, computerDelay = 700)` returns
`{ game, toPlay, computerToPlay, moves, over, winners, play, restart }`.
Computers move by themselves, one move every `computerDelay` milliseconds.

### `@johnmorrisdotca/toranpu/card-sounds`

| Export | What it does |
| --- | --- |
| `createCardSounds(options?)` | A table's sounds: `play(kind, { count?, gap?, delay? })`, `load()`, `muted` and `setMuted`, `volume`, `close()` |
| `CARD_SOUND_KINDS` | The six kinds: `shuffle`, `deal`, `flip`, `play`, `gather`, `fan` |
| `soundTimes(count, gap?)` | When each of several sounds starts, at most `MOST_SOUNDS_AT_ONCE` (8) |

Types: `CardSoundKind`, `CardSounds`, `CardSoundsOptions`,
`PlayCardSoundOptions`, `CardSoundData`, `CardSoundWindow`.

### `@johnmorrisdotca/toranpu/sounds`

`CARD_SOUND_DATA`, the recordings as base64 AAC by name (`deal-2`), and their
type `CardSoundFile`. `createCardSounds` loads it by itself; import it only
to play the recordings your own way.

### `@johnmorrisdotca/toranpu/card-backs`

| Export | What it does |
| --- | --- |
| `cardBackSvg(name?, options?)` | A back as a whole SVG document |
| `cardBackUrl(name?, options?)` | The same as a data URL |
| `registerCardBack(name, back)` | Keeps your own back under a name, for `back="…"` on every element of the page |
| `unregisterCardBack(name)`, `registeredCardBacks()` | Forgets one; lists the names registered |
| `cardBackNames()` | The package's three backs' names and the ones registered |
| `CARD_BACKS` | The three backs' names |
| `CARD_BACK_LOOK` | Each back's own field, ink and paper colours |
| `CARD_BACK_PROPERTIES` | The CSS custom properties a back in a page takes its colours from |
| `CARD_BOX`, `SUIT_PATHS` | The card's 100 by 140 box, and the four suits drawn as paths in a box of 100 |

Types: `CardBackName`, `CardBackOptions`, `RegisteredCardBack`, `CardSuitLetter`.

### `@johnmorrisdotca/toranpu/card-faces`

| Export | What it does |
| --- | --- |
| `cardFaceSvg(card, options?)` | A face as a whole SVG document, or `null` for what is not a card |
| `cardFaceUrl(card, options?)` | The same as a data URL |
| `loadCardDesign(name)` | A design by name, fetched when first asked for: `"english"`; a design the page registered is given as it is |
| `registerCardDesign(design)` | Keeps your own design under its name, for `design="…"` on every element of the page |
| `unregisterCardDesign(name)`, `registeredCardDesigns()` | Forgets one; lists the names registered |
| `cardFaceFromArt(art, options?)` | One face from artwork of your own, on the card's paper, as an SVG document |
| `cleanMarkup(markup)`, `safeImageUrl(url)` | Markup with what could run or fetch taken out; a picture's address, or `null` |
| `CUSTOM_CARD_ID` | What the id of a card of your own may look like |
| `CARD_DESIGNS` | The designs' names: plain, four colour, the English pattern and realistic |
| `JOKERS` | The jokers' ids, `RJ` and `BJ` |
| `EXTRA_CARDS` | The extras of a deck no game deals: the jokers, the rules cards R1 (Hearts) and R2 (Spades), and the blank BL |
| `EXTRA_LIMITS` | The most of each a hand holds: four jokers, two rules cards, two blanks |
| `isCardFace(text)` | Whether a face can be drawn for it |
| `faceName(card, language?, design?)` | A face's name in words, jokers included; a card of a design of your own by that design's label |
| `pipPlaces(count)` | Where a number card's pips go, and which are drawn upside down |
| `CARD_FACE_COLOURS`, `CARD_FACE_PROPERTIES` | The faces' own colours, and the CSS custom properties that change them |

Types: `CardDesign`, `CardDesignName`, `CardFaceOptions`.

### `@johnmorrisdotca/toranpu/card-faces/english`

`ENGLISH_PATTERN`, the English pattern as a `CardDesign`: all fifty-two cards
and both jokers in a box 360 by 540.

### `@johnmorrisdotca/toranpu/card-faces/realistic`

`REALISTIC`, the realistic design as a `CardDesign`: Byron Knoll's thirty-nine
number cards and aces, with `ENGLISH_PATTERN` as its fallback for every
other card.

### `@johnmorrisdotca/toranpu/element`

| Export | What it does |
| --- | --- |
| `defineToranpuElements()` | Registers the elements under their tags, once |
| `ToranpuCard` | The `<toranpu-card>` element's class |
| `ToranpuHand` | The `<toranpu-hand>` element's class |
| `registerCardDesign(design)`, `registerCardBack(name, back)` | As from `card-faces` and `card-backs`: your own faces and backs, by name |
| `ToranpuPile` | The `<toranpu-pile>` element's class |
| `BUNDLE_BACKS` | How many backs a scrunched hand shows, whatever its size: 3 |
| `TORANPU_TAGS` | The elements' tags |
| `ELEMENT_SIZES` | The card widths `size` names: small 46, medium 70, large 104 |
| `handLayout(count, options?)` | Where each card of a hand lies, fanned or squared up |
| `partedHandLayout(count, at, options?)` | Where each card lies with the hand parted at its card in that place, from 0: it lifted clear, a group either side |
| `pileLayout(count, options?)` | Where each card of a pile lies, neat or messy, from a seed |
| `readHand(text)` | A hand written as ids (`"AS KH 10D"`) or one-letter codes, as its cards |
| `arrangeCards(cards, by)` | A hand by `"rank"`, grouped by `"suit"`, number cards then face cards (`"face"`), or as `"dealt"`, as a new list; the extras last |
| `mixCards(cards, random?)` | The same cards in another order, never the one given |
| `tossCard(cards, card)` | The hand without that card |
| `replaceCard(cards, card, next, lands?)` | The hand with that card out and the next card at the `"front"` or the `"end"` |

Types: `CardFaceRenderer`, `CardFaceContext`, `CardPlace`, `HandLayoutOptions`, `PartOptions`, `PileLayoutOptions`, `HandTurnOptions`, `SpinOptions`, `CardOrder`, `CardLands`.

### `@johnmorrisdotca/toranpu/element/define`

The same exports, and the elements registered by importing it: the one
module of the package with an effect of its own, and named in
`sideEffects` so a bundler keeps it.

### `@johnmorrisdotca/toranpu/table`

| Export | What it does |
| --- | --- |
| `defineToranpuTable()` | Registers `<toranpu-table>`, and the card, hand and pile elements it lays out, once |
| `ToranpuTable` | The `<toranpu-table>` element's class |
| `TABLE_CLOTHS` | The five cloths a table may be laid in, each its felt, its deep edge and its ink |

Types: `TableCloth`.

### `@johnmorrisdotca/toranpu/table/define`

The same exports, and `<toranpu-table>` registered by importing it, named
in `sideEffects` like `element/define`.

## Theming

The games draw nothing: the table looks however you draw it. What Toranpu
does draw, the card backs, takes the custom properties under
[The drawings](#the-drawings) below.

The demo's table is themed, and is the worked example. It wears the family's
one stylesheet, [`demo/family.css`](./demo/family.css), which is the same file
byte for byte on every sibling's site (a test holds it to its hash), and one
of its own for the cards and the table, [`demo/site.css`](./demo/site.css).
Every colour and size in both is a CSS custom property on `:root`:

| Property | What it colours or sizes | Light | Dark |
| --- | --- | --- | --- |
| `--page` | the page behind everything | `#f4efe4` | `#141614` |
| `--ink` | text, and a pressed button | `#1f2320` | `#ece8dc` |
| `--muted` | notes and labels | `#6b6f68` | `#a09d93` |
| `--rule` | borders and rules | `#ddd6c6` | `#3a3d38` |
| `--surface` | panels, fields and buttons | `#fbf8f1` | `#1d201e` |
| `--felt`, `--felt-deep` | the table | `#2f5d4a`, `#1f4135` | `#214337`, `#152c24` |
| `--felt-ink` | text on the table | `#f3efe4` | the same |
| `--accent`, `--accent-ink` | the selected tab, the focus ring | `#b5452c`, `#fff` | the same |
| `--good`, `--bad` | a refusal | `#2f7a4f`, `#b5452c` | the same |
| `--gold`, `--gold-ink` | the seat to play, a picked card | `#e0b43b`, `#1f2320` | the same |
| `--radius` | the corners of panels | `16px` | |
| `--font`, `--mono` | the type: the system's own, and its monospace | | |
| `--card`, `--card-ink`, `--card-red` | a card's face, its black suits and its red | `#fffdf8`, `#1b1b1b`, `#c2272d` | the same |
| `--card-w`, `--card-h` | a card's size (46px by 68px on a phone) | `58px`, `84px` | |
| `--intro-room`, `--intro-room-wide` | room kept for the header's words, so that changing language moves nothing | `9.5rem`, `5.5rem` | |

The page follows the device's light or dark setting; `data-theme="light"` or
`"dark"` on `<html>` forces one. To give a copy of the table another look, set
the properties after the two stylesheets:

```css
:root { --felt: #23405a; --felt-deep: #162a3c; --card-red: #b00020; --card-w: 64px; --card-h: 92px; }
```

### The drawings

What Toranpu draws, the backs and the plain and four-colour faces, takes
these custom properties when it is put into a page as SVG, and keeps its own
colours as an image:

| Custom property | Colours | Unless set |
| --- | --- | --- |
| `--toranpu-back` | a back's field | the back's own: `#b3262d`, `#1f4e8c` or `#24231f` |
| `--toranpu-back-ink` | the lines and dots on it | `#fffaf0` |
| `--toranpu-back-paper` | the border round it | `#fffdf8` |
| `--toranpu-card` | a face's paper | `#fffdf8` |
| `--toranpu-card-ink` | spades and clubs, and a black joker | `#1b1b1b` |
| `--toranpu-card-red` | hearts and diamonds, and a red joker | `#c2272d` |
| `--toranpu-card-blue` | diamonds, in four colour | `#1f5fbf` |
| `--toranpu-card-green` | clubs, in four colour | `#1f7a3a` |

```css
.my-table { --toranpu-back: #3d4d38; }   /* every back on this table, moss green */
```

The elements take three more:

| Custom property | Sizes or times | Unless set |
| --- | --- | --- |
| `--toranpu-card-width` | a card's width, where the element has no `size` or `width` | `70px` |
| `--toranpu-flip-ms` | how long a card takes to turn over | `450ms` |
| `--toranpu-focus` | the ring round a card that has the keyboard's focus | `#b5452c` |

## Limits

| Limit | Value | Where |
| --- | --- | --- |
| Players | each game's own, from 2 to 8 | `CARD_GAME_TABLES` |
| A game's length | one of the sizes its table offers | `CARD_GAME_TABLES` |
| A seed | a whole number; the games draw 1 to 2,147,483,647 | `randomSeed` |
| The deck the games deal | fifty-two cards, no jokers (the faces draw two) | `DECK_SIZE` |
| A saved game's format | 1 | `SAVE_FORMAT` |
| The id of a card of your own | letters, digits, `-`, `_`, `.` or `:`, up to 40 | `CUSTOM_CARD_ID` |
| The name of a design or a back you register | kebab case, up to 40 characters, never one of the package's own | `registerCardDesign`, `registerCardBack` |
| Words in the middle of a back | twelve characters | `mark` |
| A picture or logo for a back | a `data:image/`, `https:` or same-site address; as an image of its own only `data:image/` loads | `safeImageUrl` |
| Languages | English and Japanese | `STRINGS` |

A very long game is a long save: a game of Hearts to 100 is about six hundred
moves and nine thousand characters of code.

## Browser and runtime support

Any browser with ES2020 modules: Chrome, Edge, Firefox and Safari from 2020
on, and Node 22 or later, Deno and Bun. Nothing is polyfilled because nothing
needs to be. The elements need custom elements and shadow DOM, which every
current browser has, and a hand shrinks to fit its room with container
queries (Chrome and Edge 105, Safari 16, Firefox 110, all from 2022); the
drawings and sounds work anywhere SVG and the Web Audio API do. The demo and
the elements are tested in Chromium and in WebKit, Safari's engine, at phone
size with touch.

## Accessibility

A card is named for a screen reader ("king of spades", "スペードのキング"), or
"a card, face down"; a card of your own is named by its design's `label`, or the
element's `label` attribute. A hand reads out all its cards, a pile its count
and its top card, and a table keeps a `polite` line saying whose turn it is. A
card with `flip` is a button: Tab reaches it, and Enter or Space turns it over,
with a ring in `--toranpu-focus`. Motion (the turn, a hand moving, a spin) is
skipped on a device that asks for less. The cards are pictures and never text,
so a drag or a long press cannot select a letter on one.

## Languages

English and Japanese: the games' names, the cards, every move in words, the
command line (`--lang`, or the system's) and the demo, which has a chooser of
its own, follows the browser's language on a first visit, and takes `?lang=ja`
or `?lang=en` in the address. **Japanese: included; not yet reviewed by a
native reader. Corrections welcome.** Every Japanese string is listed beside
its English in [docs/strings-ja.md](./docs/strings-ja.md), and there is an
[issue template](https://github.com/johnmorrisdotca/toranpu/issues/new?template=fix-a-translation.md)
for fixing one. The rules in [docs/games.md](./docs/games.md) are in English
only so far.

## Roadmap

- The solitaires on the demo site, and in the command line (`toranpu klondike --seed 7`).
- Rummy 500, and Euchre's going alone.
- A choice of computer strength for each game.
- The rules page in Japanese.
- A whole card table as an element, built from the hand and pile elements,
  to go with the React hook.
- More designed decks: one is here (the English pattern); others will come
  only where a set's licence is public domain or CC0 and verified at its
  source.

Left out on purpose: anything played for stakes (no betting, no chips, no
payouts: children use the site this was built for), and play over a network,
which needs a server. A game here is plain data, so your own server can carry
it.

Ideas and requests are welcome in the
[issues](https://github.com/johnmorrisdotca/toranpu/issues).

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short:

```sh
pnpm install
pnpm check   # lint, types and tests
pnpm site    # build the demo into ./site, then serve it
```

Please follow the [code of conduct](./CODE_OF_CONDUCT.md).

## Changes

See [CHANGELOG.md](./CHANGELOG.md).

## Licence

[MIT](./LICENSE) © John Morris
