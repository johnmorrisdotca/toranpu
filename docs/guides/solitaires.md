---
title: Deal, play and solve solitaires
section: how-to
order: 5
description: Learn deal, play and solve solitaires.
---

## Use the named engine

Klondike, FreeCell and Spider each have a table, legal-move helpers, immutable play, deal codes, replay and a solver. They use packed card numbers rather than the eleven games’ string ids. Generate their decks through their native deal readers.

```ts
import { dealKlondike, dealOfSeed, deckOf, movesFrom, playKlondike } from "@johnmorrisdotca/toranpu/klondike";

const table = dealKlondike(deckOf(dealOfSeed(42))!, { draw: 3, passes: 3 });
const move = movesFrom(table)[0]!;
const next = playKlondike(table, move);
console.log(move, table.stock.length, next?.stock.length);
```

## Know the pile names

Klondike columns are `"1"`–`"7"`, waste `"w"`, stock `"s"` and foundations S/H/D/C. FreeCell columns are `"1"`–`"8"`, cells a/b/c/d and foundations S/H/D/C. Spider’s intent helpers use columns `"0"`–`"9"`, stock `"s"` and completed runs `"f"`. Ask the native `moveFor`/lift helpers to interpret a held card and destination.

## Budget a solver

A solver limits tables searched, not elapsed time, so the same deal and budget are repeatable. A null move list means no solution was found within that work limit; it does not prove a deal unwinnable. Keep longer searches outside page rendering.

```ts no-run
import { dealFreeCell, dealOfSeed, deckOf, solveFreeCell } from "@johnmorrisdotca/toranpu/freecell";

const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
const result = solveFreeCell(table, 10000);
console.log(result.tables, result.moves);
```

[Klondike](entry:klondike), [FreeCell](entry:freecell) and [Spider](entry:spider) list all state, move and refusal contracts.
