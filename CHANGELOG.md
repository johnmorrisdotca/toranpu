# Changelog

All notable changes to this project are written here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Fixed

- The API reference page wraps a long entry path instead of running about 2 px wider than a 360 px screen. Nothing the package exports has changed.

## [2.14.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/toranpu@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.

## [2.14.0] - 2026-10-01

### Added

- **Your own branding.** A page's own card backs, faces and cards no deck has.
  `registerCardBack(name, options)` and `registerCardDesign(design)` keep them by
  name, so `back="frontier"` and `design="frontier"` work on every card, hand,
  pile and table of the page, and an element already on the page draws again with
  what is registered after it. A back takes `art` (SVG of your own for the whole
  back), `image` (a picture), `logo` (in the middle, on a plate over the lattice
  or bare over your own art) and `logoSize`; an element takes `back-image` and
  `back-logo`. A design draws standard cards in your own art, and cards no deck
  has (a territory card, any id of letters, digits, `-`, `_`, `.` or `:`), from
  `art` or from `draw(card, { language })`, named for a screen reader by
  `label`, with `frame: "none"` for art that fills the card. A hand or pile
  written as text reads those ids beside the usual ones.
- **A face or a back put into a card.** An element with `slot="face"` or
  `slot="back"` inside `<toranpu-card>` is drawn as that side, and a `face`
  property that is a function draws the face from the card's id. A `label`
  attribute names a card of your own. `cardFaceFromArt(art, options?)` draws one
  face from artwork alone.
- `cleanMarkup` and `safeImageUrl`: everything a page hands in is cleaned first,
  so scripts, handlers, foreign objects and addresses that are not pictures never
  reach the page.
- **War**, the eleventh game: two players, a turn of the cards, wars three cards
  deep inside wars, a player who cannot finish a war losing, and a limit of 25,
  50, 100, 200 or 1000 turns so that a game can end, the player holding more
  cards winning. Its rules, a computer player (War has no choices, so it turns the
  cards over), seeded deals, saved games as text, its words in English and
  Japanese, the `/war` entry point, the command line, `<toranpu-table game="war">`
  and a place in the demo.
- An Accessibility section in the README, and the sixteen packages of the
  family listed.
- A Help switch in the demo, beside the language chooser in the family header, shared by every demo. Off (the default) the page is as it was; on, each option row says in one plain line what it does, in English or Japanese, and every button in it has the same words as its hover text. Kept on the device.

### Changed

- React 19, Vue 3 and Svelte 5 set a property, not an attribute, on a custom
  element that has a property of that name. `flip` on a card and `mark` on a hand
  are methods as well as attributes, `cards` on a hand or pile took only a list,
  and `count` on a pile and `game` on a table could not be set at all. Each now
  sets its attribute, the methods go on working, and a list or text is taken for
  `cards`.
- Node 22 or later (`engines`), as the CI matrix has always tested. Node 20 is
  end of life.
- The family's SECURITY.md and CODE_OF_CONDUCT.md, with a copy of the master text
  kept in `scripts/community` and held by a test; CONTRIBUTING.md carries the
  family's house rules.
- The GitHub release's notes are the version's section of this changelog.
- Nothing that was exported before has changed: every deal, rule, saved game and
  drawing of the ten games and the three solitaires is as it was.

## [2.13.2] - 2026-10-01

### Fixed

- **The realistic design's number cards look like a printed deck's.** Byron
  Knoll draws his large pips about a fifth of the card's height, so from the
  seven up they crowded each other and ran into the corners. Each is now drawn
  at a printed deck's size about its own centre, every suit alike, with the
  field of pips drawn a little in from the corners.

## [2.13.1] - 2026-10-01

Nothing that was exported has changed.

### Added

- **An Architecture section in the README**: how the source is split and what each file is for, held to the real files by a test.
- A test that holds the API reference to the source it is made from: every entry point has a section, and every name an entry point exports is listed.

### Changed

- The family's footer lists Jarajara.

## [2.13.0] - 2026-10-01

### Added

- **Turn any card over.** `hand.toggle(cards?)` turns the cards named, or
  every card, each to its other side, so a hand can lie half face up; the
  `turned` attribute names the cards showing the other side from the rest.
- **Part a hand at a card.** `hand.partAt(card)` lifts that card out, upright
  and wholly in view, and draws the cards either side away into a group on
  each side; `unpart()` closes it up. The groups close up to keep the hand's
  room wherever they can (`partedHandLayout`). The `parted` attribute.
