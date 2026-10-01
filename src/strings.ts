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
