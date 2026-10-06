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

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hero-desk-light.webp" alt="The demo on a desk, with a game of Hearts a few tricks in, under the page's header with its language chooser and cloth swatches: the choice of game, players and seed, and a green table with the four seats, the cards played to the trick, the player's hand of cards in a fan and the buttons for the moves allowed." width="720">
</picture>
<br><em>A game of Hearts, a few tricks in, on a desk.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hero-phone-light.webp" alt="The demo on a phone, in Japanese: a game of Go Fish for three at a green table, the players with their cards and books, the deck, the player's hand of nine cards and the buttons for the asks allowed." width="220">
</picture>
<br><em>A game of Go Fish on a phone, in Japanese, in the device's light or dark.</em>
</td>
</tr>
</table>

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

### What's in it

Each picture is a part of [the demo](https://johnmorrisdotca.github.io/toranpu/), taken with `pnpm screenshots:readme`, in light and dark. The deal is a seed (`?seed=2026`) and the computers answer at once, so the same pictures come again.

<table>
<tr>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hearts-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hearts-desk-light.webp" alt="A game of Hearts at a green table: four seats with their scores, the cards played to the trick and the player's hand in a fan, with buttons for the moves allowed." width="400">
</picture>
<br><em><strong>Hearts</strong>: pass, avoid the queen of spades, shoot the moon.</em>
</td>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/go-fish-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/go-fish-desk-light.webp" alt="A game of Go Fish for three at a green table: the players with their cards and books, the deck, the player's hand and the asks allowed as buttons." width="400">
</picture>
<br><em><strong>Go Fish</strong>: ask for a rank, collect books of four.</em>
</td>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/crazy-eights-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/crazy-eights-desk-light.webp" alt="A game of Crazy Eights for three: the discard pile with its top card, the stock, and the player's hand with buttons for the cards that may be played." width="400">
</picture>
<br><em><strong>Crazy Eights</strong>: match suit or rank; eights are wild.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/designs-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/designs-desk-light.webp" alt="The card designs panel: buttons for Plain, Four colour, English pattern and Realistic, a spread of cards in the chosen design, and the code that draws them." width="400">
</picture>
<br><em><strong>Card designs</strong>: plain, four colour, the English pattern, realistic.</em>
</td>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/backs-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/backs-desk-light.webp" alt="The card backs panel: a classic red, a classic blue and an ink back with dots to choose, a colour and a mark of your own, and the chosen back drawn large." width="400">
</picture>
<br><em><strong>Card backs</strong>: three of them, recoloured or marked.</em>
</td>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/branding-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/branding-desk-light.webp" alt="The branding panel: a hand of standard cards beside invented territory cards, each a place and a soldier, a horse or a cannon, and backs made from a picture." width="400">
</picture>
<br><em><strong>Your own branding</strong>: backs, faces and wholly new cards.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/one-card-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/one-card-desk-light.webp" alt="The one card panel: a large king of spades that turns over when tapped, a choice of card, and the same card as a plain picture beside its code." width="400">
</picture>
<br><em><strong>One card</strong>: <code>&lt;toranpu-card&gt;</code>, turned by a tap.</em>
</td>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hand-controls-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/hand-controls-desk-light.webp" alt="The hand controls panel: a fanned hand of cards with buttons to turn it face down, gather, part, sort, group, mix, toss, swap and spin it." width="400">
</picture>
<br><em><strong>A hand</strong>: <code>&lt;toranpu-hand&gt;</code> and what a person does with one.</em>
</td>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/messy-piles-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/messy-piles-desk-light.webp" alt="The piles panel: a stock face down and a discard pile with its top card, the cards under each showing as a stack from squared to very messy." width="400">
</picture>
<br><em><strong>Messy piles</strong>: stock and discard, neat to very messy.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/whole-table-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/whole-table-desk-light.webp" alt="The whole table panel: a game of Crazy Eights for three in one tag, its seats, the pile, the stock and the hand of whoever is to play." width="400">
</picture>
<br><em><strong>A whole table</strong>: any of the eleven games in one tag.</em>
</td>
<td align="center" valign="top" width="33%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/card-sounds-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/toranpu/main/docs/images/card-sounds-desk-light.webp" alt="The card sounds panel: a button for each recorded sound, to tap and hear." width="400">
</picture>
<br><em><strong>Card sounds</strong>: recorded from real cards.</em>
</td>
</tr>
</table>

## Use it in your project

### Install

```sh
npm install @johnmorrisdotca/toranpu
```

```sh
pnpm add @johnmorrisdotca/toranpu
```

```sh
yarn add @johnmorrisdotca/toranpu
```

A page with no bundler loads a table, a hand or a card as a tag from a CDN, naming the major version so that a release that changes what you use is one you choose:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/table-define.js"></script>
```

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

```ts no-check
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

The cookbook, with the output of each example, is under [Examples](#examples).

## Examples

Every TypeScript and JavaScript block that can run is type-checked against the built package and run by `pnpm test:readme`, so the output after `// →` is what the code prints. The rules need no page, no network and no clock: a game is a seed and its moves.

### A page with nothing else

Save this as a file and open it: one script and one tag, and a game of Hearts at a table, against the computer. The seed deals the same cards to everybody who opens the page:

```html
<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hearts</title>
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/table-define.js"></script>
<toranpu-table game="hearts" players="4" seed="2026"></toranpu-table>
```

### Deal from a seed

The same seed deals the same cards on every device, for ever. A deck is fifty-two card objects, and a whole deck is written as a 52-letter string:

```ts
import { cardName, cardShortName, dealRound, shuffledDeck, writeCards } from "@johnmorrisdotca/toranpu/deck";

const { hands, rest } = dealRound(shuffledDeck(7), 4, 5);   // four hands of five, one card at a time round the table
console.log(hands[0].map(cardShortName).join(" "));         // → J♥ 7♣ 2♣ A♣ 3♥
console.log(cardName({ suit: "hearts", rank: 12 }));        // → queen of hearts
console.log(rest.length, writeCards(shuffledDeck(7)).length);   // → 32 52
```

### Let the computers play a whole game

Every game has its own computer player, which sees only what its seat could see. Four of them play a game of Hearts to 100:

```ts
import { newGame, playComputers, rulesFor, toText } from "@johnmorrisdotca/toranpu";

const players = ["Ann", "Ben", "Cho", "Dee"];
const start = newGame("hearts", { players, seed: 2026, computers: [true, true, true, true] })!;
const { game, moves } = playComputers("hearts", start);
const rules = rulesFor("hearts");
console.log(rules.over(game), rules.winners(game));          // → true [ 3 ]
console.log(game.scores, moves.length);                      // → [ 105, 76, 98, 59 ] 716
console.log(toText("hearts", game).split("\n").slice(0, 3));
// → [ 'Hearts for 4, seed 2026: Ann, Ben, Cho, Dee', '1. Ann: passes 5♣ A♦ Q♥', '2. Ben: passes J♣ Q♣ A♥' ]
```

### Play a move yourself

Every game answers the same questions: `moves` lists what the seat to move may do, `play` returns the next game (or `null` for a move the rules refuse), and the words for each move come from `moveText`, in English or Japanese:

```ts
import { moveText, newGame, rulesFor } from "@johnmorrisdotca/toranpu";

const players = ["You", "Aiko", "Ben"];
const rules = rulesFor("goFish");
const game = newGame("goFish", { players, seed: 2026, computers: [false, true, true] })!;
const offered = rules.moves(game);
console.log(offered.length, moveText("goFish", offered[0], { players }));     // → 12 Ask Aiko for fours
console.log(rules.play(game, offered[0]) !== null, rules.toPlay(game));       // → true 0
```

### Say it in Japanese

Every card, game and move has words in English and Japanese, from one table:

```ts
import { cardShort, cardText, gameName, moveText } from "@johnmorrisdotca/toranpu";

console.log(gameName("president"), gameName("president", "ja"));              // → President 大富豪
console.log(cardText("QS"), cardText("QS", "ja"), cardShort("TD"));            // → queen of spades スペードのクイーン 10♦
console.log(moveText("hearts", { play: "QS" }), moveText("hearts", { play: "QS" }, { form: "did" }));   // → Play Q♠ plays Q♠
```

### Save a game and read it back

A game is its table, its seed and its moves, and that is all that is written. A code is one line; what is read back is played through the rules again, so a tampered save is refused:

```ts
import { fromCode, newGame, toCode } from "@johnmorrisdotca/toranpu";

const game = newGame("hearts", { players: ["Ann", "Ben", "Cho", "Dee"], seed: 2026, computers: [true, true, true, true] })!;
const code = toCode("hearts", game);
console.log(code.slice(0, 40));                                // → {"v":1,"g":"hearts","size":100,"players":
console.log(fromCode(code) !== null, fromCode("not a game")); // → true null
```

### A card as a picture

A card is SVG text, never a font: its letters cannot be selected by a drag or a long press, and it is named for a screen reader:

```ts
import { cardBackSvg } from "@johnmorrisdotca/toranpu/card-backs";
import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";

const queen = cardFaceSvg("QS")!;
console.log(queen.startsWith("<svg"), queen.includes('aria-label="queen of spades"'));     // → true true
console.log(cardBackSvg("classic-blue", { width: 70 }).includes('width="70"'));          // → true
```

### Solitaire, alone

Klondike, FreeCell and Spider are their own entry points, with the table as plain data, a seed that deals the same cards everywhere and a solver. This is the first deal of seed 2026:

```ts
import { dealKlondike, dealOfSeed, deckOf, movesFrom } from "@johnmorrisdotca/toranpu/klondike";

const table = dealKlondike(deckOf(dealOfSeed(2026))!, { draw: 1, passes: Infinity });
console.log(movesFrom(table).length);                        // → 2
```

### From a terminal

```sh
npx @johnmorrisdotca/toranpu deal --hands 2 --each 5 --seed 42
```

```text
Seat 1: 3♣ 2♥ K♣ 7♠ 10♦
Seat 2: 9♣ K♥ 9♦ J♣ 5♣
Left: J♥ 3♠ A♥ 4♥ 2♣ Q♣ …
```

The listing of what is left is trimmed with `…`. `toranpu games` lists the eleven games, `toranpu play hearts --seed 42` lets the computers play one through, and `toranpu check` checks a saved game; all are under [The command line](#the-command-line).

### A hand on any page

`<toranpu-hand>` is a fan of cards in any design, turned face down all at once or one after another, and everything else a person does with a hand (see [Hand controls](#hand-controls)):

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js"></script>
<toranpu-hand cards="AS KH QD JC 10S" design="english" back="classic-blue"></toranpu-hand>
<toranpu-card card="KS" design="four-colour" flip></toranpu-card>
```

### Your own cards

A site's own backs, faces and wholly new cards are drawn the same way as the standard ones (see [Your own branding](#your-own-branding)):

```ts no-run
import { registerCardDesign } from "@johnmorrisdotca/toranpu/card-faces";

registerCardDesign({
  name: "frontier",
  box: [100, 140],
  art: { KS: '<svg viewBox="0 0 100 140"><rect width="100" height="140" rx="8" fill="#f3e6c8"/></svg>' },   // a face for a standard card, as SVG
});
```

### A look of your own

Every colour of the demo is a CSS variable, and the table under [Theming](#theming) lists the ones the card backs take:

```css
toranpu-table { --toranpu-focus: #d4a017; }
```

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

Every game answers the same questions through one `CardGameRules` type (`start`, `moves`, `play`, `toPlay`, `computer`, `over`, `winners`, and the keeping functions), so one table, one bot runner or one test harness plays any of them, and a board needs no rule of its own.

The options, the attributes, every example and the tables are in [docs/RULES-API.md](docs/RULES-API.md#every-games-rules).

## Solitaire: Klondike, FreeCell and Spider

Three games played alone, each its own entry point (`@johnmorrisdotca/toranpu/klondike`, `/freecell` and `/spider`): the table as plain data, the rules as pure functions, a seed that deals the same cards everywhere, its moves written as a short string, a solver, and what a tap on a card means.

The options, the attributes, every example and the tables are in [docs/RULES-API.md](docs/RULES-API.md#solitaire-klondike-freecell-and-spider).

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

Recordings of real cards for a table to play: the deck shuffled, a card dealt, turned over or laid down, a trick gathered in, a hand fanned. Nothing sounds unless a table asks, and nothing is fetched until the first sound (`@johnmorrisdotca/toranpu/card-sounds`).

The options, the attributes, every example and the tables are in [docs/CARDS.md](docs/CARDS.md#card-sounds).

## Card backs

One home for the backs of the cards, for every card game in the family: three backs drawn as SVG in the same 100 by 140 box as every card (a classic red, a classic blue and ink with dots), recoloured, marked with a site's name, or made from your own art (`@johnmorrisdotca/toranpu/card-backs`).

The options, the attributes, every example and the tables are in [docs/CARDS.md](docs/CARDS.md#card-backs).

## Card designs

The faces of the cards, drawn as SVG in the same box as the backs: plain (the default), four colour, the traditional English pattern with drawn kings, queens and jacks, and a realistic deck. A card is a picture, never text: its letters cannot be selected by a drag or a long press (`@johnmorrisdotca/toranpu/card-faces`).

The options, the attributes, every example and the tables are in [docs/CARDS.md](docs/CARDS.md#card-designs).

## Your own branding

A site's own cards: its own backs, its own faces for the standard cards, and cards no deck has, drawn, turned over and laid out in hands, piles and tables like the standard ones. Nobody's trademark or artwork ships with Toranpu.

The options, the attributes, every example and the tables are in [docs/CARDS.md](docs/CARDS.md#your-own-branding).

## One card on any page

`<toranpu-card>` is a card as an element, in any design and with any back, turned over by a tap: one script tag and one element, with nothing to install, or any card as a plain picture.

The options, the attributes, every example and the tables are in [docs/ELEMENTS.md](docs/ELEMENTS.md#one-card-on-any-page).

## Hand controls

`<toranpu-hand>` is a hand of cards on any page, fanned, in any design and with any back, and everything a person does with a hand where it lies: turn it face down all at once or one after another, gather it into a bundle, part it, sort it, group it, mix it up, toss a card, swap one and spin a card on the table.

The options, the attributes, every example and the tables are in [docs/ELEMENTS.md](docs/ELEMENTS.md#hand-controls).

## A closed hand that opens with a tap

A hand can lie squared up, only its top card showing, and open into a clear fan when it is tapped, as a reveal: `closed` says how closed it starts, from `0` (a fan) to `1` (squared up).

The options, the attributes, every example and the tables are in [docs/ELEMENTS.md](docs/ELEMENTS.md#a-closed-hand-that-opens-with-a-tap).

## Messy piles

`<toranpu-pile>` is a stock to draw from or a discard pile: its top card on top, and the cards under it showing as a stack, from neatly squared to very messy, laid out from its own seed so that it always looks the same.

The options, the attributes, every example and the tables are in [docs/ELEMENTS.md](docs/ELEMENTS.md#messy-piles).

## Embed a hand

Any hand of cards on any web page, written in the card codes (`AS KH 10D`), as an iframe where the page allows no scripts, or as one tag where it may, at three sizes.

The options, the attributes, every example and the tables are in [docs/ELEMENTS.md](docs/ELEMENTS.md#embed-a-hand).

## A whole table on a page

Any of the eleven games, ready to play, in one tag (`<toranpu-table>`): the seats round the felt, what lies on the table, the hand of whoever is to play and the moves they may make, with computers in the other seats.

The options, the attributes, every example and the tables are in [docs/ELEMENTS.md](docs/ELEMENTS.md#a-whole-table-on-a-page).

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
  "generator": "toranpu 2.14.2",
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

```text
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

### Entry points

| Entry point | What it holds |
| --- | --- |
| `@johnmorrisdotca/toranpu` | The eleven games, their rules and computers, saving and export, words, and the command line as a function |
| `@johnmorrisdotca/toranpu/<game>` | One game on its own: Hearts, Spades, Euchre, Cribbage, Oh Hell, Crazy Eights, Go Fish, Big Two, President, Gin Rummy and War, and the solitaires Klondike, FreeCell and Spider |
| `@johnmorrisdotca/toranpu/deck` | Fifty-two cards, a seeded shuffle, dealing, one-letter codes and names |
| `@johnmorrisdotca/toranpu/react` | `useCardGame`, a hook over one game |
| `@johnmorrisdotca/toranpu/card-sounds`, `/sounds` | The recorded card sounds, and their data |
| `@johnmorrisdotca/toranpu/card-backs` | The card backs as SVG, and `registerCardBack` |
| `@johnmorrisdotca/toranpu/card-faces`, `/card-faces/english`, `/card-faces/realistic` | The card faces as SVG, the designs, and `registerCardDesign` |
| `@johnmorrisdotca/toranpu/element`, `/element/define` | `<toranpu-card>`, `<toranpu-hand>` and `<toranpu-pile>` |
| `@johnmorrisdotca/toranpu/table`, `/table/define` | `<toranpu-table>`, a whole game in one tag |

### The calls to learn first

| Call | What it does |
| --- | --- |
| `newGame(kind, { players, seed, computers })` | A new game of any of the eleven, dealt from a seed |
| `rulesFor(kind)` | The game's rules: `moves`, `play`, `toPlay`, `over`, `winners`, and a computer's move |
| `playComputers(kind, game)` | Let the computers play until a person is to move, or the game is over |
| `moveText(kind, move, options?)`, `cardText(card, language?)`, `gameName(kind, language?)` | The words, in English or Japanese |
| `toCode`, `toJSON`, `toText`, `toCSV` and `fromCode`, `fromJSON` | A game kept, and read back by replaying it |
| `shuffledDeck(seed)`, `dealRound(deck, hands, each)` | The deck on its own |
| `cardFaceSvg(card, options?)`, `cardBackSvg(back, options?)` | A card as SVG text |
| `<toranpu-table>`, `<toranpu-hand>`, `<toranpu-card>` | The tags |

### Every export

The tables of every export of every entry point are in [docs/API.md](docs/API.md), and each one, with its signature and doc comment, is in the [API reference](https://johnmorrisdotca.github.io/toranpu/api.html).

## Theming

The games draw nothing: the table looks however you draw it. What Toranpu
does draw, the card backs, takes the custom properties under
[The drawings](#the-drawings) below.

The demo's table is themed, and is the worked example. It wears the family's
one stylesheet, [`demo/family.css`](./demo/family.css), which is the same file
byte for byte on every sibling's site (a test holds it to its hash), and one
of its own for the cards and the table, [`demo/toranpu.css`](./demo/toranpu.css).
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

## Accessibility

A card is named for a screen reader ("king of spades", "スペードのキング"), or
"a card, face down"; a card of your own is named by its design's `label`, or the
element's `label` attribute. A hand reads out all its cards, a pile its count
and its top card, and a table keeps a `polite` line saying whose turn it is. A
card with `flip` is a button: Tab reaches it, and Enter or Space turns it over,
with a ring in `--toranpu-focus`. Motion (the turn, a hand moving, a spin) is
skipped on a device that asks for less. The cards are pictures and never text,
so a drag or a long press cannot select a letter on one.

## Browser and runtime support

Any browser with ES2020 modules: Chrome, Edge, Firefox and Safari from 2020
on, and Node 22 or later, Deno and Bun. Nothing is polyfilled because nothing
needs to be. The elements need custom elements and shadow DOM, which every
current browser has, and a hand shrinks to fit its room with container
queries (Chrome and Edge 105, Safari 16, Firefox 110, all from 2022); the
drawings and sounds work anywhere SVG and the Web Audio API do. The demo and
the elements are tested in Chromium and in WebKit, Safari's engine, at phone
size with touch.

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

## Architecture

Each game is a folder of its own under `src/games/`: its rules as pure
functions, its types, its computer player, and the code that keeps a table as
text. The eleven card games and three solitaires share the deck, the saving and
the words. Drawing sits apart under `ui/`, so the rules run with no DOM, and
every game and every browser part is an entry point of its own, so a page
loads only what it uses.

The file-by-file tree, with a line on each source file, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): the deck and the games (one file for each game), the saving and the words, the card sounds, backs and designs, and the elements and the table (`element`, `table`, `ui/`). Tests sit beside the code they test (`*.test.ts`). `bin/` is the few lines
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

## Development

```sh
pnpm install --frozen-lockfile
pnpm check             # lint, types and tests, including the checks on the README's tables and examples
pnpm test:cli          # the command line, as a child process
pnpm test:package      # pack it as npm does, install it and import every entry
pnpm test:demo         # the demo in real browsers
pnpm test:frameworks   # the framework examples, built from the packed tarball and played
pnpm test:readme       # every TypeScript and JavaScript example in this README, type-checked and run
pnpm screenshots:readme  # retake the README's pictures into docs/images (builds the demo first)
```

The pictures are taken on the maintainer's Mac and are retaken only when the look changes; they are in `docs/images` and are not in the package that npm installs.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short: run `pnpm check` before you push (see [Development](#development)).

Please follow the [code of conduct](./CODE_OF_CONDUCT.md).

## Changes

See [CHANGELOG.md](./CHANGELOG.md).

The latest release is 2.14.2: the README takes the family's full layout, with pictures of the table and examples that are run.

## Licence

[MIT](./LICENSE) © John Morris The card artwork and the sounds that ship are CC0 or public domain: the English pattern's court cards are by Dmitry Fomin, the realistic deck is Byron Knoll's, and the card sounds are from Kenney's Casino Audio. [docs/credits.md](docs/credits.md) says where each came from and when it was checked.
