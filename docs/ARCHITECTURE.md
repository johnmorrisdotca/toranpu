# Architecture: the source tree

The file-by-file tree of Toranpu's source, from [the README's Architecture section](../README.md#architecture). A test holds this tree to the files under `src/`, so it cannot fall behind the code.

Each game is a folder of its own under `src/games/`: its rules as pure
functions, its types, its computer player, and the code that keeps a table as
text. The eleven card games and three solitaires share the deck, the saving and
the words. Drawing sits apart under `ui/`, so the rules run with no DOM, and
every game and every browser part is an entry point of its own, so a page
loads only what it uses.

```text
src/
├── big-two.ts
├── card-backs.ts
├── card-faces.ts
├── card-sounds.ts
├── cards/
│   ├── cards.constants.ts
│   ├── cards.types.ts
│   └── deck.ts
├── cli.ts
├── crazy-eights.ts
├── cribbage.ts
├── deck.ts
├── designs/
│   ├── english.ts
│   └── realistic.ts
├── element-define.ts
├── element.ts
├── euchre.ts
├── freecell.ts
├── games/
│   ├── bigTwo/
│   │   ├── big-two-computer.ts
│   │   ├── big-two-hands.ts
│   │   ├── big-two-rules.ts
│   │   ├── big-two.ts
│   │   └── big-two.types.ts
│   ├── card-game-codec.ts
│   ├── card-game-rules.ts
│   ├── card-games.constants.ts
│   ├── card-games.types.ts
│   ├── cards.ts
│   ├── climbing/
│   │   ├── climbing.ts
│   │   └── climbing.types.ts
│   ├── crazyEights/
│   │   ├── crazy-eights-computer.ts
│   │   ├── crazy-eights-rules.ts
│   │   ├── crazy-eights.ts
│   │   └── crazy-eights.types.ts
│   ├── cribbage/
│   │   ├── cribbage-computer.ts
│   │   ├── cribbage-rules.ts
│   │   ├── cribbage.ts
│   │   └── cribbage.types.ts
│   ├── euchre/
│   │   ├── euchre-computer.ts
│   │   ├── euchre-rules.ts
│   │   ├── euchre.ts
│   │   └── euchre.types.ts
│   ├── freecell/
│   │   ├── code.ts
│   │   ├── freecell.types.ts
│   │   ├── intent.ts
│   │   ├── rules.ts
│   │   └── solve.ts
│   ├── ginRummy/
│   │   ├── gin-computer.ts
│   │   ├── gin-rummy-rules.ts
│   │   ├── gin-rummy.ts
│   │   └── gin-rummy.types.ts
│   ├── goFish/
│   │   ├── go-fish-computer.ts
│   │   ├── go-fish-rules.ts
│   │   ├── go-fish.ts
│   │   └── go-fish.types.ts
│   ├── hearts/
│   │   ├── hearts-computer.ts
│   │   ├── hearts-rules.ts
│   │   ├── hearts.ts
│   │   └── hearts.types.ts
│   ├── klondike/
│   │   ├── code.ts
│   │   ├── intent.ts
│   │   ├── klondike.ts
│   │   ├── klondike.types.ts
│   │   └── solve.ts
│   ├── ohHell/
│   │   ├── oh-hell-computer.ts
│   │   ├── oh-hell-rules.ts
│   │   ├── oh-hell.ts
│   │   └── oh-hell.types.ts
│   ├── president/
│   │   ├── president-computer.ts
│   │   ├── president-rules.ts
│   │   ├── president.ts
│   │   └── president.types.ts
│   ├── solitaire/
│   │   └── best-first.ts
│   ├── spades/
│   │   ├── spades-computer.ts
│   │   ├── spades-rules.ts
│   │   ├── spades.ts
│   │   └── spades.types.ts
│   ├── spider/
│   │   ├── code.ts
│   │   ├── intent.ts
│   │   ├── rules.ts
│   │   ├── solve.ts
│   │   └── spider.types.ts
│   └── war/
│       ├── war-computer.ts
│       ├── war-rules.ts
│       ├── war.ts
│       └── war.types.ts
├── gin-rummy.ts
├── go-fish.ts
├── hearts.ts
├── index.ts
├── klondike.ts
├── oh-hell.ts
├── play.ts
├── president.ts
├── random.ts
├── react.ts
├── save.ts
├── sounds.ts
├── spades.ts
├── spider.ts
├── strings.ts
├── table-define.ts
├── table.ts
├── ui/
│   ├── card-backs.ts
│   ├── card-element.ts
│   ├── card-faces.ts
│   ├── card-faces.types.ts
│   ├── card-sounds.ts
│   ├── element-kit.ts
│   ├── hand-element.ts
│   ├── layout.ts
│   ├── markup.ts
│   ├── pile-element.ts
│   ├── registry.ts
│   ├── svg.ts
│   ├── svg.types.ts
│   └── table-element.ts
├── version.ts
├── war.ts
└── words.ts
```

Tests sit beside the code they test (`*.test.ts`). `bin/` is the few lines
that hand the command line the real process, `scripts/` builds the demo, the
sounds and the card designs and checks the package as npm packs it, `sounds/`
holds the recorded sources, `demo/` is the page published on GitHub Pages and
`e2e/` taps it in real browsers.
