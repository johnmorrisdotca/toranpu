---
title: Save, restore and export
section: how-to
order: 3
description: Learn save, restore and export.
---

## Keep setup and moves

The saved format records game kind, match length, names, computer seats, seed and ordered moves. The reader recreates the game and applies every move through its rules. It refuses an invalid log rather than trusting supplied hands or scores.

```ts
import { fromCode, fromJSON, newGame, rulesFor, toCSV, toCode, toJSON } from "@johnmorrisdotca/toranpu";

const game = newGame("war", { players: ["Aki", "Ben"], seed: 42 })!;
const next = rulesFor("war").play(game, { turn: true })!;
console.log(fromJSON(toJSON("war", next))?.kind);
console.log(fromCode(toCode("war", next))?.kind);
console.log(toCSV("war", next));
console.log(fromJSON("not JSON"));
```

## Choose an output

`toJSON` writes the structured record; `toCode` gives a compact code. `fromJSON` and `fromCode` read them and return a discriminated `ReadGame` or null. `toText` names moves in the selected language, and `toCSV` writes escaped spreadsheet rows. [Export and import](../export-and-import.md) retains the complete format and CLI recipes.

## Handle a refused record

Check the reader’s result before resuming. A null result means the format, game, setup or recorded moves could not be accepted. The seed reproduces the deal; the moves reproduce later choices. Player names and reproducible card information are in a saved game, so the host chooses what to store or share.
