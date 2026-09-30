# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.3.0] - 2026-09-30

### Added

- **Solitaire: Klondike, FreeCell and Spider**, each its own entry point
  (`@johnmorrisdotca/toranpu/klondike`, `/freecell`, `/spider`): the table as
  plain data, the rules as pure functions, deals from a seed, moves written
  as text and played back, a solver for each, and what a tap on a card
  means. They came from itsutsu.com, and deal and solve exactly as they did
  there: the tests hold them to deals and solving lines written down on the
  site before the move.
- `bestFirst`, the best-first search the three solvers share, exported for a
  game of your own.

Nothing that was exported has changed.

## [1.2.0] - 2026-09-30

Nothing that was exported has changed: every game deals, plays and reads back
as it did, and a game saved by 1.1.0 is read by 1.2.0.

### Added

- **A game written out and read back, whichever of the ten it is.** `toJSON`
  and `fromJSON` (JSON with a `format` number, naming its game), `toCode` and
  `fromCode` (the one line each game's `encode` writes), `toText` (a record in
  words, a line a move) and `toCSV` (a row a move). `fromJSON` reads either
  form, tells you which game it is, and plays every move through the rules
  again, so a changed save gives `null`. Also `savedGame`, `recordOf`,
  `SAVE_FORMAT` and `CSV_COLUMNS`.
- **Every move in words, in English and Japanese.** `moveText` for a button
  ("Play Q♠"), a record ("plays Q♠") and what the rest of the table saw
  ("passes cards: 3"); `gameName`, `gameSays`, `cardText`, `cardShort`,
  `cardsShort`, `suitName`, `suitSymbol`, `rankName` and `namesList`. Every
  string is in `STRINGS`, listed side by side in `docs/strings-ja.md`. The
  Japanese has not yet been reviewed by a native reader.
- **A command line.** `toranpu games`, `toranpu deal` (a seeded deck, or a
  game's own first deal), `toranpu play <game>` (computers play a whole game)
  and `toranpu check` (is this a saved game?), with `--json`, `--csv`,
  `--text`, `--stdin` and `--lang`, on Linux, macOS and Windows. `runCli` is
  the same thing as a pure function.
- **The rules, written down.** [docs/games.md](./docs/games.md) says which
  rules each of the ten games is played by, in our own words, with a source
  for each and a note of where tables differ. A test holds its figures to the
  code.
- **An API reference**, on the demo site: every export of every entry point
  with its signature and its doc comment, made from the source. Every export
  now has a doc comment, and a test fails without one.
- `VERSION`, `fillIn`, `languageOf`, and the types `SavedGame`, `ReadGame`,
  `RecordedMove`, `MoveTextOptions`, `Language`, `ToranpuStrings`,
  `CliSurroundings` and `CliResult`.
- The demo wears the family's look, in English and Japanese, and gains the
  deck on its own (a seeded shuffle dealt into fans) and a panel that keeps
  the game four ways and reads one back. A game's link is now
  `?game=hearts&players=4&seed=123`; the older `#hearts/4/123` still opens.
- Checks: the package is packed with npm, installed into an empty project and
  used by `import`, by `require` and as a command, on Linux, macOS and Windows;
  the README's examples are run by the tests; React, Vue, Svelte, Angular and a
  plain page each build a table from the packed tarball and play a game to its
  end in Chromium and WebKit; and the demo is played by taps in both.

### Changed

- The README follows the family's order, with a full reference, and the
  package's description and keywords say more of what it does.

### Fixed

- The README's deck example named the wrong first card for seed 42: it is the
  three of clubs. The example is now run by a test.

## [1.1.0] - 2026-09-30

### Added

- Oh Hell, for three or four: exact bids, the dealer barred from making them
  add up, deals from one card up to seven (and back down in the long game),
  with its computer player and save format (`@johnmorrisdotca/toranpu/ohHell`).

## [1.0.0] - 2026-09-30

### Added

- The deck: fifty-two cards as objects, a seeded shuffle, dealing, one-character
  and two-character codes, and card names (`@johnmorrisdotca/toranpu/deck`).
- Nine games, each with its rules, its computer player and its save format:
  Hearts, Spades, Euchre, Cribbage, Crazy Eights, Go Fish, Big Two, President
  and Gin Rummy, each also its own entry point.
- `CardGameRules`, the one interface every game answers, and
  `CARD_GAME_RULES` and `CARD_GAME_TABLES` for all nine.
- `newGame`, `rulesFor` and `playComputers`, to start and run any game by name.
- Saved games as text (the table, the seed and the moves), read back by
  playing the moves through the rules again.
- Every entry point also answers `require` through a `default` export
  condition, so test runners that load ES modules through CommonJS find it.
- `useCardGame`, a React hook (`@johnmorrisdotca/toranpu/react`).
- A demo where a hand of any game can be played against the computer,
  published to GitHub Pages.

[Unreleased]: https://github.com/johnmorrisdotca/toranpu/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/johnmorrisdotca/toranpu/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/johnmorrisdotca/toranpu/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/johnmorrisdotca/toranpu/releases/tag/v1.0.0
