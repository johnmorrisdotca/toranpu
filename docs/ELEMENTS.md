# The elements: a card, a hand, a pile, an embed and a whole table

The tags that draw cards on a page. Moved here from [the README](../README.md) to keep it under the length npm shows.

## One card on any page

A card as an element, in any design and with any back, turned over by a tap.
One script tag and one element, with nothing to install:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js"></script>
<toranpu-card card="KS" design="english" back="classic-blue" flip></toranpu-card>
```

Or from your own bundle, choosing when the elements are registered:

```ts
import { defineToranpuElements } from "@johnmorrisdotca/toranpu/element";

defineToranpuElements();
document.addEventListener("toranpu-flip", (event) => console.log(event.detail));   // { card: "KS", faceDown: true }
```

| Attribute of `<toranpu-card>` | What it does |
| --- | --- |
| `card` | the card: `QS`, `TD`, `RJ`, `BJ`; or the id of a card of a design the page registered |
| `design` | `plain` (unless said), `four-colour` or `english`, fetched the first time a card asks for it; or the name of a design the page registered |
| `back` | `classic-red` (unless said), `classic-blue` or `ink-dots`; or the name of a back the page registered |
| `back-colour`, `back-image`, `back-logo`, `mark` | the back's colour, a picture for the whole back, a logo in its middle, and the words in its middle, as `cardBackSvg` takes them |
| `label` | what a screen reader says for a card of your own, which has no name in any deck |
| `face-down` | shows the back. While the card lies face down its face is not in the page at all |
| `flip` | a tap, Enter or Space turns it over, with a turn a device asking for less motion skips. The card is then a button |
| `marked` | a dot on its corner, seen face up and face down, to follow it as it moves |
| `size` | `small` (46 pixels wide), `medium` (70, unless said) or `large` (104) |
| `width` | its width in pixels, in place of `size` |
| `sound` | the turn makes a sound (see [Card sounds](#card-sounds)) |
| `lang` | `ja` for the card's name in Japanese; the page's language unless said |

- `slot="face"` and `slot="back"` put your own element in as a side, and a
  `face` property that is a function draws the face from the card's id: see
  [Your own branding](#your-own-branding).
- A framework that sets a property rather than an attribute (React 19, Vue 3
  and Svelte 5 do, when the element has a property of that name) is covered:
  `flip` is a method and an attribute, and `card.flip = true` sets the
  attribute while `card.flip()` goes on turning the card. So do `mark` on a
  hand, `cards` on a hand or a pile, `count` on a pile and `game` on a table.
- `faceDown` is a property too, `flip()` a method that turns it as a tap
  does, and `spin(options?)` spins it where it lies, as on a hand. Each turn is a `toranpu-flip` event that bubbles, its `detail`
  `{ card, faceDown }`.
- A screen reader hears the card's name ("king of spades", "スペードのキング"),
  or "a card, face down".
- It is drawn in its own shadow DOM, so the page's styles cannot upset it,
  and it takes the custom properties under [The drawings](#the-drawings), so
  the page's theme still colours it. Imported on a server, the elements are
  defined and do nothing.

**As a picture.** Every card and back is on the demo site as an SVG file of
its own, for an `<img>` anywhere:
`https://johnmorrisdotca.github.io/toranpu/cards/<design>/<card>.svg` (such
as [`cards/english/KS.svg`](https://johnmorrisdotca.github.io/toranpu/cards/english/KS.svg))
and `https://johnmorrisdotca.github.io/toranpu/backs/<back>.svg`. Or drawn by
the page itself, with no request at all, as a data URL from `cardFaceUrl`
and `cardBackUrl`.

## Hand controls

`<toranpu-hand>` is a hand of cards on any page, fanned, in any design and
with any back, and everything a person does with a hand where it lies: turn
it face down, all at once or one card after another, or turn chosen cards
over; gather it into one bundle that never says how many; part it at one card
to bring that card out; sort it, group it, mix it up, toss a card or swap
one; mark a card to follow it while it is face down; and spin a card on the
table.

```html
<toranpu-hand id="mine" cards="AS KH QD JC 10S" design="english"></toranpu-hand>
<script type="module">
  import "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js";

  const hand = document.getElementById("mine");
  await hand.hide({ oneByOne: true });   // face down, one card after another; settles once all are down
  await hand.show();                     // face up again, all at once
  await hand.scrunch();                  // one bundle: no faces and no count in the page
  await hand.spread();                   // laid out again as it was
  await hand.show();                     // face up
  await hand.toggle(["KH", "QD"]);       // just those two turned over
  await hand.partAt("QD");               // the queen lifted out, the cards either side drawn away
  hand.mark("KH");                       // a dot on the king's corner, face up or face down
  await hand.spin("KH", { direction: "anticlockwise" });
</script>
```

| Attribute of `<toranpu-hand>` | What it does |
| --- | --- |
| `cards` | the hand: ids separated by spaces or commas (`AS KH 10D`), or the deck's one-letter codes |
| `face-down` | every card shows its back, and no face is in the page |
| `turned` | cards that show the other side from the rest: face up in a hand face down, face down in one face up |
| `scrunched` | squared up into one bundle of three cards whatever the hand, so nothing says how many; face down no face is in the page either, and face up its top card shows |
| `parted` | the card the hand is parted at: lifted out, upright and wholly in view, the cards either side drawn away from it |
| `marked` | cards that carry a mark, a dot on the corner seen face up and face down alike (`--toranpu-marker` colours it) |
| `order` | `rank` sorts the hand low to high, the ace high; `suit` groups it by suit (spades, hearts, clubs, diamonds), each in rank order; `face` puts the number cards, ace to ten, before the face cards; left out, the cards lie as dealt |
| `receive` | where a card given by `replace()` lands: `front`, or `end` unless said |
| `closed` | how closed the hand lies, from `0` (a clear fan) to `1` (squared up, only the top card showing): see [A closed hand that opens with a tap](#a-closed-hand-that-opens-with-a-tap) |
| `reveal` | a tap, Enter or Space opens a closed hand into a fan, and closes it again |
| `deal-after` | given new cards, how many milliseconds this hand waits before it gathers the old ones in and opens on the new: give each seat a little more than the one before, and the hands are dealt in turn round the table |
| `design`, `back`, `back-colour`, `back-image`, `back-logo`, `mark`, `size`, `width`, `lang`, `sound` | as on `<toranpu-card>` |

| Method | What it does |
| --- | --- |
| `hide({ oneByOne?, gap? })` | turns every card face down: at once, or one by one, `gap` milliseconds apart (110 unless said) |
| `show({ oneByOne?, gap? })` | turns them face up again |
| `toggle(cards?, { oneByOne?, gap? })` | turns the cards named (one id or a list) over, each to its other side; every card unless named |
| `scrunch()`, `spread()` | squares the hand into a bundle, each card keeping its side, and lays it out again |
| `partAt(card)`, `unpart()` | parts the hand at a card, a group either side of it (one at an end), and closes it up again |
| `open()`, `close(closed?)` | fans a closed hand, and squares it again (all the way unless said) |
| `sort()`, `group(by?)`, `unsort()` | sorts by rank, groups by suit (or with `"face"`, number cards then face cards), and lays the hand out as dealt again: each card slides to its new place |
| `mixUp()` | mixes the hand up, the same cards in another order, never the one it was in |
| `toss(card)` | tosses a card out: it lifts away and the rest close up |
| `replace(card, next, lands?)` | tosses a card out and takes the next card in its stead, dropped in at the front or the end (`lands`, else `receive`, else the end) |
| `mark(cards)`, `unmark(cards?)` | marks the cards named, and takes the marks off them (or off every card) |
| `spin(cards?, { direction?, turns?, ms? })` | spins the cards named, or all, where they lie: fast, then slowing to a stop as they were, `turns` whole turns later (3 unless said), `clockwise` unless said `anticlockwise` |

- Each returns a promise that settles when the cards have stopped moving, and
  each change is a `toranpu-hand` event that bubbles, its `detail`
  `{ faceDown, scrunched, open, turned, parted }`. The `cards` property reads and sets the
  hand as a list.
- The cards turn over in place and slide together; a device that asks for less
  motion gets the end at once.
- **A new deal is seen.** Given other cards (a shuffle, a new seed), a hand
  already on the page gathers its old cards into a stack where it lies, then
  opens on the new ones, in the same room, with the shuffle's sound where
  `sound` is on. Seat after seat, with `deal-after`:

  ```js
  seats.forEach((hand, seat) => {
    hand.setAttribute("deal-after", String(seat * 150)); // seat 1 at once, seat 2 after 150 ms, …
    hand.cards = newHands[seat];
  });
  ```
- **Scrunch only gathers.** `scrunch()` squares the hand where it lies, each
  card keeping its side: a hand face down becomes a bundle that says nothing,
  one face up shows its top card and still no count. (Before 2.13 it also
  turned the hand face down; `hide()` then `scrunch()` does that now.)
- **Turn over, part, mark, spin.** `toggle()` turns any cards over, so a hand
  can lie half face up. `partAt()` brings one card out: it lifts upright and
  wholly in view, and the cards either side are drawn away into a group on
  each side, closing up so the hand keeps its room wherever it can. A mark is
  a dot on a card's corner, seen face up and face down, to follow a card as it
  moves about; a screen reader hears "king of hearts, marked". A spin turns a
  card about its own middle, slowing as a card on a cloth does.
- **Sort, group, mix, toss, replace.** The cards move as a person would move
  them: sorted or mixed, each slides from where it lay to its new place; a
  tossed card lifts away and the rest close up; a card given drops in.

  ```js
  await hand.group();                    // spades, hearts, clubs, diamonds, each in rank order
  await hand.toss("QH");                 // the queen of hearts lifts away
  await hand.replace("2C", "AS", "front"); // the two of clubs out, the ace of spades in at the front
  ```
- **A hand keeps one box.** Open, closed, squared up or face down, it keeps
  the room its whole fan takes and lies in the middle of it, so nothing moves
  when an effect ends.
- A face down card's face, and a bundle's cards, are taken out of the page
  once the cards are still: a screen reader hears "a hand face down, cards:
  5", or for a bundle only "a hand of cards, squared up face down". What
  the page itself was given (the `cards` attribute) is the page's to keep
  secret: a game should not put an opponent's cards in the page at all.
- The hand is as wide as its whole fan, and never wider than the room it is
  given: in less room its cards are drawn smaller, so it never pokes out of a
  phone's screen.

## A closed hand that opens with a tap

A hand can lie squared up, only its top card showing and the rest partly
hidden, and open into a clear fan when it is tapped, as a reveal. `closed`
says how closed it starts, from `0` (a fan) to `1` (squared up).

```html
<toranpu-hand id="yours" cards="KS 7C 4C QH 10H" closed="0.9" reveal></toranpu-hand>
<script type="module">
  import "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js";

  document.getElementById("yours").addEventListener("toranpu-hand", (event) => console.log(event.detail.open));   // 1 once it is open
</script>
```

- A tap, Enter or Space opens it with the cards sliding into a fan, and the
  next closes it again, as far as it was. A device that asks for less motion
  gets the fan at once.
- `open()` and `close(closed?)` do the same from code, and `closed` can be
  set at any time: `0.5` leaves it half open.
- It is a button to a screen reader, with `aria-expanded` saying whether it is
  open, and it names its cards.
- Where the cards lie is `handLayout(count, { open })`, the same arithmetic
  the element uses, for a table of your own.

## Messy piles

`<toranpu-pile>` is a stock to draw from or a discard pile: its top card on
top, and the cards under it showing as a stack, from neatly squared to very
messy. Each pile is laid out from its own seed, so it always looks the same,
and a card put on top moves none of those under it.

```html
<toranpu-pile count="24" face-down messiness="0.4" seed="7"></toranpu-pile>
<toranpu-pile cards="3C 9D QS 7H" messiness="0.6" seed="7"></toranpu-pile>
```

| Attribute of `<toranpu-pile>` | What it does |
| --- | --- |
| `cards` | the pile from the bottom up, its top card last: ids or one-letter codes |
| `count` | for a face-down pile, how many cards, with no need to say which |
| `face-down` | every card shows its back, and no face is in the page |
| `messiness` | from `0` (squared up, each card's edge showing under the one above) to `1` (very messy): unless said, `0.3` |
| `seed` | the pile's own seed, a whole number: unless said, `1` |
| `depth` | how many cards under the top are drawn at most, so a pile of fifty costs what a pile of ten does: unless said, `10` |
| `design`, `back`, `back-colour`, `back-image`, `back-logo`, `mark`, `size`, `width`, `lang` | as on `<toranpu-card>` |

- A pile keeps its size as cards come and go: the room round it is set by
  its messiness and depth, never by what it holds, so nothing next to it
  moves when a card is drawn.
- A screen reader hears "a pile face down, cards: 24" or "a pile, queen of
  spades on top, cards: 4"; an empty pile is drawn as a dashed outline.
- Where each card lies is `pileLayout(count, { messiness, seed, depth })`, the
  same arithmetic the element uses, for a pile of your own.
- The demo's own table draws its stock and its discard pile this way, in
  the look and the messiness chosen on the page.

## Embed a hand

Any hand of cards on any web page, written in the card codes (`AS KH 10D`, or
the deck's one-letter codes). Two ways, at three sizes.

An iframe, where the page allows no scripts (a blog, a wiki, a forum):

```html
<iframe src="https://johnmorrisdotca.github.io/toranpu/embed/?hand=AS+KH+QD+JC+10S&size=medium" title="A hand of cards" width="360" height="200" style="border:0;max-width:100%" loading="lazy"></iframe>
```

One tag, where the page may run a script, with nothing to install:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/element-define.js"></script>
<toranpu-hand cards="AS KH QD JC 10S" size="medium"></toranpu-hand>
```

| Size | The iframe shows | Its height, for five cards at 360 pixels wide |
| --- | --- | --- |
| `small` | the hand alone, its cards 46 pixels wide | 160 |
| `medium` | the hand, its cards 70 pixels wide | 200 |
| `large` | the hand, its cards 104 pixels wide, named in words, with a button that turns it face down one card at a time and back | 360 |

The iframe's address takes `hand` (or `card` for one card, which turns over
on a tap), `size`, `lang` (`en` or `ja`), `design`, `back`, `back-colour` and
`felt` and `ink` as `rrggbb`, `mark`, `face-down`, `closed` (a closed hand
that opens on a tap) and `sound`. Anything that is not a hand is answered
with a line saying how to write one, and only what looks like a colour is
taken as one. The page tracks nothing, loads nothing from anywhere else and
keeps nothing on the visitor's device. It tells the page that frames it its
height, `{ toranpu: "height", height }`, so a frame can be made to fit, and
each change, `{ toranpu: "hand", faceDown, scrunched, open, turned, parted }` or
`{ toranpu: "flip", card, faceDown }`, by `postMessage`.

The tag is the element of [Hand controls](#hand-controls), so it takes every
attribute listed there. [The demo](https://johnmorrisdotca.github.io/toranpu/#embed-panel)
writes both for any hand typed into it, in the look chosen there, and shows
the iframe as it will be framed.

## A whole table on a page

Any of the eleven games, ready to play, in one tag: the seats round the felt,
what lies on the table (the trick, the pile to beat, the stock and the
discard), the hand of whoever is to play and the moves they may make, with
computers in the other seats, playing after a short pause.

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/table-define.js"></script>
<toranpu-table game="crazy-eights" players="3" cloth="blue" messiness="0.4"></toranpu-table>
```

| Attribute of `<toranpu-table>` | What it does |
| --- | --- |
| `game` | any of the eleven, by its key or in kebab case: `hearts` (unless said), `spades`, `euchre`, `cribbage`, `oh-hell`, `crazy-eights`, `go-fish`, `big-two`, `president`, `gin-rummy`, `war` |
| `players` | how many sit at the table, within the game's own range (its usual number unless said) |
| `people` | how many seats, the first ones, are people's; the rest are computers (1 unless said) |
| `names` | the seats' names, separated by commas; the first is "You" unless said |
| `seed` | the deal: the same seed deals the same cards |
| `cloth` | the felt: `green` (unless said), `blue`, `red`, `black` or `wood`, the family's five |
| `messiness` | how untidy the stock and the discard lie, from 0 to 1 (0.3 unless said) |
| `delay` | how long a computer thinks before it plays, in milliseconds (550 unless said) |
| `design`, `back`, `back-colour`, `back-image`, `back-logo`, `mark`, `size`, `width`, `lang`, `sound` | as on `<toranpu-card>` |

- `deal(seed?)` deals again; the `game` property is the game as it stands,
  in the game's own form (`toCode` and the rest save it).
- Each move is a `toranpu-table` event that bubbles, its `detail`
  `{ seat, move, over, winners }`.
- The table carries the rules of all eleven games, so it is an entry point of
  its own: a page that wants only a card or a hand imports `element`.
