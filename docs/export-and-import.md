# Export and import

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
  "generator": "toranpu 2.15.0",
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

