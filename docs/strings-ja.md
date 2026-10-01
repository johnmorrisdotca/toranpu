# Toranpu's words, in English and Japanese

Made from `src/strings.ts` by `pnpm docs:make`; a test fails if the two differ, so this list is never out of date.

**The Japanese has not yet been reviewed by a native reader.** If a line reads wrongly or unnaturally, please
open a *Fix a translation* issue with the string's name. `{n}` and the other braces are filled in when shown.

Names that begin `game` and `says` are the games; `suit`, `rank` and `cardName` are the cards; `offer`, `did` and
`hid` are a move in words (on a button, in a record, and as the rest of the table saw it); `record` is a record of
a game; `cli` is the command line; `page` is the demo.

| Name | English | Japanese |
| --- | --- | --- |
| `gameHearts` | Hearts | ハーツ |
| `gameSpades` | Spades | スペード |
| `gameEuchre` | Euchre | ユーカー |
| `gameCribbage` | Cribbage | クリベッジ |
| `gameOhHell` | Oh Hell | オー・ヘル |
| `gameCrazyEights` | Crazy Eights | クレイジーエイト |
| `gameGoFish` | Go Fish | ゴーフィッシュ |
| `gameBigTwo` | Big Two | ビッグツー |
| `gamePresident` | President | 大富豪 |
| `gameGinRummy` | Gin Rummy | ジン・ラミー |
| `saysHearts` | Avoid hearts and the queen of spades. Pass three cards, follow suit, lowest score wins. | ハートとスペードのクイーンを取らないようにします。3枚を渡し、マストフォローで進め、点の少ない人が勝ちです。 |
| `saysSpades` | Partners across the table bid tricks together. Spades are always trumps. | 向かい合ったパートナーと組んで、取るトリック数をビッドします。切り札はいつもスペードです。 |
| `saysEuchre` | Five cards, four players in partnerships, and the jacks of trumps' colour on top. | 手札は5枚。4人が2組に分かれ、切り札と同じ色のジャック2枚がいちばん強い札になります。 |
| `saysCribbage` | Lay two to the crib, peg to thirty-one, then count fifteens, pairs and runs. | 2枚をクリブに置き、31まで数えながら出し合い、そのあと15・ペア・ランを数えます。 |
| `saysOhHell` | Bid exactly how many tricks you will take. The hands grow from one card to seven, and the dealer may not make the bids add up. | 取るトリック数をぴったり当てます。手札は1枚から7枚まで増え、ディーラーはビッドの合計をトリック数に合わせられません。 |
| `saysCrazyEights` | Match the suit or the rank. Eights are wild and name the next suit. | 同じスートか同じ数字の札を出します。8はいつでも出せて、次のスートを指定できます。 |
| `saysGoFish` | Ask a player for a rank. Collect books of four. Go fish when they have none. | 相手に数字を聞いて札をもらい、同じ数字4枚のブックを集めます。相手が持っていなければ山から1枚引きます。 |
| `saysBigTwo` | Beat the cards on the table with singles, pairs, triples or five-card hands. Twos are high. | 場の札より強い札を、1枚・ペア・スリーカード・5枚の役で出します。いちばん強いのは2です。 |
| `saysPresident` | Shed your cards first to become President. The last out hands over their best cards. | 最初に手札をなくした人が大富豪です。最後になった人は、いちばん強い札を渡します。 |
| `saysGinRummy` | Draw and discard to make sets and runs, then knock when your deadwood is low. | 引いて捨てながらセットとランを作り、デッドウッドが少なくなったらノックします。 |
| `suitS` | spades | スペード |
| `suitH` | hearts | ハート |
| `suitD` | diamonds | ダイヤ |
| `suitC` | clubs | クラブ |
| `rank1` | ace | エース |
| `rank11` | jack | ジャック |
| `rank12` | queen | クイーン |
| `rank13` | king | キング |
| `cardName` | {rank} of {suit} | {suit}の{rank} |
| `offerPlay` | Play {cards} | {cards}を出す |
| `offerPlaySuit` | Play {cards}, calling {suit} | {cards}を出して{suit}を指定する |
| `offerPassCards` | Pass {cards} | {cards}を渡す |
| `offerPass` | Pass | パスする |
| `offerCrib` | Lay {cards} in the crib | {cards}をクリブに置く |
| `offerGive` | Give {cards} | {cards}を渡す |
| `offerDraw` | Draw | 山札から引く |
| `offerTakeDiscard` | Take the discard | 捨て札を取る |
| `offerDiscard` | Discard {cards} | {cards}を捨てる |
| `offerKnock` | Knock, discarding {cards} | {cards}を捨ててノックする |
| `offerOrder` | Order it up | この札を切り札にする |
| `offerCall` | Call {suit} | {suit}を切り札にする |
| `offerBid` | Bid {n} | {n}とビッドする |
| `offerBidNil` | Bid nil | ニルをビッドする |
| `offerAsk` | Ask {player} for {rank} | {player}に{rank}を聞く |
| `didPlay` | plays {cards} | {cards}を出しました |
| `didPlaySuit` | plays {cards}, calling {suit} | {cards}を出して{suit}を指定しました |
| `didPassCards` | passes {cards} | {cards}を渡しました |
| `didPass` | passes | パスしました |
| `didCrib` | lays {cards} in the crib | {cards}をクリブに置きました |
| `didGive` | gives {cards} | {cards}を渡しました |
| `didDraw` | draws | 山札から引きました |
| `didTakeDiscard` | takes the discard | 捨て札を取りました |
| `didDiscard` | discards {cards} | {cards}を捨てました |
| `didKnock` | knocks, discarding {cards} | {cards}を捨ててノックしました |
| `didOrder` | orders it up | 表の札を切り札にしました |
| `didCall` | calls {suit} | {suit}を切り札にしました |
| `didBid` | bids {n} | {n}とビッドしました |
| `didBidNil` | bids nil | ニルをビッドしました |
| `didAsk` | asks {player} for {rank} | {player}に{rank}を聞きました |
| `hidPassCards` | passes cards: {n} | カードを{n}枚渡しました |
| `hidCrib` | lays cards in the crib: {n} | クリブにカードを{n}枚置きました |
| `hidGive` | gives cards: {n} | カードを{n}枚渡しました |
| `recordHead` | {game} for {n}, seed {seed}: {players} | {game}（{n}人）、シード {seed}: {players} |
| `recordOver` | Over. Won by {players}. | 終了。勝者: {players} |
| `recordGoing` | Not over. {player} to play. | 進行中。次は{player}の番です。 |
| `listJoin` | ,  | 、 |
| `seatName` | Seat {n} | 席{n} |
| `cliUnknown` | unknown option {part} | 不明なオプションです: {part} |
| `cliNeeds` | {part} needs a value | {part} には値が必要です |
| `cliTryHelp` | Try `toranpu --help`. | `toranpu --help` をご覧ください。 |
| `cliNoCommand` | “{part}” is not a command. There are games, deal, play and check | 「{part}」というコマンドはありません。games、deal、play、check があります |
| `cliNoGame` | no game is called “{part}”. `toranpu games` lists them | 「{part}」というゲームはありません。`toranpu games` で一覧を表示します |
| `cliSeedBad` | --seed takes a whole number from 1 to 2147483647 | --seed は1〜2147483647の整数です |
| `cliPlayersBad` | {game} is played by {fewest} to {most} | {game}は{fewest}〜{most}人で遊びます |
| `cliSizeBad` | {game} is played to one of: {sizes} | {game}の長さは次のどれかです: {sizes} |
| `cliHandsBad` | there are 52 cards: {hands} hands of {each} cannot be dealt | 札は52枚です。{each}枚ずつ{hands}人には配れません |
| `cliLangBad` | --lang takes en or ja | --lang は en か ja です |
| `cliBoth` | --json and --csv are one or the other | --json と --csv は同時に使えません |
| `cliFresh` | seed {seed} (pass --seed {seed} to repeat this) | シード {seed}（--seed {seed} で同じ結果を再現できます） |
| `cliGameLine` | {name} ({players} players; {sizes}): {says} | {name}（{players}人、{sizes}）: {says} |
| `cliHand` | {name}: {cards} | {name}: {cards} |
| `cliRest` | Left: {cards} | 残り: {cards} |
| `cliTurned` | Turned up: {cards} | 表にした札: {cards} |
| `cliNoSave` | there is no saved game to check: name a file, or pipe one in with --stdin | 確かめる保存データがありません。ファイル名を指定するか、--stdin で渡してください |
| `cliNotSaved` | that is not a saved game: the rules cannot play it out | 保存したゲームではありません。ルールどおりに再現できません |
| `cliSavedOver` | {game} for {n}, seed {seed}, {moves} moves. Over: won by {players}. | {game}（{n}人）、シード {seed}、{moves}手。終了: 勝者は{players} |
| `cliSavedGoing` | {game} for {n}, seed {seed}, {moves} moves. Not over: {player} to play. | {game}（{n}人）、シード {seed}、{moves}手。進行中: 次は{player}の番です |
| `cliPlayed` | {game} for {n}, seed {seed}: {moves} moves. Won by {players}. | {game}（{n}人）、シード {seed}: {moves}手。勝者は{players} |
| `cliScores` | Scores: {scores} | 得点: {scores} |
| `pagePitch` | A deck of playing cards and ten card games, each with a computer player. Pick a game and play a hand. | トランプ1組と、コンピュータと遊べる10種類のカードゲームです。ゲームを選んで、1回遊んでみてください。 |
| `pageName` | Toranpu is the everyday Japanese word for a deck of playing cards. | 「トランプ」は、プレイングカードを指すふだんの日本語です。 |
| `pageNameLink` | About the name | 名前について（英語） |
| `pageFoot` | Every deal here comes from its seed, so a seed can be shared. Nothing leaves this device. | 配り方はすべてシードで決まるので、シードを伝えれば同じ配り方になります。データはこの端末の外に出ません。 |
| `pageChoose` | Choose a game | ゲームを選ぶ |
| `pagePlayers` | Players | 人数 |
| `pageSeed` | Seed | シード |
| `pageDeal` | Deal | 配る |
| `pageYourHand` | Your hand | あなたの手札 |
| `pageYou` | You | あなた |
| `pageComputer` | computer | コンピュータ |
| `pageCards` | cards: {n} | {n}枚 |
| `pageScore` | score {n} | {n}点 |
| `pageBid` | bid {n} | ビッド {n} |
| `pageTricks` | tricks: {n} | {n}トリック |
| `pageBooks` | books: {n} | ブック {n} |
| `pageTrick` | Trick | トリック |
| `pageLastTrick` | Last trick, taken by {player} | 前のトリック（{player}が取りました） |
| `pageToBeat` | To beat ({player}) | 場の札（{player}） |
| `pageCount` | Count {n} | カウント {n} |
| `pageDiscard` | Discard | 捨て札 |
| `pageSuitToFollow` | Suit to follow | 出せるスート |
| `pageTurnedUp` | Turned up | 表にした札 |
| `pageTrump` | Trumps | 切り札 |
| `pageStarter` | Starter | スターター |
| `pageStock` | Stock: {n} | 山札 {n}枚 |
| `pageThinking` | {player} is thinking… | {player}が考えています… |
| `pageYourTurn` | Your turn. | あなたの番です。 |
| `pageYourTurnPick` | Your turn: pick a card, then choose what to do. | あなたの番です。札を選んでから、することを選んでください。 |
| `pageYourTurnPass` | Your turn: pick {n} cards to pass. | あなたの番です。渡す札を{n}枚選んでください。 |
| `pageYourTurnCrib` | Your turn: pick two cards for the crib. | あなたの番です。クリブに置く札を2枚選んでください。 |
| `pageYourTurnGive` | Your turn: pick cards to give: {n}. | あなたの番です。渡す札を{n}枚選んでください。 |
| `pageOver` | Game over. Won by {players}. | ゲーム終了。勝者: {players} |
| `pageLog` | What happened | これまでの流れ |
| `pageLogStart` | {game} for {n}, seed {seed}. | {game}（{n}人）、シード {seed}。 |
| `pageRules` | The rules | ルール（英語） |
| `pageDeck` | The deck on its own | トランプだけを使う |
| `pageDeckNote` | Fifty-two cards, shuffled from the seed and dealt one at a time round the table. The same seed always gives this order. | 52枚をシードでシャッフルし、1枚ずつ順番に配ります。同じシードなら、いつも同じ順番になります。 |
| `pageShuffle` | Shuffle | シャッフル |
| `pageHands` | Hands | 人数 |
| `pageEach` | Cards each | 1人あたりの枚数 |
| `pageDeckCode` | The whole deck as one line, a letter a card | 52枚を1行で表したもの（1文字が1枚） |
| `pageLeft` | Left over: {n} | 残り {n}枚 |
| `pageKeep` | Keep this game, and read one back | このゲームを保存する、読み込む |
| `pageKeepNote` | A game is its table, its seed and its moves, and nothing else. Read back, every move is played through the rules again, so a changed save is refused. | ゲームは、卓とシードと手の記録だけでできています。読み込むときは、すべての手をもう一度ルールどおりに進めるので、書き換えられたデータは受け付けません。 |
| `pageAsCode` | Code | コード |
| `pageAsJson` | JSON | JSON |
| `pageAsText` | Text | テキスト |
| `pageAsCsv` | CSV | CSV |
| `pageCopy` | Copy | コピー |
| `pageCopied` | Copied | コピーしました |
| `pageCopyFailed` | Select it and copy | 選択してコピーしてください |
| `pagePaste` | Read a game back | ゲームを読み込む |
| `pagePasteHint` | Paste a game's code or its JSON | ゲームのコードか JSON を貼り付けます |
| `pageRead` | Read | 読み込む |
| `pageReadBad` | That is not a saved game: the rules cannot play it out. | 保存したゲームではありません。ルールどおりに再現できません。 |
| `pageApi` | API reference | API（英語） |
| `pageApiIntro` | Every export of every entry point, with its signature and its doc comment. Made from the source when the site is built. | すべてのエントリーポイントのすべてのエクスポートを、シグネチャとドキュメントコメント付きで一覧にしています。サイトをビルドするときにソースから作ります。 |
| `pageBack` | Back to the table | 卓に戻る |
| `pageDeckSeed` | Deck seed | デッキのシード |
| `pageToPlay` | {player} to play. | {player}の番です。 |
| `pageSound` | Sound | 音 |
| `pageSounds` | Card sounds | カードの音 |
| `pageSoundsNote` | Recordings of real cards, made only when a table asks for one. Tap a sound to hear it. Sound, by the Deal button, plays them at the table as the game goes. | 本物のカードを録音した音です。卓が求めたときだけ鳴ります。押すと聞けます。「配る」の横の「音」をオンにすると、ゲームの進行に合わせて卓で鳴ります。 |
| `pageSoundShuffle` | Shuffle | シャッフル |
| `pageSoundDeal` | Deal | 配る |
| `pageSoundFlip` | Turn over | めくる |
| `pageSoundPlay` | Play a card | 札を出す |
| `pageSoundGather` | Gather | 集める |
| `pageSoundFan` | Fan | 広げる |
| `pageBacks` | Card backs | カードの裏面 |
| `pageBacksNote` | Three backs drawn for Toranpu, for any card game: a classic red, a classic blue and ink with dots. Give one your own colour or a word in its middle. | どのカードゲームでも使える、Toranpu のために描いた3種類の裏面です。クラシックの赤、クラシックの青、墨に水玉。色を変えたり、中央に文字を入れたりできます。 |
| `pageBackClassicRed` | Classic red | クラシック・赤 |
| `pageBackClassicBlue` | Classic blue | クラシック・青 |
| `pageBackInkDots` | Ink with dots | 墨に水玉 |
| `pageBackColour` | Colour | 色 |
| `pageBackOwnColour` | Its own colour | 元の色 |
| `pageBackMark` | Words in the middle | 中央の文字 |
| `cardRedJoker` | red joker | 赤のジョーカー |
| `cardBlackJoker` | black joker | 黒のジョーカー |
| `pageDesigns` | Card designs | カードのデザイン |
| `pageDesignsNote` | Plain is drawn for Toranpu and is the default. Four colour makes diamonds blue and clubs green. The English pattern is the traditional deck, its kings, queens and jacks drawn by Dmitry Fomin and given to the public domain. | 「シンプル」は Toranpu のために描いた標準のデザインです。「4色」はダイヤを青、クラブを緑にします。「イングリッシュ・パターン」は伝統的なデッキで、キング・クイーン・ジャックは Dmitry Fomin が描き、パブリックドメインとして公開したものです。 |
| `pageDesignPlain` | Plain | シンプル |
| `pageDesignFourColour` | Four colour | 4色 |
| `pageDesignEnglish` | English pattern | イングリッシュ・パターン |
| `cardFaceDown` | a card, face down | 伏せたカード |
| `pageOneCard` | One card on any page | どのページにもカードを1枚 |
| `pageOneCardNote` | A card as an element, in the design and back chosen above: tap it to turn it over. Or as a picture, by its address on this site or as a data URL. | 上で選んだデザインと裏面のカードを、要素として置けます。タップすると裏返ります。このサイト上のアドレスやデータ URL で、画像としても使えます。 |
| `pageCardPick` | Card | カード |
| `pageAsElement` | As an element | 要素として |
| `pageAsPicture` | As a picture | 画像として |
| `handLabel` | Hand: {cards} | 手札：{cards} |
| `handFaceDown` | a hand of {n} cards, face down | 伏せた手札（{n}枚） |
| `handScrunched` | a hand of cards, squared up face down | 伏せてまとめた手札 |
| `pageHide` | Hide a hand | 手札を隠す |
| `pageHideNote` | Turn a hand face down where it lies, all at once or one card after another, and back. Scrunch squares it into one face-down bundle, so neither the cards nor how many there are can be read. | 手札をその場で伏せます。全部いっぺんにも、1枚ずつにもできます。表に戻すこともできます。「まとめる」は手札を伏せて1つの束にし、カードも枚数もわからないようにします。 |
| `pageHideAll` | Face down | 伏せる |
| `pageHideOneByOne` | One by one | 1枚ずつ伏せる |
| `pageShowHand` | Face up | 表にする |
| `pageScrunch` | Scrunch | まとめる |
| `pageSpread` | Spread out | 広げる |
| `pageNewHand` | Another hand | 別の手札 |
| `pageReveal` | A closed hand that opens with a tap | タップで開く手札 |
| `pageRevealNote` | The hand lies squared up, only its top card showing and the rest partly hidden. Tap it to open it into a fan, and again to close it. | 手札はそろえて置かれ、いちばん上のカードだけが見え、ほかは一部が隠れています。タップすると扇形に開き、もう一度タップすると閉じます。 |
| `pageClosed` | How closed | 閉じ具合 |

## The command line's help

`cliUsage`, in English:

```
Usage: toranpu <command> [options]

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
```

and in Japanese:

```
使い方: toranpu <コマンド> [オプション]

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
```
