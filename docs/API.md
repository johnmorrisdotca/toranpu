# The API in full

The tables of exports of every entry point, from [Toranpu's README](../README.md#api), moved here to keep the README under the length npm shows. Every export is also in the [API reference](https://johnmorrisdotca.github.io/toranpu/api.html), made from the source.

## `@johnmorrisdotca/toranpu`

| Export | What it does |
| --- | --- |
| `newGame(kind, { players, size?, seed?, computers? })` | A new game, or `null` for a table the game is not offered for |
| `rulesFor(kind)` | That game's `CardGameRules`, typed with its own game and move |
| `playComputers(kind, game)` | Plays every computer move due; returns `{ game, moves }` |
| `randomSeed()` | A fresh seed, 1 to 2³¹ − 1 |
| `CARD_GAME_RULES` | Every game's rules, by kind |
| `CARD_GAME_TABLES` | Every game's table: fewest, most and usual players, the sizes offered and the usual one |
| `CARD_GAME_LIST`, `CARD_GAME_KINDS` | The eleven kinds |
| `HEARTS_SIZES`, `SPADES_SIZES`, `EUCHRE_SIZES`, `CRIBBAGE_SIZES`, `OH_HELL_DEALS`, `CRAZY_EIGHTS_SIZES`, `GO_FISH_SIZES`, `BIG_TWO_DEALS`, `PRESIDENT_ROUNDS`, `GIN_SIZES`, `WAR_ROUNDS` | The sizes each game offers |
| `hearts`, `spades`, `euchre`, `cribbage`, `ohHell`, `crazyEights`, `goFish`, `bigTwo`, `president`, `ginRummy`, `war` | Each game's own exports, as a namespace |
| `toJSON`, `fromJSON`, `toCode`, `fromCode`, `toText`, `toCSV`, `savedGame`, `recordOf`, `SAVE_FORMAT`, `CSV_COLUMNS` | A game written out and read back: see [Export and import](#export-and-import) |
| `gameName`, `gameSays`, `cardText`, `cardShort`, `cardsShort`, `suitName`, `suitSymbol`, `rankName`, `namesList`, `moveText` | The games, the cards and the moves in words: see [Words](#words) |
| `STRINGS`, `fillIn`, `languageOf` | Every string in English and Japanese, and the two helpers that read it |
| `cardGameCodec(name, start, play, isMove)`, `computerSeats`, `isCardList` | The save format, for a game of your own |
| Card ids: `FULL_DECK`, `RANK_LETTERS`, `isCard`, `rankOf`, `suitOf`, `cardOf`, `cardOfId`, `cardWords`, `rankWords`, `suitWords` | Reading and naming `"QS"`-style cards |
| Dealing: `shuffledDeck(seed, deal)`, `reshuffled`, `mixSeed`, `dealRound`, `without`, `allDifferent`, `choices`, `nextSeat` | What every game does before its own rules begin |
| `seededRandom(seed)`, `shuffled(list, random)` | The seeded stream every deal comes from |
| `runCli(args, surroundings?)`, `cliLanguage` | The command line as a function |
| `VERSION` | This package's version |

Types: `CardGameKind`, `CardGameRules`, `CardGameTable`, `CardSeats`,
`CardId`, `CardSuit`, `CardRank`, `GameOf`, `MoveOf`, `NewGameOptions`,
`CardGamePlays`, `KeptCardGame`, `CardGameCodec`, `SavedGame`, `ReadGame`,
`RecordedMove`, `MoveTextOptions`, `Language`, `ToranpuStrings`,
`CliSurroundings`, `CliResult`, `Random`.

## `@johnmorrisdotca/toranpu/<game>`

Each game is also its own entry point, so a table that plays one game loads
one game. They follow one naming pattern (shown for Hearts):

| Export | What it does |
| --- | --- |
| `startHearts`, `playHearts`, `heartsMoves`, `heartsWinners` | The rules as plain functions |
| `heartsComputer(game)`, `heartsView(game)` | The computer's move, and the part of the game its seat can see |
| `encodeHearts`, `decodeHearts` | The save format |
| `HEARTS_RULES` | All of the above as one `CardGameRules` |
| `HeartsGame`, `HeartsMove`, … | The game's types |
| Game helpers | Scoring and ordering: `heartsPoints`, `trickWinner`, `spadesTrickWinner`, `euchreHeight`, `showCount` (Cribbage), `bestLayout` and `deadwoodOf` (Gin), `bigTwoBeats`, `presidentTitle` and more |

Entry points, each a game's name in kebab case: `hearts`, `spades`, `euchre`,
`cribbage`, `oh-hell`, `crazy-eights`, `go-fish`, `big-two`, `president`,
`gin-rummy`, `war`. A game's key in a saved game stays as it was (`ohHell`), so a game
saved before 2.0 still reads.

The solitaires, Klondike, FreeCell and Spider, are entry points too (by those names in lower case),
with a pattern of their own (they have no seats and no computer player): see
[Solitaire](#solitaire-klondike-freecell-and-spider) above.

## `@johnmorrisdotca/toranpu/deck`

| Export | What it does |
| --- | --- |
| `freshDeck()`, `shuffledDeck(seed)` | Fifty-two `{ suit, rank }` cards, sorted or shuffled from a seed |
| `dealRound(deck, hands, each)`, `dealAll(deck, hands)`, `take(deck, n)` | Dealing, one card at a time round the table |
| `cardCode`, `cardFromCode`, `writeCards`, `readCards`, `isWholeDeck` | One character a card: a deck as a 52-letter string, safe in an address |
| `cardId`, `cardFromId` | The two-letter ids the games use |
| `cardName`, `cardShortName`, `colourOf`, `isRed`, `sameCard`, `cardIndex`, `cardAt`, `sortedHand` | Naming, colour, place and sorting |
| `SUITS`, `RANKS`, `DECK_SIZE`, `SUIT_DISPLAY`, `RANK_DISPLAY`, `CARD_ALPHABET` | The vocabulary |
| `seededRandom`, `shuffled` | The seeded stream, and the shuffle |

## `@johnmorrisdotca/toranpu/react`

`useCardGame(kind, options, computerDelay = 700)` returns
`{ game, toPlay, computerToPlay, moves, over, winners, play, restart }`.
Computers move by themselves, one move every `computerDelay` milliseconds.

## `@johnmorrisdotca/toranpu/card-sounds`

| Export | What it does |
| --- | --- |
| `createCardSounds(options?)` | A table's sounds: `play(kind, { count?, gap?, delay? })`, `load()`, `muted` and `setMuted`, `volume`, `close()` |
| `CARD_SOUND_KINDS` | The six kinds: `shuffle`, `deal`, `flip`, `play`, `gather`, `fan` |
| `soundTimes(count, gap?)` | When each of several sounds starts, at most `MOST_SOUNDS_AT_ONCE` (8) |

Types: `CardSoundKind`, `CardSounds`, `CardSoundsOptions`,
`PlayCardSoundOptions`, `CardSoundData`, `CardSoundWindow`.

## `@johnmorrisdotca/toranpu/sounds`

`CARD_SOUND_DATA`, the recordings as base64 AAC by name (`deal-2`), and their
type `CardSoundFile`. `createCardSounds` loads it by itself; import it only
to play the recordings your own way.

## `@johnmorrisdotca/toranpu/card-backs`

| Export | What it does |
| --- | --- |
| `cardBackSvg(name?, options?)` | A back as a whole SVG document |
| `cardBackUrl(name?, options?)` | The same as a data URL |
| `registerCardBack(name, back)` | Keeps your own back under a name, for `back="…"` on every element of the page |
| `unregisterCardBack(name)`, `registeredCardBacks()` | Forgets one; lists the names registered |
| `cardBackNames()` | The package's three backs' names and the ones registered |
| `CARD_BACKS` | The three backs' names |
| `CARD_BACK_LOOK` | Each back's own field, ink and paper colours |
| `CARD_BACK_PROPERTIES` | The CSS custom properties a back in a page takes its colours from |
| `CARD_BOX`, `SUIT_PATHS` | The card's 100 by 140 box, and the four suits drawn as paths in a box of 100 |

Types: `CardBackName`, `CardBackOptions`, `RegisteredCardBack`, `CardSuitLetter`.

## `@johnmorrisdotca/toranpu/card-faces`

| Export | What it does |
| --- | --- |
| `cardFaceSvg(card, options?)` | A face as a whole SVG document, or `null` for what is not a card |
| `cardFaceUrl(card, options?)` | The same as a data URL |
| `loadCardDesign(name)` | A design by name, fetched when first asked for: `"english"`; a design the page registered is given as it is |
| `registerCardDesign(design)` | Keeps your own design under its name, for `design="…"` on every element of the page |
| `unregisterCardDesign(name)`, `registeredCardDesigns()` | Forgets one; lists the names registered |
| `cardFaceFromArt(art, options?)` | One face from artwork of your own, on the card's paper, as an SVG document |
| `cleanMarkup(markup)`, `safeImageUrl(url)` | Markup with what could run or fetch taken out; a picture's address, or `null` |
| `CUSTOM_CARD_ID` | What the id of a card of your own may look like |
| `CARD_DESIGNS` | The designs' names: plain, four colour, the English pattern and realistic |
| `JOKERS` | The jokers' ids, `RJ` and `BJ` |
| `EXTRA_CARDS` | The extras of a deck no game deals: the jokers, the rules cards R1 (Hearts) and R2 (Spades), and the blank BL |
| `EXTRA_LIMITS` | The most of each a hand holds: four jokers, two rules cards, two blanks |
| `isCardFace(text)` | Whether a face can be drawn for it |
| `faceName(card, language?, design?)` | A face's name in words, jokers included; a card of a design of your own by that design's label |
| `pipPlaces(count)` | Where a number card's pips go, and which are drawn upside down |
| `CARD_FACE_COLOURS`, `CARD_FACE_PROPERTIES` | The faces' own colours, and the CSS custom properties that change them |

Types: `CardDesign`, `CardDesignName`, `CardFaceOptions`.

## `@johnmorrisdotca/toranpu/card-faces/english`

`ENGLISH_PATTERN`, the English pattern as a `CardDesign`: all fifty-two cards
and both jokers in a box 360 by 540.

## `@johnmorrisdotca/toranpu/card-faces/realistic`

`REALISTIC`, the realistic design as a `CardDesign`: Byron Knoll's thirty-nine
number cards and aces, with `ENGLISH_PATTERN` as its fallback for every
other card.

## `@johnmorrisdotca/toranpu/element`

| Export | What it does |
| --- | --- |
| `defineToranpuElements()` | Registers the elements under their tags, once |
| `ToranpuCard` | The `<toranpu-card>` element's class |
| `ToranpuHand` | The `<toranpu-hand>` element's class |
| `registerCardDesign(design)`, `registerCardBack(name, back)` | As from `card-faces` and `card-backs`: your own faces and backs, by name |
| `ToranpuPile` | The `<toranpu-pile>` element's class |
| `BUNDLE_BACKS` | How many backs a scrunched hand shows, whatever its size: 3 |
| `TORANPU_TAGS` | The elements' tags |
| `ELEMENT_SIZES` | The card widths `size` names: small 46, medium 70, large 104 |
| `handLayout(count, options?)` | Where each card of a hand lies, fanned or squared up |
| `partedHandLayout(count, at, options?)` | Where each card lies with the hand parted at its card in that place, from 0: it lifted clear, a group either side |
| `pileLayout(count, options?)` | Where each card of a pile lies, neat or messy, from a seed |
| `readHand(text)` | A hand written as ids (`"AS KH 10D"`) or one-letter codes, as its cards |
| `arrangeCards(cards, by)` | A hand by `"rank"`, grouped by `"suit"`, number cards then face cards (`"face"`), or as `"dealt"`, as a new list; the extras last |
| `mixCards(cards, random?)` | The same cards in another order, never the one given |
| `tossCard(cards, card)` | The hand without that card |
| `replaceCard(cards, card, next, lands?)` | The hand with that card out and the next card at the `"front"` or the `"end"` |

Types: `CardFaceRenderer`, `CardFaceContext`, `CardPlace`, `HandLayoutOptions`, `PartOptions`, `PileLayoutOptions`, `HandTurnOptions`, `SpinOptions`, `CardOrder`, `CardLands`.

## `@johnmorrisdotca/toranpu/element/define`

The same exports, and the elements registered by importing it: the one
module of the package with an effect of its own, and named in
`sideEffects` so a bundler keeps it.

## `@johnmorrisdotca/toranpu/table`

| Export | What it does |
| --- | --- |
| `defineToranpuTable()` | Registers `<toranpu-table>`, and the card, hand and pile elements it lays out, once |
| `ToranpuTable` | The `<toranpu-table>` element's class |
| `TABLE_CLOTHS` | The five cloths a table may be laid in, each its felt, its deep edge and its ink |

Types: `TableCloth`.

## `@johnmorrisdotca/toranpu/table/define`

The same exports, and `<toranpu-table>` registered by importing it, named
in `sideEffects` like `element/define`.