- **Mark a card** to follow it while it is face down: `hand.mark(cards)` and
  `unmark(cards?)`, the `marked` attribute on a hand and on `<toranpu-card>`,
  a dot on the corner seen face up and face down, and heard as "marked".
- **Spin a card** like a real one, fast then slowing to a stop where it lay:
  `hand.spin(cards?, { direction, turns })` and `card.spin(options?)`,
  clockwise or anticlockwise, one card or several.
- **Number cards and face cards.** `group("face")` and `order="face"` put the
  ace to ten before the jack, queen and king.
- The `toranpu-hand` event's detail also says `turned` and `parted`.
- The demo's hand panel is now "Hand controls": a row for each kind of thing a
  hand does (turn, gather, order, change, mark and spin), acting on the card
  chosen.

### Changed

- **`scrunch()` only gathers the cards**, each keeping its side; it no longer
  turns the hand face down. `hide()` then `scrunch()` does what it did.

### Fixed

- A browser test of a tossed card read the lift after the tap had returned,
  which WebKit could already be past; it now watches from before the tap.

## [2.12.1] - 2026-10-01

### Fixed

- **The realistic design's diamonds no longer collide.** Knoll's large
  diamond pips are drawn about a sixth taller than his other suits', so from
  the seven of diamonds up they touched and overlapped. Each is now drawn at
  heart size about its own centre; no pip moves and no other card changes.

## [2.12.0] - 2026-10-01

### Added

- **A whole table on a page.** `<toranpu-table game="crazy-eights">`, from
  `@johnmorrisdotca/toranpu/table` (or `table/define`): any of the ten games
  ready to play, with the seats, the trick and the piles (the stock and the
  discard as `<toranpu-pile>`), the hand of whoever is to play, the moves they
  may make and computers in the other seats. The felt's `cloth` (green, blue,
  red, black or wood, the family's five), the piles' `messiness`, the
  players, people, names, seed and the computers' delay are attributes, for
  every game alike; `deal()` deals again, and each move is a `toranpu-table`
  event. Its own entry point, since it carries every game's rules.
- The demo has a panel for it, its cloth following the header's patches, and
  the family's cloth patches in its header.

## [2.11.0] - 2026-10-01

### Added

- **A realistic design.** Byron Knoll's public-domain deck, round pips and a
  shaded ace, for its 39 number cards and aces; his ace of spades and his
  courts are left out (one based on another artist's work, the others traced
  from a printed pack) and drawn from Fomin's CC0 English pattern instead.
  `@johnmorrisdotca/toranpu/card-faces/realistic`, or
  `loadCardDesign("realistic")`, or `design="realistic"` on an element. Every
  file and its licence, read at its source, is in docs/credits.md.
- A design may name a `fallback`: the set that draws any card it has none for.
- The demo's deck lays the rest of the deck beside its seats, face down and a
  little untidy, as many cards as are left.

### Fixed

- The demo took its lists of designs and backs from the package, so a new one
  is chosen from the address and has its pictures on the site.

## [2.10.0] - 2026-10-01

### Added

- **Sort, group, mix up.** A hand sorts by rank (`sort()`, ace high), groups
  by suit (`group()`: spades, hearts, clubs, diamonds, each in rank order),
  goes back to the order dealt (`unsort()`), or mixes up (`mixUp()`), each
  card sliding from where it lay to its new place. The `order` attribute
  holds it; `arrangeCards` and `mixCards` do the same to any list.
- **Toss a card, replace a card.** `toss(card)` lifts a card away and the
  rest close up; `replace(card, next, lands?)` takes another in its stead,
  dropped in at the front or the end (`receive` on the hand, the end unless
  said). `tossCard` and `replaceCard` do the same to any list.

### Changed

- **A scrunched hand turned face up stays squared**, its top card showing and
  still no count; `spread()` lays it out face up again if the scrunch had
  turned it down. `scrunch()` now sets `face-down` as well as `scrunched`,
  so the attribute `scrunched` alone is a squared hand face up.
- A method that sets several attributes is drawn, and told to the page, once.

## [2.9.0] - 2026-10-01

### Added

- **The extras of a real deck.** The jokers, two rules cards (`R1`, the
  rules of Hearts; `R2`, of Spades) and a blank (`BL`), drawn in every
  design and named in English and Japanese, though no game deals them. A
  hand writes them as words too: `JOKER` (the next of red and black),
  `RULES`, `BLANK`, at most four jokers, two rules cards and two blanks to a
  hand (`EXTRA_CARDS`, `EXTRA_LIMITS`). `AS KH QD JC JOKER` is a hand.
