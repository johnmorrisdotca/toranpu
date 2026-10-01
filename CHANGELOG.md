# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

## [2.5.0] - 2026-09-30

### Added

- **Hide a hand**: `<toranpu-hand cards="AS KH QD">`, a hand of cards on any
  page, fanned, in any design and with any back. `hide()` turns it face down
  where it lies, all at once or one card after another (`{ oneByOne: true,
  gap }`), and `show()` turns it back; `scrunch()` squares it into one
  face-down bundle of three backs whatever its size, so neither the cards nor
  how many there are can be read, and `spread()` lays it out again. The same
  as attributes: `face-down` and `scrunched`. The cards turn over and slide
  together, and a device that asks for less motion gets the end at once. Once
  the cards are still, a face-down card's face and a bundle's cards are not
  in the page, and a screen reader hears only "a hand of 5 cards, face down"
  or "a hand of cards, squared up face down". A hand never grows wider than
  the room it is given; its cards are drawn smaller instead.
- The demo has a Hide a hand panel with a button for each, and the code.
- The README's HTML examples for the elements are run as written in Chromium
  and WebKit by the browser tests.

Nothing that was exported has changed.

## [2.4.0] - 2026-09-30

### Added

- **One card on any page**: `<toranpu-card card="KS">`, a custom element in
  any design and with any back, from the new
  `@johnmorrisdotca/toranpu/element` entry point (`defineToranpuElements()`)
  or registered by importing `@johnmorrisdotca/toranpu/element/define`, one
  script tag from a CDN. With `flip`, a tap, Enter or Space turns it over,
  with a turn that a device asking for less motion skips, a `toranpu-flip`
  event and, with `sound`, the sound of it. While a card lies face down its
  face is not in the page. It takes `size` (small, medium, large) or
  `width`, `lang`, and the back's colour and words.
- Every card in each design, and every back, is on the demo site as an SVG
  file of its own, for an `<img>` on any page:
  `cards/<design>/<card>.svg` and `backs/<back>.svg`.
- `handLayout`, `pileLayout` and `readHand`: where the cards of a hand or a
  pile lie, and a hand written as text, for the elements to come and for a
  table of your own.
- The demo has a One card panel: the card in the look chosen above, turned
  over by a tap, and its picture, with the code for each.

Nothing that was exported has changed. `package.json` now names
`dist/element-define.js` in `sideEffects`, the one module that registers
something when it is imported.

## [2.3.0] - 2026-09-30

### Added

- **Card designs**: the faces of the cards drawn as SVG in the same 100 by
  140 box as the backs, from the new `@johnmorrisdotca/toranpu/card-faces`
  entry point. `cardFaceSvg` and `cardFaceUrl` draw any card, and the two
  jokers (`RJ`, `BJ`), in one of three designs:
  - **plain**, the default, drawn for Toranpu: big corners, the pips laid out
    as a real deck lays them, kings, queens and jacks as their letter in a
    frame, jokers in a jester's cap;
  - **four colour**, plain with diamonds blue and clubs green;
  - **the English pattern**, the traditional deck with its drawn kings,
    queens and jacks, by Dmitry Fomin, who dedicated it to the public domain
    (CC0) on Wikimedia Commons, with his jokers. At 715 kB it is its own entry
    point, `@johnmorrisdotca/toranpu/card-faces/english`, and
    `loadCardDesign("english")` fetches it only when asked.
  A design of your own is a set of drawings by card id. Every face is named
  for screen readers in English or Japanese, and the plain faces take the
  CSS custom properties `--toranpu-card`, `--toranpu-card-ink`,
  `--toranpu-card-red`, `--toranpu-card-blue` and `--toranpu-card-green`.
- [docs/credits.md](./docs/credits.md) names each of the English pattern's 54
  files, its licence and what was done to it.
- The demo has a Card designs panel showing a spread of cards in each design,
  with the code that draws them.

Nothing that was exported has changed.

## [2.2.0] - 2026-09-30

### Added

- **Card backs**, one home for every card game in the family: the new
  `@johnmorrisdotca/toranpu/card-backs` entry point draws three backs as SVG
  in the same 100 by 140 box as every card, a classic red and a classic blue
  in the manner of a casino back and ink with dots, all drawn for Toranpu.
  `cardBackSvg` gives an SVG document and `cardBackUrl` a data URL; either can
  take another colour, words in the middle (a site's name or mark), a width
  and a name for screen readers. Drawn into a page, a back takes the CSS
  custom properties `--toranpu-back`, `--toranpu-back-ink` and
  `--toranpu-back-paper`.
- `CARD_BOX` and `SUIT_PATHS`: the card's box, and the four suits drawn as
  paths, for drawings of your own.
- The demo has a Card backs panel: choose a back, colour it, write in its
  middle, and see the code that draws it. The choice is kept in the address.

Nothing that was exported has changed.

## [2.1.0] - 2026-09-30

### Added

- **Card sounds**, recorded from real cards: the deck shuffled, a card dealt,
  turned over or played, a trick gathered in, a hand fanned.
  `createCardSounds()` from the new `@johnmorrisdotca/toranpu/card-sounds`
  entry point plays them when a table asks, with a mute and a volume, and
  thirteen cards dealt are heard as eight slides. Nothing sounds and nothing
  is fetched until the first sound; the recordings (50 kB) are their own entry
  point, `@johnmorrisdotca/toranpu/sounds`. They come from Kenney's Casino
  Audio pack, CC0, and [docs/credits.md](./docs/credits.md) names each file,
  its source and what was done to it.
- The demo's table has a Sound switch by its Deal button, off until pressed
  and remembered on the device, and a panel that plays each sound.

Nothing that was exported has changed.

## [2.0.0] - 2026-09-30

### Changed

- **Entry points are in kebab case**, as addresses are written:
  `@johnmorrisdotca/toranpu/oh-hell`, `/crazy-eights`, `/go-fish`, `/big-two`
  and `/gin-rummy` (they were `ohHell`, `crazyEights`, `goFish`, `bigTwo` and
  `ginRummy`). The other entry points were one word already. This is the only
  change, and the reason for the new major version.
- The demo writes a game in its address the same way: `?game=crazy-eights`.

A game's key in a saved game is unchanged (`"g": "crazyEights"`), so every
game saved by 1.x reads back and replays as it did.

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

[Unreleased]: https://github.com/johnmorrisdotca/toranpu/compare/v2.5.0...HEAD
[2.5.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.4.0...v2.5.0
[2.4.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.3.0...v2.4.0
[2.3.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.2.0...v2.3.0
[2.2.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.1.0...v2.2.0
[2.1.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.0.0...v2.1.0
[2.0.0]: https://github.com/johnmorrisdotca/toranpu/compare/v1.3.0...v2.0.0
[1.3.0]: https://github.com/johnmorrisdotca/toranpu/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/johnmorrisdotca/toranpu/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/johnmorrisdotca/toranpu/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/johnmorrisdotca/toranpu/releases/tag/v1.0.0
