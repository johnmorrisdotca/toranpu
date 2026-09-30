# The ten games, as Toranpu plays them

Every card game is played a little differently from one table to the next.
This page says which rules Toranpu plays, in our own words, so that you know
what your players will meet. Each game links to John McLeod's account of it at
[pagat.com](https://www.pagat.com), which describes the variations as well;
where a table often does otherwise, "Tables differ" says so.

The rules were last checked against those pages on 2026-09-30. A test
(`src/docs.test.js`) holds the figures on this page to the code.

Throughout: the deal is one card at a time round the table, play goes to the
left, and "size" is how long a game lasts, which you choose when you start it
(`CARD_GAME_TABLES`).

## Hearts

**Three or four players, each for themselves. Size: the score that ends the
game, 50 or 100. The lowest score wins.**

- **The deal.** Four players get thirteen cards each. Three get seventeen,
  with the two of diamonds left out of the pack.
- **The pass.** Before play, each player passes three cards: to the left on
  the first deal, to the right on the second, across on the third, and on the
  fourth nobody passes. Then round again. With three players it is left,
  right, none.
- **The play.** Whoever holds the two of clubs leads it. Follow suit if you
  can; if you cannot, play anything. The highest card of the suit led takes
  the trick, ace high, and its winner leads the next. There are no trumps.
- **Two restraints.** No heart and no queen of spades may be played to the
  first trick, unless your hand is nothing else. Hearts may not be led until
  one has been played ("broken"), unless you hold nothing else.
- **The score.** Each heart taken is one point and the queen of spades is
  thirteen: twenty-six in a deal. Take all twenty-six and you have shot the
  moon: you score nothing and everybody else scores twenty-six.
- **The end.** When a score reaches the size, the lowest score wins. Players
  level on the lowest share the win.

**Tables differ** on the pass (some never hold), on whether points may fall on
the first trick, on what shooting the moon does (some take twenty-six off the
shooter instead), and on the jack of diamonds, which some count as minus ten.
Toranpu plays none of those.

Source: [pagat.com/reverse/hearts.html](https://www.pagat.com/reverse/hearts.html)

## Spades

**Four players in two partnerships, partners facing each other. Size: the
score that wins, 200, 300 or 500.**

- **The deal.** Thirteen cards each. The deal passes to the left each time.
- **The bidding.** From the dealer's left, each player in turn bids once: the
  number of tricks they expect to take, from one to thirteen, or **nil**, which
  is a promise to take none. A partnership's contract is its two bids added.
- **The play.** The dealer's left leads. Follow suit if you can; if you
  cannot, play anything. Spades are trumps: the highest spade takes the trick,
  or else the highest card of the suit led. Spades may not be led until one
  has been played on another suit, unless you hold nothing else.
- **The score.** A partnership that makes its contract scores ten points for
  each trick bid, and one for each trick over it. Each trick over is also a
  **bag**, and every tenth bag costs a hundred points. A partnership that
  falls short loses ten points for each trick bid.
- **Nil.** A nil bidder who takes no trick wins a hundred for the
  partnership; one who takes a trick loses a hundred. Tricks a failed nil took
  do not count towards the partner's contract, and do count as bags.
- **The end.** The first partnership to the size wins, or, if one sinks to
  minus the size, the other does. If the scores are level at that moment,
  another deal is played.

**Tables differ** on blind nil, on passing cards with a nil, and on minimum
bids. Toranpu plays none of those.

Source: [pagat.com/auctionwhist/spades.html](https://www.pagat.com/auctionwhist/spades.html)

## Euchre

**Four players in two partnerships, partners facing each other. Size: the
score that wins, 5 or 10.**

- **The cards.** Twenty-four: the nine to the ace of each suit.
- **The deal.** Five cards each, and the next card is turned face up. The deal
  passes to the left each time.
- **Making trumps.** From the dealer's left, each player in turn may **order
  up** the turned card, making its suit trumps, or pass. If it is ordered up,
  the dealer takes it into hand and throws one card away. If all four pass,
  the card is turned down, and each player in turn may name any other suit as
  trumps, or pass. The dealer, who speaks last, must name one ("stick the
  dealer").
- **The bowers.** In trumps the jack is the highest card (the right bower).
  Next is the other jack of the same colour (the left bower), which counts as
  a trump in every way and not as a card of its own suit. Then ace, king,
  queen, ten, nine.
- **The play.** The dealer's left leads. Follow suit if you can, the left
  bower being a trump; if you cannot, play anything. The highest trump takes
  the trick, or else the highest card of the suit led.
- **The score.** The partnership that made trumps scores one point for three
  or four tricks and two for all five. If it takes two or fewer it is
  **euchred**, and the other partnership scores two.

**Tables differ** on going alone, which many play and Toranpu does not: all
four play every hand. Without stick the dealer, a hand that everybody passes
twice is thrown in.

Source: [pagat.com/euchre/euchre.html](https://www.pagat.com/euchre/euchre.html)

## Cribbage

**Two players. Size: the score that wins, 61 or 121. Six-card cribbage.**

- **The deal.** Six cards each. Each player lays two away, face down, to the
  **crib**, which belongs to the dealer. Then the top of the pack is turned as
  the **starter**. If it is a jack, the dealer scores two ("his heels"). The
  deal alternates.
- **The pegging.** The non-dealer plays first. The players lay their cards in
  turn, adding up their values (an ace is one, a court card ten), and the
  count may not pass thirty-one. A player who cannot play says "go", and the
  other plays on while they can. The last to play scores one for the go, or
  two if the count is exactly thirty-one, and the count starts again from
  nought. The last card of all scores one.
- **Pegging scores.** Making the count fifteen scores two. Matching the rank
  of the card before scores two for a pair, six for three alike and twelve for
  four. Cards that make a run of three or more, in any order, score a point a
  card.
- **The show.** Each hand of four is counted with the starter as a fifth
  card: two for every combination that adds to fifteen, two for every pair, a
  point a card for every run of three or more, four for a hand all of one
  suit (five if the starter matches), and one for the jack of the starter's
  suit ("his nobs"). The non-dealer counts first, then the dealer, then the
  dealer counts the crib. The crib scores a flush only when all five cards are
  one suit.
- **The end.** The first to the size wins, at the moment they reach it, in
  the pegging or in the show.

**Tables differ** on muggins (taking points an opponent missed) and on
skunks; Toranpu counts every hand itself and plays neither.

Source: [pagat.com/adders/crib6.html](https://www.pagat.com/adders/crib6.html)

## Oh Hell

**Three or four players, each for themselves. Size: the number of deals, 7 or
13. The highest score wins.**

- **The deals.** The first deal is one card each, the second two, and so on
  up to seven. The short game stops there. The long game comes back down: six,
  five, and so on to one, thirteen deals in all. The deal passes to the left.
- **Trumps.** After each deal the next card is turned up, and its suit is
  trumps.
- **The bidding.** From the dealer's left, each player bids how many tricks
  they will take, from none to all of them. The dealer bids last, and may not
  make the bid that would bring the bids to the number of tricks there are
  ("the hook"): somebody has to miss.
- **The play.** The dealer's left leads. Follow suit if you can; if you
  cannot, play anything. The highest trump takes the trick, or else the
  highest card of the suit led, ace high.
- **The score.** Take exactly what you bid and score ten plus your bid. Take
  any other number and score nothing.
- **The end.** After the last deal the highest score wins; players level on
  it share the win.

**Tables differ** on almost everything here: how many cards, whether the hook
is played, and the scoring, of which this is the simplest.

Source: [pagat.com/exact/ohhell.html](https://www.pagat.com/exact/ohhell.html)

## Crazy Eights

**Two to seven players, each for themselves. Size: the score that wins, 50,
100 or 200.**

- **The deal.** Seven cards each for two players, five each for more. The
  rest is the stock, and its top card is turned up to start the discard pile.
  An eight turned up is put back under the stock and another turned. The
  first seat plays first in the first hand, and the start moves one seat to
  the left each hand.
- **The play.** On your turn, play one card that matches the top of the
  discard pile in suit or in rank.
- **Eights.** An eight may be played on anything, and whoever plays it names
  the suit the next player must follow.
- **Drawing.** If you cannot play, draw one card from the stock. If it can be
  played you may play it at once; otherwise your turn is over. You may not
  draw when you hold a card you could play.
- **The stock runs out.** The discards under the top card are shuffled to make
  a new stock. When there are none to shuffle, a player who cannot play
  passes, and if every player passes in turn the hand is **blocked**.
- **The score.** The first player out wins the hand and scores for the cards
  the others still hold: fifty for an eight, ten for a king, queen or jack,
  one for an ace, and the number for the rest. A blocked hand goes to
  whoever holds the fewest points, who scores what the others hold; players
  level on the fewest each score it.
- **The end.** The first to the size wins.

**Tables differ** on drawing (some draw until they can play) and on cards with
powers: twos that make the next player draw, queens that skip, aces that
reverse. Toranpu plays the plain game, with eights alone.

Source: [pagat.com/eights/crazy8s.html](https://www.pagat.com/eights/crazy8s.html)

## Go Fish

**Two to six players, each for themselves. One deal is the game. The most
books wins.**

- **The deal.** Seven cards each for two or three players, five each for
  four or more. The rest is the pond, face down.
- **Asking.** On your turn, ask one other player for a rank that you hold at
  least one card of. If they have any, they hand over every one, and you ask
  again, the same player or another.
- **Go fish.** If they have none, you draw the top card of the pond. If it is
  the rank you asked for, you show it and ask again. If not, your turn is
  over.
- **Books.** Four cards of one rank are a book, laid down at once.
- **Running out.** A player with no cards draws one from the pond when their
  turn comes. Once the pond is empty too, they sit out.
- **The end.** The game goes on until all thirteen books are down. The most
  books wins; players level on the most share the win.

**Tables differ** on the deal, on whether you must name a particular card
rather than a rank, and on when the game stops (some stop when the pond is
empty or a hand runs out).

Source: [pagat.com/quartet/gofish.html](https://www.pagat.com/quartet/gofish.html)

## Big Two

**Two to four players, each for themselves. Size: the number of deals, 1, 3
or 5. The fewest points wins.**

- **The cards.** The ranks run three, four, five, six, seven, eight, nine,
  ten, jack, queen, king, ace, two: the two is the highest. Between cards of
  one rank the suits run diamonds (lowest), clubs, hearts, spades. So the
  three of diamonds is the lowest card and the two of spades the highest.
- **The deal.** Thirteen cards each. With three players it is seventeen each,
  and the last card goes to whoever holds the three of diamonds.
- **The first play.** Whoever holds the lowest card dealt leads, and that
  first play must include it.
- **What may be played.** One card; a pair; three of a kind; or five cards
  that make, in rising order, a straight, a flush, a full house, four of a
  kind with any fifth card, or a straight flush. A straight is five ranks in
  a row from 3-4-5-6-7 up to 10-J-Q-K-A; a two is never part of one.
- **Beating.** Each player in turn beats what is on the table with the same
  number of cards, stronger, or passes. A five-card hand of a higher kind
  beats any of a lower kind. Pairs, triples, straights and flushes of the
  same kind are compared by their highest card; full houses by their three of
  a kind; fours of a kind by the four.
- **Passing.** Once you pass you are out of that trick. When everybody else
  has passed, the last player to play leads anything.
- **The score.** The first player out of cards wins the deal. Everybody else
  is charged a point for each card left, doubled for ten or more cards and
  trebled for thirteen or more.
- **The end.** After the last deal the fewest points wins; players level on
  the fewest share the win.

**Tables differ** on whether a straight may wrap through the ace and two, on
how flushes are compared, and on whether a player who has passed may come
back in.

Source: [pagat.com/climbing/bigtwo.html](https://www.pagat.com/climbing/bigtwo.html)

## President

**Three to eight players, each for themselves. Size: the number of rounds, 3,
5 or 7. The most points wins.** In Japan the game is *Daifugō* (大富豪).

- **The cards.** Twos are the highest and threes the lowest: three, four, and
  so on up to king, ace, two. Suits do not matter.
- **The deal.** The whole pack is dealt round, so some hands may hold one
  card more than others.
- **The play.** In the first round, whoever holds the three of clubs leads.
  The lead is one card, or two, three or four cards of one rank. Each player
  in turn plays the same number of cards of a higher rank, or passes. Once
  you pass you are out of that trick. When everybody else has passed, the
  last player to play leads again. A player who has gone out takes no more
  part in the round.
- **The titles.** The first player out is the President and the second the
  Vice-President. The last is the Beggar, and the one before the Vice-Beggar.
  Anybody between is a Citizen.
- **The exchange.** From the second round, before play, the Beggar hands the
  President their two highest cards, and the President gives back any two
  cards they choose. With four or more players the Vice-Beggar and the
  Vice-President exchange one card the same way. With three players only one
  card changes hands each way, between the Beggar and the President. Then the
  Beggar leads.
- **The score.** Each round, you score a point for every player who went out
  after you: with four players, three for the President, two, one, and
  nothing for the Beggar.
- **The end.** After the last round the most points wins; players level on
  the most share the win.

**Tables differ** more here than in any other game: on who leads, on whether
equal cards may be played, on twos and jokers that clear the trick, on
revolutions, and on the score. Toranpu plays the plain game.

Sources: [pagat.com/climbing/president.html](https://www.pagat.com/climbing/president.html),
and for the Japanese game [pagat.com/climbing/daifugo.html](https://www.pagat.com/climbing/daifugo.html)

## Gin Rummy

**Two players. Size: the score that wins, 50, 100 or 150.**

- **The deal.** Ten cards each. The next card is turned up to start the
  discard pile, and the rest is the stock. The first to play alternates hand
  by hand.
- **A turn.** Take one card, the top of the stock or the top of the discard
  pile, and then throw one card onto the discard pile. A card just taken from
  the discard pile may not be thrown straight back.
- **Melds.** Three or four cards of one rank, or three or more cards in a row
  in one suit. The ace is low: ace-two-three is a run and queen-king-ace is
  not.
- **Deadwood.** Every card in no meld counts against you: an ace one, a king,
  queen or jack ten, and the rest their number.
- **Knocking.** If, after throwing a card, your deadwood would be ten or
  less, you may **knock** with that throw, ending the hand. The other player
  then lays down their own melds, and may **lay off** cards onto your melds.
  You score the difference between their deadwood and yours.
- **Undercut.** If the other player ends with as little deadwood as you or
  less, they score the difference and twenty-five more.
- **Gin.** Knock with no deadwood at all and you score twenty-five plus all
  the other player's deadwood, and they may lay nothing off.
- **A drawn hand.** If only two cards are left in the stock and nobody has
  knocked, the hand is thrown in with no score.
- **The end.** The first to the size wins.

**Tables differ** on the bonuses (twenty for gin and ten for an undercut are
also common) and on the game and box bonuses added at the end of a match,
which Toranpu does not play.

Source: [pagat.com/rummy/ginrummy.html](https://www.pagat.com/rummy/ginrummy.html)

## Trademarks

The games here are traditional games in the public domain, named as they are
commonly known. Toranpu is not affiliated with or endorsed by any publisher of
a boxed or electronic edition of them.