- **A new deal is seen.** A `<toranpu-hand>` given other cards gathers its
  old cards into a stack where it lies and opens on the new ones, in the
  same room, with the shuffle's sound where `sound` is on. `deal-after`
  makes a hand wait its turn, so a table deals seat after seat; the demo's
  deck does, 150 ms a seat unless chosen otherwise.
- A hand's drawn faces carry their card's id (`data-card`); a face-down
  hand's do not, having no faces in the page.

## [2.8.1] - 2026-10-01

### Fixed

- **A card's letters can no longer be selected.** A drag across a hand, or a
  long press on a phone, highlighted the corner letters and pips as if they
  were text. Every face and back now carries `user-select: none` on its
  `<svg>`, and the card, hand and pile elements on their host.
- **A hand closes back where it lies.** Squared up, scrunched or closed, a
  hand gathered its cards at its left edge, then shrank to fit them once
  still, so a centred hand jumped sideways as each effect ended. A hand now
  keeps the room its whole fan takes in every state, and gathers and spreads
  about its own middle: nothing moves when an effect ends.
- **A pile is one box whatever its messiness.** A pile sized itself by how
  messy it was, so moving the messiness grew and shrank the table round it.
  It now keeps the room its messiest form takes, at any messiness and count,
  with the cards in the middle.

## [2.8.0] - 2026-09-30

### Added

- **Embed a hand**: any hand of cards on any web page, written in the card
  codes. An iframe of the demo site's new `embed/` page, for a page that
  allows no scripts (`embed/?hand=AS+KH+10D&size=medium`), or one tag, the
  `<toranpu-hand>` element from a CDN. Three sizes: small (the hand alone),
  medium, and large (the cards named in words, and a button that turns the
  hand face down one card at a time and back). The address also takes one
  `card`, `lang`, `design`, `back` and its colour and words, `felt` and `ink`
  colours, `face-down`, `closed` and `sound`; anything that is not a hand is
  answered in words, and only what looks like a colour is taken as one. The
  page tells the page that frames it its height and each change by
  `postMessage`, tracks nothing and keeps nothing.
- The demo has an Embed a hand panel that writes both for any hand typed
  into it, at the size chosen, and shows the iframe as it will be framed.

Nothing that was exported has changed.

## [2.7.0] - 2026-09-30

### Added

- **Messy piles**: `<toranpu-pile>`, a stock to draw from (`count="24"
  face-down`, with no need to say which cards) or a discard pile (`cards`,
  its top card last), the cards under the top one showing as a stack from
  neatly squared (`messiness="0"`) to very messy (`1`). Each pile is laid out
  from its own `seed`, so it always looks the same and a card put on top
  moves none of those under it; `depth` caps how many cards are drawn; and a
  pile keeps its size as cards come and go.
- The demo's table draws its stock and discard pile this way, in the look
  chosen on the page, and a Messy piles panel has a slider, a seed and a card
  to draw.

### Changed

- The elements redraw when the page changes its language, so their names
  for screen readers follow a language chooser.
- A count in the elements' words is written as the package writes counts
  elsewhere ("a hand face down, cards: 5"), so one card reads right too.

## [2.6.0] - 2026-09-30

### Added

- **A closed hand that opens with a tap**: `<toranpu-hand closed="0.9"
  reveal>` lies squared up, only its top card showing and the rest partly
  hidden, and a tap, Enter or Space opens it into a clear fan, the cards
  sliding apart, and closes it again as far as it was. `closed` says how
  closed it lies, from 0 (a fan) to 1 (squared up), and can be set at any
  time; `open()` and `close(closed?)` do the same from code. It is a button
  to a screen reader, with `aria-expanded`. A device that asks for less
  motion gets the end at once.
- The demo has a closed-hand panel with a slider for how closed it starts.

Nothing that was exported has changed.

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

[Unreleased]: https://github.com/johnmorrisdotca/toranpu/compare/v2.14.1...HEAD
[2.14.1]: https://github.com/johnmorrisdotca/toranpu/compare/v2.14.0...v2.14.1
[2.12.1]: https://github.com/johnmorrisdotca/toranpu/compare/v2.12.0...v2.12.1
[2.12.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.11.0...v2.12.0
[2.11.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.10.0...v2.11.0
[2.10.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.9.0...v2.10.0
[2.9.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.8.1...v2.9.0
[2.8.1]: https://github.com/johnmorrisdotca/toranpu/compare/v2.8.0...v2.8.1
[2.8.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.7.0...v2.8.0
[2.7.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.6.0...v2.7.0
[2.6.0]: https://github.com/johnmorrisdotca/toranpu/compare/v2.5.0...v2.6.0
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
