# The rules interface, and the solitaires

The one interface every card game answers, and the three solitaires with their solvers. Moved here from [the README](../README.md) to keep it under the length npm shows.

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
