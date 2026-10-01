/**
 * EVERY WORD TORANPU SAYS TO A PERSON, in English and Japanese: the games'
 * names and what each is in a line, the cards' names, a move in words, the
 * command line's lines, and the demo table's. One table, so that the two
 * languages are kept side by side and a test can hold them together.
 * `{n}` and the other braces are filled in with `fillIn`; a table of your own
 * must keep them.
 */

/** The languages Toranpu speaks. */
export type Language = "en" | "ja";

/** The names of the strings. Each is one line or one block of text. */
export type ToranpuStrings = {
  gameHearts: string;
  gameSpades: string;
  gameEuchre: string;
  gameCribbage: string;
  gameOhHell: string;
  gameCrazyEights: string;
  gameGoFish: string;
  gameBigTwo: string;
  gamePresident: string;
  gameGinRummy: string;
  saysHearts: string;
  saysSpades: string;
  saysEuchre: string;
  saysCribbage: string;
  saysOhHell: string;
  saysCrazyEights: string;
  saysGoFish: string;
  saysBigTwo: string;
  saysPresident: string;
  saysGinRummy: string;
  suitS: string;
  suitH: string;
  suitD: string;
  suitC: string;
  rank1: string;
  rank11: string;
  rank12: string;
  rank13: string;
  cardName: string;
  offerPlay: string;
  offerPlaySuit: string;
  offerPassCards: string;
  offerPass: string;
  offerCrib: string;
  offerGive: string;
  offerDraw: string;
  offerTakeDiscard: string;
  offerDiscard: string;
  offerKnock: string;
  offerOrder: string;
  offerCall: string;
  offerBid: string;
  offerBidNil: string;
  offerAsk: string;
  didPlay: string;
  didPlaySuit: string;
  didPassCards: string;
  didPass: string;
  didCrib: string;
  didGive: string;
  didDraw: string;
  didTakeDiscard: string;
  didDiscard: string;
  didKnock: string;
  didOrder: string;
  didCall: string;
  didBid: string;
  didBidNil: string;
  didAsk: string;
  hidPassCards: string;
  hidCrib: string;
  hidGive: string;
  recordHead: string;
  recordOver: string;
  recordGoing: string;
  listJoin: string;
  seatName: string;
  /** The command line's help, whole. */
  cliUsage: string;
  cliUnknown: string;
  cliNeeds: string;
  cliTryHelp: string;
  cliNoCommand: string;
  cliNoGame: string;
  cliSeedBad: string;
  cliPlayersBad: string;
  cliSizeBad: string;
  cliHandsBad: string;
  cliLangBad: string;
  cliBoth: string;
  cliFresh: string;
  cliGameLine: string;
  cliHand: string;
  cliRest: string;
  cliTurned: string;
  cliNoSave: string;
  cliNotSaved: string;
  cliSavedOver: string;
  cliSavedGoing: string;
  cliPlayed: string;
  cliScores: string;
  pagePitch: string;
  pageName: string;
  pageNameLink: string;
  pageFoot: string;
  pageChoose: string;
  pagePlayers: string;
  pageSeed: string;
  pageDeal: string;
  pageYourHand: string;
  pageYou: string;
  pageComputer: string;
  pageCards: string;
  pageScore: string;
  pageBid: string;
  pageTricks: string;
  pageBooks: string;
  pageTrick: string;
  pageLastTrick: string;
  pageToBeat: string;
  pageCount: string;
  pageDiscard: string;
  pageSuitToFollow: string;
  pageTurnedUp: string;
  pageTrump: string;
  pageStarter: string;
  pageStock: string;
  pageThinking: string;
  pageYourTurn: string;
  pageYourTurnPick: string;
  pageYourTurnPass: string;
  pageYourTurnCrib: string;
  pageYourTurnGive: string;
  pageOver: string;
  pageLog: string;
  pageLogStart: string;
  pageRules: string;
  pageDeck: string;
  pageDeckNote: string;
  pageShuffle: string;
  pageHands: string;
  pageEach: string;
  /** The demo deck: how long each seat waits after the one before when the cards are dealt again, and a time in milliseconds. */
  pageSeatAfter: string;
  pageMs: string;
  pageDeckCode: string;
  pageLeft: string;
  pageKeep: string;
  pageKeepNote: string;
  pageAsCode: string;
  pageAsJson: string;
  pageAsText: string;
  pageAsCsv: string;
  pageCopy: string;
  pageCopied: string;
  pageCopyFailed: string;
  pagePaste: string;
  pagePasteHint: string;
  pageRead: string;
  pageReadBad: string;
  pageApi: string;
  pageApiIntro: string;
  pageBack: string;
  pageDeckSeed: string;
  pageToPlay: string;
  pageSound: string;
  pageSounds: string;
  pageSoundsNote: string;
  pageSoundShuffle: string;
  pageSoundDeal: string;
  pageSoundFlip: string;
  pageSoundPlay: string;
  pageSoundGather: string;
  pageSoundFan: string;
  pageBacks: string;
  pageBacksNote: string;
  pageBackClassicRed: string;
  pageBackClassicBlue: string;
  pageBackInkDots: string;
  pageBackColour: string;
  pageBackOwnColour: string;
  pageBackMark: string;
  cardRedJoker: string;
  cardBlackJoker: string;
  /** The extras of a deck: a rules card of each game, and the blank. */
  cardRulesHearts: string;
  cardRulesSpades: string;
  cardBlank: string;
  /** What a rules card says: its game's name at the head, then five short lines, one to a line of the text. */
  rulesHeartsTitle: string;
  rulesHearts: string;
  rulesSpadesTitle: string;
  rulesSpades: string;
  pageDesigns: string;
  pageDesignsNote: string;
  pageDesignPlain: string;
  pageDesignFourColour: string;
  pageDesignEnglish: string;
  pageDesignRealistic: string;
  cardFaceDown: string;
  /** A card that carries a mark, as a screen reader hears it: its name, or that it is face down. */
  cardMarked: string;
  pageOneCard: string;
  pageOneCardNote: string;
  pageCardPick: string;
  pageAsElement: string;
  pageAsPicture: string;
  handLabel: string;
  handFaceDown: string;
  handScrunched: string;
  /** A hand squared up face up: its top card, and never how many. */
  handSquared: string;
  pageHide: string;
  pageHideNote: string;
  pageHideAll: string;
  pageHideOneByOne: string;
  pageShowHand: string;
  pageScrunch: string;
  /** The demo hand: sorted by rank, grouped by suit, and back as dealt. */
  pageSort: string;
  pageGroup: string;
  pageUnsort: string;
  /** The demo hand: mixed up, a card tossed out, a card replaced, and where a new one lands. */
  pageMix: string;
  pageToss: string;
  pageReplace: string;
  pageLands: string;
  pageAtEnd: string;
  pageAtFront: string;
  pageSpread: string;
  pageNewHand: string;
  /** The demo hand's rows of controls, each named by what its buttons do. */
  pageRowTurn: string;
  pageRowGather: string;
  pageRowOrder: string;
  pageRowChange: string;
  pageRowMark: string;
  /** The card the one-card controls act on. */
  pageWhichCard: string;
  /** The demo hand: one card turned over, parted out and closed up again, grouped by face, marked, spun. */
  pageToggle: string;
  pageToggleAll: string;
  pagePart: string;
  pageUnpart: string;
  pageGroupFace: string;
  pageMark: string;
  pageUnmark: string;
  pageSpin: string;
  pageSpinAll: string;
  pageClockwise: string;
  pageAnticlockwise: string;
  pageReveal: string;
  pageRevealNote: string;
  pageClosed: string;
  pileFaceDown: string;
  pileFaceUp: string;
  pileEmpty: string;
  pagePiles: string;
  pagePilesNote: string;
  /** The demo's panel for <toranpu-table>: its heading, its note, and the game chosen for it. */
  pageTablePanel: string;
  pageTablePanelNote: string;
  pageTableGame: string;
  pageMessiness: string;
  pagePileSeed: string;
  pageDrawCard: string;
  pageStockPile: string;
  embedTurn: string;
  embedBad: string;
  pageEmbed: string;
  pageEmbedNote: string;
  pageEmbedCards: string;
  pageEmbedSize: string;
  pageSizeSmall: string;
  pageSizeMedium: string;
  pageSizeLarge: string;
  pageAsFrame: string;
  pageAsTag: string;
};

