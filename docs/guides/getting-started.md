---
title: Getting started
section: tutorial
order: 1
description: Learn getting started.
---

Install the package, start a seeded game and make one legal move. The engines are plain functions and work in Node 22 or later without a page.

## Install

```sh
npm install @johnmorrisdotca/toranpu
```

The package has no runtime dependencies and includes its types. React is an optional peer for the separate hook entry.

## Start and play

```ts
import { newGame, rulesFor } from "@johnmorrisdotca/toranpu";

const game = newGame("hearts", { players: ["Aki", "Ben", "Cy", "Dev"], seed: 42 });
if (game === null) throw new Error("Unsupported setup");
const rules = rulesFor("hearts");
const next = rules.play(game, rules.moves(game)[0]!);
console.log(game.phase, game.moves.length);
console.log(next?.phase, next?.moves.length);
```

A move may be a pass, a bid or a discard before ordinary card play begins. Ask the native rules for the current choices. `play` returns a new game and leaves the input unchanged; null means the move was refused.

## Pick an entry

The [main entry](entry:main) offers eleven games by key, shared words and exports. Each game also has its own named entry and a root namespace such as `hearts`. The [deck entry](entry:deck) offers card objects for games of your own. Solitaires have separate entries.

## Next steps

[Run computers](run-computers.md), [save and export](save-and-export.md), [display your cards](display-and-branding.md), [play a solitaire](solitaires.md), or [embed and use React](embed-and-react.md).
