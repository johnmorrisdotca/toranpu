---
title: Run computer turns
section: how-to
order: 2
description: Learn run computer turns.
---

## Give each seat a controller

`computers` is a boolean per seat. Unspecified seats are people. The pure helper `playComputers` advances all due computer moves until a person must act or the game ends. It returns the moves as well as the new game, so a host can show them individually.

```ts
import { moveText, newGame, playComputers, rulesFor } from "@johnmorrisdotca/toranpu";

const game = newGame("hearts", { players: ["You", "Aki", "Ben", "Cy"], computers: [false, true, true, true], seed: 42 })!;
const rules = rulesFor("hearts");
const afterYou = rules.play(game, rules.moves(game)[0]!)!;
const result = playComputers("hearts", afterYou);
console.log(result.moves.map((move) => moveText("hearts", move)));
console.log(rules.toPlay(result.game));
```

## Drive a game yourself

The rules expose `toPlay`, `moves`, `computer`, `play`, `over` and `winners`. Check `over` before choosing another move. For simulations, bound your own loop; the native game determines legal choices and scoring. The individual computer functions use their own seat’s hand and public observations rather than copying another game’s strategy.

## Draw the sequence

A browser host may animate the returned moves or use the React hook’s existing computer delay. The pure engine starts no timer and performs no network request. [Full game rules](../games.md) describe each game’s phases and targets.