/** Every string, in both languages. */
export const STRINGS: Record<Language, ToranpuStrings> = {
  en: {
    gameHearts: "Hearts",
    gameSpades: "Spades",
    gameEuchre: "Euchre",
    gameCribbage: "Cribbage",
    gameOhHell: "Oh Hell",
    gameCrazyEights: "Crazy Eights",
    gameGoFish: "Go Fish",
    gameBigTwo: "Big Two",
    gamePresident: "President",
    gameGinRummy: "Gin Rummy",
    saysHearts: "Avoid hearts and the queen of spades. Pass three cards, follow suit, lowest score wins.",
    saysSpades: "Partners across the table bid tricks together. Spades are always trumps.",
    saysEuchre: "Five cards, four players in partnerships, and the jacks of trumps' colour on top.",
    saysCribbage: "Lay two to the crib, peg to thirty-one, then count fifteens, pairs and runs.",
    saysOhHell: "Bid exactly how many tricks you will take. The hands grow from one card to seven, and the dealer may not make the bids add up.",
    saysCrazyEights: "Match the suit or the rank. Eights are wild and name the next suit.",
    saysGoFish: "Ask a player for a rank. Collect books of four. Go fish when they have none.",
    saysBigTwo: "Beat the cards on the table with singles, pairs, triples or five-card hands. Twos are high.",
    saysPresident: "Shed your cards first to become President. The last out hands over their best cards.",
    saysGinRummy: "Draw and discard to make sets and runs, then knock when your deadwood is low.",
    suitS: "spades",
    suitH: "hearts",
    suitD: "diamonds",
    suitC: "clubs",
    rank1: "ace",
    rank11: "jack",
    rank12: "queen",
    rank13: "king",
    cardName: "{rank} of {suit}",
    offerPlay: "Play {cards}",
    offerPlaySuit: "Play {cards}, calling {suit}",
    offerPassCards: "Pass {cards}",
    offerPass: "Pass",
    offerCrib: "Lay {cards} in the crib",
    offerGive: "Give {cards}",
    offerDraw: "Draw",
    offerTakeDiscard: "Take the discard",
    offerDiscard: "Discard {cards}",
    offerKnock: "Knock, discarding {cards}",
    offerOrder: "Order it up",
    offerCall: "Call {suit}",
    offerBid: "Bid {n}",
    offerBidNil: "Bid nil",
    offerAsk: "Ask {player} for {rank}",
    didPlay: "plays {cards}",
    didPlaySuit: "plays {cards}, calling {suit}",
    didPassCards: "passes {cards}",
    didPass: "passes",
    didCrib: "lays {cards} in the crib",
    didGive: "gives {cards}",
    didDraw: "draws",
    didTakeDiscard: "takes the discard",
    didDiscard: "discards {cards}",
    didKnock: "knocks, discarding {cards}",
    didOrder: "orders it up",
    didCall: "calls {suit}",
    didBid: "bids {n}",
    didBidNil: "bids nil",
    didAsk: "asks {player} for {rank}",
    hidPassCards: "passes cards: {n}",
    hidCrib: "lays cards in the crib: {n}",
    hidGive: "gives cards: {n}",
    recordHead: "{game} for {n}, seed {seed}: {players}",
    recordOver: "Over. Won by {players}.",
    recordGoing: "Not over. {player} to play.",
    listJoin: ", ",
    seatName: "Seat {n}",
    cliUsage: `Usage: toranpu <command> [options]

A deck of playing cards and ten card games, dealt from a seed.

  toranpu games                     the ten games, and the tables they play at
  toranpu deal --seed 42            four hands of thirteen from a seeded shuffle
  toranpu deal -n 2 -e 5 -s 42      two hands of five, and what is left
  toranpu deal hearts --seed 42     a game's own first deal, seat by seat
  toranpu play euchre --seed 42     computers play a whole game; who won
  toranpu play hearts -s 42 --text  the same, with every move in words
  toranpu check saved.json          is this a saved game? (or --stdin)

Options:
  -s, --seed <n>       a whole number from 1; the same seed deals the same cards
  -p, --players <n>    how many sit down (each game's usual number unless said)
      --size <n>       how long the game lasts, in its own terms (see games)
  -n, --hands <n>      deal: how many hands (4 unless said)
  -e, --each <n>       deal: cards to a hand (the whole deck unless said)
      --text           play: print every move in words
  -j, --json           print JSON (format 1)
      --csv            print CSV
      --stdin          check: read the saved game from standard input
      --lang <en|ja>   English or Japanese (default: your system's)
      --no-color       no colour (NO_COLOR is honoured too)
  -h, --help           this help
  -v, --version        the version

With no seed, one is drawn and named on standard error, so that the run can
be repeated. Exit codes: 0 done, 1 what was asked for could not be done
(a saved game that is not one), 2 the command was wrong.
`,
    cliUnknown: "unknown option {part}",
    cliNeeds: "{part} needs a value",
    cliTryHelp: "Try `toranpu --help`.",
    cliNoCommand: "“{part}” is not a command. There are games, deal, play and check",
    cliNoGame: "no game is called “{part}”. `toranpu games` lists them",
    cliSeedBad: "--seed takes a whole number from 1 to 2147483647",
    cliPlayersBad: "{game} is played by {fewest} to {most}",
    cliSizeBad: "{game} is played to one of: {sizes}",
    cliHandsBad: "there are 52 cards: {hands} hands of {each} cannot be dealt",
    cliLangBad: "--lang takes en or ja",
    cliBoth: "--json and --csv are one or the other",
    cliFresh: "seed {seed} (pass --seed {seed} to repeat this)",
    cliGameLine: "{name} ({players} players; {sizes}): {says}",
    cliHand: "{name}: {cards}",
    cliRest: "Left: {cards}",
    cliTurned: "Turned up: {cards}",
    cliNoSave: "there is no saved game to check: name a file, or pipe one in with --stdin",
    cliNotSaved: "that is not a saved game: the rules cannot play it out",
    cliSavedOver: "{game} for {n}, seed {seed}, {moves} moves. Over: won by {players}.",
    cliSavedGoing: "{game} for {n}, seed {seed}, {moves} moves. Not over: {player} to play.",
    cliPlayed: "{game} for {n}, seed {seed}: {moves} moves. Won by {players}.",
    cliScores: "Scores: {scores}",
    pagePitch: "A deck of playing cards and ten card games, each with a computer player. Pick a game and play a hand.",
    pageName: "Toranpu is the everyday Japanese word for a deck of playing cards.",
    pageNameLink: "About the name",
    pageFoot: "Every deal here comes from its seed, so a seed can be shared. Nothing leaves this device.",
    pageChoose: "Choose a game",
    pagePlayers: "Players",
    pageSeed: "Seed",
    pageDeal: "Deal",
    pageYourHand: "Your hand",
    pageYou: "You",
    pageComputer: "computer",
    pageCards: "cards: {n}",
    pageScore: "score {n}",
    pageBid: "bid {n}",
    pageTricks: "tricks: {n}",
    pageBooks: "books: {n}",
    pageTrick: "Trick",
    pageLastTrick: "Last trick, taken by {player}",
    pageToBeat: "To beat ({player})",
    pageCount: "Count {n}",
    pageDiscard: "Discard",
    pageSuitToFollow: "Suit to follow",
    pageTurnedUp: "Turned up",
    pageTrump: "Trumps",
    pageStarter: "Starter",
    pageStock: "Stock: {n}",
    pageThinking: "{player} is thinking…",
    pageYourTurn: "Your turn.",
    pageYourTurnPick: "Your turn: pick a card, then choose what to do.",
    pageYourTurnPass: "Your turn: pick {n} cards to pass.",
    pageYourTurnCrib: "Your turn: pick two cards for the crib.",
    pageYourTurnGive: "Your turn: pick cards to give: {n}.",
    pageOver: "Game over. Won by {players}.",
    pageLog: "What happened",
    pageLogStart: "{game} for {n}, seed {seed}.",
    pageRules: "The rules",
    pageDeck: "The deck on its own",
    pageDeckNote: "Fifty-two cards, shuffled from the seed and dealt one at a time round the table. The same seed always gives this order.",
    pageShuffle: "Shuffle",
    pageHands: "Hands",
    pageEach: "Cards each",
    pageSeatAfter: "Each seat after",
    pageMs: "{n} ms",
    pageDeckCode: "The whole deck as one line, a letter a card",
    pageLeft: "Left over: {n}",
    pageKeep: "Keep this game, and read one back",
    pageKeepNote: "A game is its table, its seed and its moves, and nothing else. Read back, every move is played through the rules again, so a changed save is refused.",
    pageAsCode: "Code",
    pageAsJson: "JSON",
    pageAsText: "Text",
    pageAsCsv: "CSV",
    pageCopy: "Copy",
    pageCopied: "Copied",
    pageCopyFailed: "Select it and copy",
    pagePaste: "Read a game back",
    pagePasteHint: "Paste a game's code or its JSON",
    pageRead: "Read",
    pageReadBad: "That is not a saved game: the rules cannot play it out.",
    pageApi: "API reference",
    pageApiIntro: "Every export of every entry point, with its signature and its doc comment. Made from the source when the site is built.",
    pageBack: "Back to the table",
    pageDeckSeed: "Deck seed",
    pageToPlay: "{player} to play.",
    pageSound: "Sound",
    pageSounds: "Card sounds",
    pageSoundsNote: "Recordings of real cards, made only when a table asks for one. Tap a sound to hear it. Sound, by the Deal button, plays them at the table as the game goes.",
    pageSoundShuffle: "Shuffle",
    pageSoundDeal: "Deal",
    pageSoundFlip: "Turn over",
    pageSoundPlay: "Play a card",
    pageSoundGather: "Gather",
    pageSoundFan: "Fan",
    pageBacks: "Card backs",
    pageBacksNote: "Three backs drawn for Toranpu, for any card game: a classic red, a classic blue and ink with dots. Give one your own colour or a word in its middle.",
    pageBackClassicRed: "Classic red",
    pageBackClassicBlue: "Classic blue",
    pageBackInkDots: "Ink with dots",
    pageBackColour: "Colour",
    pageBackOwnColour: "Its own colour",
    pageBackMark: "Words in the middle",
    cardRedJoker: "red joker",
    cardBlackJoker: "black joker",
    cardRulesHearts: "rules card, Hearts",
    cardRulesSpades: "rules card, Spades",
    cardBlank: "blank card",
    rulesHeartsTitle: "HEARTS",
    rulesHearts: "Pass three cards, then play\nFollow suit if you can\nEach heart: 1 point\nQueen of spades: 13\nFewest points wins",
    rulesSpadesTitle: "SPADES",
    rulesSpades: "Bid the tricks you will take\nFollow suit if you can\nSpades are always trumps\nMake your bid: 10 a trick\nFall short: lose your bid",
    pageDesigns: "Card designs",
    pageDesignsNote: "Plain is drawn for Toranpu and is the default. Four colour makes diamonds blue and clubs green. The English pattern is the traditional deck, its kings, queens and jacks drawn by Dmitry Fomin and given to the public domain. Realistic is Byron Knoll's public-domain deck, with Fomin's kings, queens and jacks.",
    pageDesignPlain: "Plain",
    pageDesignFourColour: "Four colour",
    pageDesignEnglish: "English pattern",
    pageDesignRealistic: "Realistic",
    cardFaceDown: "a card, face down",
    cardMarked: "{card}, marked",
    pageOneCard: "One card on any page",
    pageOneCardNote: "A card as an element, in the design and back chosen above: tap it to turn it over. Or as a picture, by its address on this site or as a data URL.",
    pageCardPick: "Card",
    pageAsElement: "As an element",
    pageAsPicture: "As a picture",
    handLabel: "Hand: {cards}",
    handFaceDown: "a hand face down, cards: {n}",
    handScrunched: "a hand of cards, squared up face down",
    handSquared: "a hand of cards, squared up, {card} on top",
    pageHide: "Hand controls",
    pageHideNote: "Everything a hand can do where it lies. Turn it face down, all at once or one card after another, or turn chosen cards over. Gather it into a bundle that never says how many, or part it at one card to bring that card out. Sort it, group it, mix it up, toss a card or swap one, and mark a card to follow it while it is face down.",
    pageHideAll: "Face down",
    pageHideOneByOne: "One by one",
    pageShowHand: "Face up",
    pageScrunch: "Scrunch",
    pageSpread: "Spread out",
    pageMix: "Mix up",
    pageToss: "Toss a card",
    pageReplace: "Replace a card",
    pageLands: "New card goes",
    pageAtEnd: "at the end",
    pageAtFront: "at the front",
    pageSort: "Sort",
    pageGroup: "Group by suit",
    pageUnsort: "As dealt",
    pageNewHand: "Another hand",
    pageRowTurn: "Turn",
    pageRowGather: "Gather",
    pageRowOrder: "Order",
    pageRowChange: "Change",
    pageRowMark: "Mark and spin",
    pageWhichCard: "Card",
    pageToggle: "Turn it over",
    pageToggleAll: "Turn every card over",
    pagePart: "Part at it",
    pageUnpart: "Close up",
    pageGroupFace: "Number and face cards",
    pageMark: "Mark it",
    pageUnmark: "Clear marks",
    pageSpin: "Spin it",
    pageSpinAll: "Spin them all",
    pageClockwise: "clockwise",
    pageAnticlockwise: "anticlockwise",
    pageReveal: "A closed hand that opens with a tap",
    pageRevealNote: "The hand lies squared up, only its top card showing and the rest partly hidden. Tap it to open it into a fan, and again to close it.",
    pageClosed: "How closed",
    pileFaceDown: "a pile face down, cards: {n}",
    pileFaceUp: "a pile, {card} on top, cards: {n}",
    pileEmpty: "an empty pile",
    pagePiles: "Messy piles",
    pagePilesNote: "A stock to draw from and a discard pile, the cards under the top one showing as a stack, from neatly squared to very messy. The seed keeps a pile looking the same; draw a card and watch only the top change.",
    pageMessiness: "Messiness",
    pageTablePanel: "A whole table on your page",
    pageTablePanelNote: "Any of the games, ready to play, in one tag: the seats, your hand, the moves you may make, the stock and the discard, and computers in the other seats. Its cloth follows the patches above, and its cards and its messiness the choices on this page.",
    pageTableGame: "Game",
    pagePileSeed: "Pile seed",
    pageDrawCard: "Draw a card",
    pageStockPile: "Stock",
    embedTurn: "Turn over",
    embedBad: "Those are not cards. Write them as AS KH 10D (and JOKER, RULES or BLANK), or in the deck's one-letter codes. A hand holds at most four jokers, two rules cards and two blanks.",
    pageEmbed: "Embed a hand",
    pageEmbedNote: "Any hand of cards on any web page: write it in the card codes, choose a size, and copy one of the two. The iframe needs no script on your page; the tag needs one script line.",
    pageEmbedCards: "Cards",
    pageEmbedSize: "Size",
    pageSizeSmall: "Small",
    pageSizeMedium: "Medium",
    pageSizeLarge: "Large",
    pageAsFrame: "As an iframe",
    pageAsTag: "As one tag",
  },
  ja: {
    gameHearts: "ハーツ",
    gameSpades: "スペード",
    gameEuchre: "ユーカー",
    gameCribbage: "クリベッジ",
    gameOhHell: "オー・ヘル",
    gameCrazyEights: "クレイジーエイト",
    gameGoFish: "ゴーフィッシュ",
    gameBigTwo: "ビッグツー",
    gamePresident: "大富豪",
    gameGinRummy: "ジン・ラミー",
    saysHearts: "ハートとスペードのクイーンを取らないようにします。3枚を渡し、マストフォローで進め、点の少ない人が勝ちです。",
    saysSpades: "向かい合ったパートナーと組んで、取るトリック数をビッドします。切り札はいつもスペードです。",
    saysEuchre: "手札は5枚。4人が2組に分かれ、切り札と同じ色のジャック2枚がいちばん強い札になります。",
    saysCribbage: "2枚をクリブに置き、31まで数えながら出し合い、そのあと15・ペア・ランを数えます。",
    saysOhHell: "取るトリック数をぴったり当てます。手札は1枚から7枚まで増え、ディーラーはビッドの合計をトリック数に合わせられません。",
    saysCrazyEights: "同じスートか同じ数字の札を出します。8はいつでも出せて、次のスートを指定できます。",
    saysGoFish: "相手に数字を聞いて札をもらい、同じ数字4枚のブックを集めます。相手が持っていなければ山から1枚引きます。",
    saysBigTwo: "場の札より強い札を、1枚・ペア・スリーカード・5枚の役で出します。いちばん強いのは2です。",
    saysPresident: "最初に手札をなくした人が大富豪です。最後になった人は、いちばん強い札を渡します。",
    saysGinRummy: "引いて捨てながらセットとランを作り、デッドウッドが少なくなったらノックします。",
    suitS: "スペード",
    suitH: "ハート",
    suitD: "ダイヤ",
    suitC: "クラブ",
    rank1: "エース",
    rank11: "ジャック",
    rank12: "クイーン",
    rank13: "キング",
    cardName: "{suit}の{rank}",
    offerPlay: "{cards}を出す",
    offerPlaySuit: "{cards}を出して{suit}を指定する",
    offerPassCards: "{cards}を渡す",
    offerPass: "パスする",
    offerCrib: "{cards}をクリブに置く",
    offerGive: "{cards}を渡す",
    offerDraw: "山札から引く",
    offerTakeDiscard: "捨て札を取る",
    offerDiscard: "{cards}を捨てる",
    offerKnock: "{cards}を捨ててノックする",
    offerOrder: "この札を切り札にする",
    offerCall: "{suit}を切り札にする",
    offerBid: "{n}とビッドする",
    offerBidNil: "ニルをビッドする",
    offerAsk: "{player}に{rank}を聞く",
    didPlay: "{cards}を出しました",
    didPlaySuit: "{cards}を出して{suit}を指定しました",
    didPassCards: "{cards}を渡しました",
    didPass: "パスしました",
    didCrib: "{cards}をクリブに置きました",
    didGive: "{cards}を渡しました",
    didDraw: "山札から引きました",
    didTakeDiscard: "捨て札を取りました",
    didDiscard: "{cards}を捨てました",
    didKnock: "{cards}を捨ててノックしました",
    didOrder: "表の札を切り札にしました",
    didCall: "{suit}を切り札にしました",
    didBid: "{n}とビッドしました",
    didBidNil: "ニルをビッドしました",
    didAsk: "{player}に{rank}を聞きました",
    hidPassCards: "カードを{n}枚渡しました",
    hidCrib: "クリブにカードを{n}枚置きました",
    hidGive: "カードを{n}枚渡しました",
    recordHead: "{game}（{n}人）、シード {seed}: {players}",
    recordOver: "終了。勝者: {players}",
    recordGoing: "進行中。次は{player}の番です。",
    listJoin: "、",
    seatName: "席{n}",
    cliUsage: `使い方: toranpu <コマンド> [オプション]

トランプ1組と10種類のカードゲームです。配り方はシードで決まります。

  toranpu games                     10種類のゲームと、遊べる人数
  toranpu deal --seed 42            シードでシャッフルして13枚ずつ4人に配ります
  toranpu deal -n 2 -e 5 -s 42      5枚ずつ2人に配り、残りも表示します
  toranpu deal hearts --seed 42     そのゲームの最初の配り方を席ごとに表示します
  toranpu play euchre --seed 42     コンピュータ同士で1ゲーム行い、勝者を表示します
  toranpu play hearts -s 42 --text  同じゲームを、すべての手を言葉で表示します
  toranpu check saved.json          保存したゲームかどうか確かめます（--stdin も可）

オプション:
  -s, --seed <n>       1以上の整数。同じシードなら同じ札が配られます
  -p, --players <n>    人数（指定しなければ、そのゲームのふつうの人数）
      --size <n>       ゲームの長さ（ゲームごとの単位。games で確認できます）
  -n, --hands <n>      deal: 何人に配るか（指定しなければ4）
  -e, --each <n>       deal: 1人あたりの枚数（指定しなければ全部配ります）
      --text           play: すべての手を言葉で表示します
  -j, --json           JSON で出力します（形式 1）
      --csv            CSV で出力します
      --stdin          check: 保存したゲームを標準入力から読みます
      --lang <en|ja>   英語または日本語（既定はシステムの言語）
      --no-color       色を付けません（NO_COLOR にも従います）
  -h, --help           このヘルプ
  -v, --version        バージョン

シードを指定しない場合は新しく選び、同じ結果を再現できるよう標準エラーに
表示します。終了コード: 0 完了、1 指定された内容を実行できなかった
（保存したゲームではなかった）、2 コマンドの誤り。
`,
    cliUnknown: "不明なオプションです: {part}",
    cliNeeds: "{part} には値が必要です",
    cliTryHelp: "`toranpu --help` をご覧ください。",
    cliNoCommand: "「{part}」というコマンドはありません。games、deal、play、check があります",
    cliNoGame: "「{part}」というゲームはありません。`toranpu games` で一覧を表示します",
    cliSeedBad: "--seed は1〜2147483647の整数です",
    cliPlayersBad: "{game}は{fewest}〜{most}人で遊びます",
    cliSizeBad: "{game}の長さは次のどれかです: {sizes}",
    cliHandsBad: "札は52枚です。{each}枚ずつ{hands}人には配れません",
    cliLangBad: "--lang は en か ja です",
    cliBoth: "--json と --csv は同時に使えません",
    cliFresh: "シード {seed}（--seed {seed} で同じ結果を再現できます）",
    cliGameLine: "{name}（{players}人、{sizes}）: {says}",
    cliHand: "{name}: {cards}",
    cliRest: "残り: {cards}",
    cliTurned: "表にした札: {cards}",
    cliNoSave: "確かめる保存データがありません。ファイル名を指定するか、--stdin で渡してください",
    cliNotSaved: "保存したゲームではありません。ルールどおりに再現できません",
    cliSavedOver: "{game}（{n}人）、シード {seed}、{moves}手。終了: 勝者は{players}",
    cliSavedGoing: "{game}（{n}人）、シード {seed}、{moves}手。進行中: 次は{player}の番です",
    cliPlayed: "{game}（{n}人）、シード {seed}: {moves}手。勝者は{players}",
    cliScores: "得点: {scores}",
    pagePitch: "トランプ1組と、コンピュータと遊べる10種類のカードゲームです。ゲームを選んで、1回遊んでみてください。",
    pageName: "「トランプ」は、プレイングカードを指すふだんの日本語です。",
    pageNameLink: "名前について（英語）",
    pageFoot: "配り方はすべてシードで決まるので、シードを伝えれば同じ配り方になります。データはこの端末の外に出ません。",
    pageChoose: "ゲームを選ぶ",
    pagePlayers: "人数",
    pageSeed: "シード",
    pageDeal: "配る",
    pageYourHand: "あなたの手札",
    pageYou: "あなた",
    pageComputer: "コンピュータ",
    pageCards: "{n}枚",
    pageScore: "{n}点",
    pageBid: "ビッド {n}",
    pageTricks: "{n}トリック",
    pageBooks: "ブック {n}",
    pageTrick: "トリック",
    pageLastTrick: "前のトリック（{player}が取りました）",
    pageToBeat: "場の札（{player}）",
    pageCount: "カウント {n}",
    pageDiscard: "捨て札",
    pageSuitToFollow: "出せるスート",
    pageTurnedUp: "表にした札",
    pageTrump: "切り札",
    pageStarter: "スターター",
    pageStock: "山札 {n}枚",
    pageThinking: "{player}が考えています…",
    pageYourTurn: "あなたの番です。",
    pageYourTurnPick: "あなたの番です。札を選んでから、することを選んでください。",
    pageYourTurnPass: "あなたの番です。渡す札を{n}枚選んでください。",
    pageYourTurnCrib: "あなたの番です。クリブに置く札を2枚選んでください。",
    pageYourTurnGive: "あなたの番です。渡す札を{n}枚選んでください。",
    pageOver: "ゲーム終了。勝者: {players}",
    pageLog: "これまでの流れ",
    pageLogStart: "{game}（{n}人）、シード {seed}。",
    pageRules: "ルール（英語）",
    pageDeck: "トランプだけを使う",
    pageDeckNote: "52枚をシードでシャッフルし、1枚ずつ順番に配ります。同じシードなら、いつも同じ順番になります。",
    pageShuffle: "シャッフル",
    pageHands: "人数",
    pageEach: "1人あたりの枚数",
    pageSeatAfter: "席ごとの間隔",
    pageMs: "{n}ミリ秒",
    pageDeckCode: "52枚を1行で表したもの（1文字が1枚）",
    pageLeft: "残り {n}枚",
    pageKeep: "このゲームを保存する、読み込む",
    pageKeepNote: "ゲームは、卓とシードと手の記録だけでできています。読み込むときは、すべての手をもう一度ルールどおりに進めるので、書き換えられたデータは受け付けません。",
    pageAsCode: "コード",
    pageAsJson: "JSON",
    pageAsText: "テキスト",
    pageAsCsv: "CSV",
    pageCopy: "コピー",
    pageCopied: "コピーしました",
    pageCopyFailed: "選択してコピーしてください",
    pagePaste: "ゲームを読み込む",
    pagePasteHint: "ゲームのコードか JSON を貼り付けます",
    pageRead: "読み込む",
    pageReadBad: "保存したゲームではありません。ルールどおりに再現できません。",
    pageApi: "API（英語）",
    pageApiIntro: "すべてのエントリーポイントのすべてのエクスポートを、シグネチャとドキュメントコメント付きで一覧にしています。サイトをビルドするときにソースから作ります。",
    pageBack: "卓に戻る",
    pageDeckSeed: "デッキのシード",
    pageToPlay: "{player}の番です。",
    pageSound: "音",
    pageSounds: "カードの音",
    pageSoundsNote: "本物のカードを録音した音です。卓が求めたときだけ鳴ります。押すと聞けます。「配る」の横の「音」をオンにすると、ゲームの進行に合わせて卓で鳴ります。",
    pageSoundShuffle: "シャッフル",
    pageSoundDeal: "配る",
    pageSoundFlip: "めくる",
    pageSoundPlay: "札を出す",
    pageSoundGather: "集める",
    pageSoundFan: "広げる",
    pageBacks: "カードの裏面",
    pageBacksNote: "どのカードゲームでも使える、Toranpu のために描いた3種類の裏面です。クラシックの赤、クラシックの青、墨に水玉。色を変えたり、中央に文字を入れたりできます。",
    pageBackClassicRed: "クラシック・赤",
    pageBackClassicBlue: "クラシック・青",
    pageBackInkDots: "墨に水玉",
    pageBackColour: "色",
    pageBackOwnColour: "元の色",
    pageBackMark: "中央の文字",
    cardRedJoker: "赤のジョーカー",
    cardBlackJoker: "黒のジョーカー",
    cardRulesHearts: "ルールカード（ハーツ）",
    cardRulesSpades: "ルールカード（スペード）",
    cardBlank: "白紙のカード",
    rulesHeartsTitle: "ハーツ",
    rulesHearts: "3枚渡してから始める\n同じスートを出す\nハート1枚：1点\nスペードのQ：13点\n点が少ない人の勝ち",
    rulesSpadesTitle: "スペード",
    rulesSpades: "取るトリック数を宣言\n同じスートを出す\nスペードは常に切り札\n宣言どおり：1トリック10点\n足りなければ宣言分を失う",
    pageDesigns: "カードのデザイン",
    pageDesignsNote: "「シンプル」は Toranpu のために描いた標準のデザインです。「4色」はダイヤを青、クラブを緑にします。「イングリッシュ・パターン」は伝統的なデッキで、キング・クイーン・ジャックは Dmitry Fomin が描き、パブリックドメインとして公開したものです。「リアル」は Byron Knoll がパブリックドメインとして公開したデッキで、キング・クイーン・ジャックは Fomin のものです。",
    pageDesignPlain: "シンプル",
    pageDesignFourColour: "4色",
    pageDesignEnglish: "イングリッシュ・パターン",
    pageDesignRealistic: "リアル",
    cardFaceDown: "伏せたカード",
    cardMarked: "{card}（印つき）",
    pageOneCard: "どのページにもカードを1枚",
    pageOneCardNote: "上で選んだデザインと裏面のカードを、要素として置けます。タップすると裏返ります。このサイト上のアドレスやデータ URL で、画像としても使えます。",
    pageCardPick: "カード",
    pageAsElement: "要素として",
    pageAsPicture: "画像として",
    handLabel: "手札：{cards}",
    handFaceDown: "伏せた手札（{n}枚）",
    handScrunched: "伏せてまとめた手札",
    handSquared: "まとめた手札（いちばん上は{card}）",
    pageHide: "手札の操作",
    pageHideNote: "手札をその場で動かします。全部いっぺんに、または1枚ずつ伏せたり、選んだカードだけ裏返したりできます。枚数のわからない束にまとめたり、1枚を抜き出して見せたりもできます。並べ替え、まとめ方、混ぜる、捨てる、入れ替える、そして伏せたカードを追えるように印をつけることもできます。",
    pageHideAll: "伏せる",
    pageHideOneByOne: "1枚ずつ伏せる",
    pageShowHand: "表にする",
    pageScrunch: "まとめる",
    pageSpread: "広げる",
    pageMix: "混ぜる",
    pageToss: "1枚捨てる",
    pageReplace: "1枚入れ替える",
    pageLands: "新しいカード",
    pageAtEnd: "最後に",
    pageAtFront: "先頭に",
    pageSort: "並べ替え",
    pageGroup: "スートごと",
    pageUnsort: "配られた順",
    pageNewHand: "別の手札",
    pageRowTurn: "裏表",
    pageRowGather: "まとめる",
    pageRowOrder: "並び",
    pageRowChange: "入れ替え",
    pageRowMark: "印と回転",
    pageWhichCard: "カード",
    pageToggle: "裏返す",
    pageToggleAll: "全部裏返す",
    pagePart: "抜き出す",
    pageUnpart: "戻す",
    pageGroupFace: "数札と絵札",
    pageMark: "印をつける",
    pageUnmark: "印を消す",
    pageSpin: "回す",
    pageSpinAll: "全部回す",
    pageClockwise: "右回り",
    pageAnticlockwise: "左回り",
    pageReveal: "タップで開く手札",
    pageRevealNote: "手札はそろえて置かれ、いちばん上のカードだけが見え、ほかは一部が隠れています。タップすると扇形に開き、もう一度タップすると閉じます。",
    pageClosed: "閉じ具合",
    pileFaceDown: "伏せた山（{n}枚）",
    pileFaceUp: "{n}枚の山、いちばん上は{card}",
    pileEmpty: "空の山",
    pagePiles: "乱れた山",
    pagePilesNote: "引くための山札と捨て札です。いちばん上の下にあるカードが重なって見え、きれいにそろった状態からひどく乱れた状態まで選べます。シードが同じなら山はいつも同じ見た目です。1枚引くと、変わるのはいちばん上だけです。",
    pageMessiness: "乱れ具合",
    pageTablePanel: "テーブルごとページに",
    pageTablePanelNote: "どのゲームも1行で遊べる状態で置けます。席、手札、出せる手、山札と捨て札、残りの席はコンピューター。テーブルの色は上の見本、カードと乱れ具合は上の選択に従います。",
    pageTableGame: "ゲーム",
    pagePileSeed: "山のシード",
    pageDrawCard: "1枚引く",
    pageStockPile: "山札",
    embedTurn: "裏返す",
    embedBad: "カードとして読めません。AS KH 10D のように（JOKER、RULES、BLANK も使えます）、またはデッキの1文字のコードで書いてください。1つの手札にはジョーカー4枚、ルールカード2枚、白紙2枚までです。",
    pageEmbed: "手札を埋め込む",
    pageEmbedNote: "どんな手札でも、どのウェブページにも置けます。カードのコードで書き、大きさを選んで、どちらかをコピーしてください。iframe ならページにスクリプトは要りません。タグならスクリプトを1行加えます。",
    pageEmbedCards: "カード",
    pageEmbedSize: "大きさ",
    pageSizeSmall: "小",
    pageSizeMedium: "中",
    pageSizeLarge: "大",
    pageAsFrame: "iframe で",
    pageAsTag: "タグ1つで",
  },
};

/** Put values into a string's braces: `fillIn("Bid {n}", { n: 3 })` is "Bid 3". A brace with no value is left as it is. */
export function fillIn(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, name: string) => (name in values ? String(values[name]) : whole));
}

/** The language a tag such as `ja-JP` or `en_US.UTF-8` names: Japanese for anything that starts `ja`, English otherwise. */
export function languageOf(tag: string | null | undefined): Language {
  return String(tag ?? "").toLowerCase().startsWith("ja") ? "ja" : "en";
}
