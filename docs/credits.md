# Credits: where the sounds and pictures come from

Everything in Toranpu was written for it, under its MIT licence, except what
this page names. Each item says where it came from, its licence as read at
its source, and the day that was checked. Nothing here is GPL or LGPL, and
nothing is used whose licence has not been read.

## The card sounds

**Casino Audio (1.1)** by Kenney Vleugels,
[https://kenney.nl/assets/casino-audio](https://kenney.nl/assets/casino-audio).

- **Licence:** Creative Commons Zero, CC0 1.0
  ([creativecommons.org/publicdomain/zero/1.0](http://creativecommons.org/publicdomain/zero/1.0/)),
  as the pack's page says and as its own `License.txt` states: "You may use
  these assets in personal and commercial projects. Credit (Kenney or
  www.kenney.nl) would be nice but is not mandatory."
- **Checked:** 2026-09-30, on the pack's page and in `License.txt` inside
  `kenney_casino-audio.zip` (SHA-256
  `f36250766ac5bc378c13708ddf12a23a8e54a3251f8d482c7536e51b5dbafa18`).

Thirteen of the pack's recordings are used, each cut short and re-encoded:

| File here | From the pack | What it is | Length | Size |
| --- | --- | --- | --- | --- |
| `sounds/deal-1.m4a` | `Audio/card-slide-1.ogg` | a card slid across the table | 0.07 s | 1,513 bytes |
| `sounds/deal-2.m4a` | `Audio/card-slide-2.ogg` | a card slid across the table | 0.40 s | 3,365 bytes |
| `sounds/deal-3.m4a` | `Audio/card-slide-3.ogg` | a card slid across the table | 0.40 s | 3,427 bytes |
| `sounds/deal-4.m4a` | `Audio/card-slide-5.ogg` | a card slid across the table | 0.10 s | 1,737 bytes |
| `sounds/flip-1.m4a` | `Audio/card-slide-4.ogg` | a short flick: a card turned over | 0.29 s | 2,814 bytes |
| `sounds/flip-2.m4a` | `Audio/card-slide-7.ogg` | a short flick: a card turned over | 0.40 s | 3,634 bytes |
| `sounds/play-1.m4a` | `Audio/card-place-1.ogg` | a card laid on the table | 0.11 s | 1,852 bytes |
| `sounds/play-2.m4a` | `Audio/card-place-2.ogg` | a card laid on the table | 0.23 s | 2,627 bytes |
| `sounds/play-3.m4a` | `Audio/card-place-4.ogg` | a card laid on the table | 0.34 s | 3,228 bytes |
| `sounds/shuffle-1.m4a` | `Audio/card-shuffle.ogg` | the deck shuffled: the first 1.6 s | 1.60 s | 11,500 bytes |
| `sounds/gather-1.m4a` | `Audio/card-shove-1.ogg` | cards pushed together into a pile | 0.60 s | 4,739 bytes |
| `sounds/gather-2.m4a` | `Audio/card-shove-3.ogg` | cards pushed together into a pile | 0.55 s | 4,466 bytes |
| `sounds/fan-1.m4a` | `Audio/card-fan-1.ogg` | a hand of cards fanned open | 0.60 s | 5,828 bytes |

50,730 bytes in all.

**What was done to them**, by `scripts/sounds-cut.mjs` on a Mac: each
recording was decoded from Ogg Vorbis, mixed to one channel, cut from where
it first reaches a tenth of its peak to where it falls quiet (or to the
length above), faded at both ends, brought to the same peak level, and
encoded as AAC at 48 kbit/s in an `.m4a`, which every current browser
decodes, Safari on an iPhone included. The empty padding the encoder leaves
in the file was taken out. Then `pnpm sounds` writes them into
`src/sounds.ts` as base64, and a test fails if that module and the files fall
out of step, or if a file is not named on this page.

## The English pattern design

The cards of `@johnmorrisdotca/toranpu/card-faces/english`: the traditional
English pattern deck with its kings, queens and jacks, drawn as vectors by
**Dmitry Fomin**
([User:Dmitry Fomin](https://commons.wikimedia.org/wiki/User:Dmitry_Fomin)
on Wikimedia Commons), from his set
[SVG English pattern playing cards](https://commons.wikimedia.org/wiki/Category:SVG_English_pattern_playing_cards).

- **Licence:** Creative Commons Zero, CC0 1.0, a public domain dedication
  (`{{self|cc-zero}}`, "own work", dated 2017-02-24), stated on each file's
  own page. Checked on every one of the 52 pages below, 2026-09-30.
- **Not used:** the same category's "English pattern playing cards deck
  PLUS.svg", which is under the LGPL; and xCards and Chris Aguilar's Vector
  Playing Cards, which are LGPL too.

| Suit | The file of each card, ace to king |
| --- | --- |
| Spades | [`AS`](https://commons.wikimedia.org/wiki/File:English_pattern_ace_of_spades.svg) [`2S`](https://commons.wikimedia.org/wiki/File:English_pattern_2_of_spades.svg) [`3S`](https://commons.wikimedia.org/wiki/File:English_pattern_3_of_spades.svg) [`4S`](https://commons.wikimedia.org/wiki/File:English_pattern_4_of_spades.svg) [`5S`](https://commons.wikimedia.org/wiki/File:English_pattern_5_of_spades.svg) [`6S`](https://commons.wikimedia.org/wiki/File:English_pattern_6_of_spades.svg) [`7S`](https://commons.wikimedia.org/wiki/File:English_pattern_7_of_spades.svg) [`8S`](https://commons.wikimedia.org/wiki/File:English_pattern_8_of_spades.svg) [`9S`](https://commons.wikimedia.org/wiki/File:English_pattern_9_of_spades.svg) [`TS`](https://commons.wikimedia.org/wiki/File:English_pattern_10_of_spades.svg) [`JS`](https://commons.wikimedia.org/wiki/File:English_pattern_jack_of_spades.svg) [`QS`](https://commons.wikimedia.org/wiki/File:English_pattern_queen_of_spades.svg) [`KS`](https://commons.wikimedia.org/wiki/File:English_pattern_king_of_spades.svg) |
| Hearts | [`AH`](https://commons.wikimedia.org/wiki/File:English_pattern_ace_of_hearts.svg) [`2H`](https://commons.wikimedia.org/wiki/File:English_pattern_2_of_hearts.svg) [`3H`](https://commons.wikimedia.org/wiki/File:English_pattern_3_of_hearts.svg) [`4H`](https://commons.wikimedia.org/wiki/File:English_pattern_4_of_hearts.svg) [`5H`](https://commons.wikimedia.org/wiki/File:English_pattern_5_of_hearts.svg) [`6H`](https://commons.wikimedia.org/wiki/File:English_pattern_6_of_hearts.svg) [`7H`](https://commons.wikimedia.org/wiki/File:English_pattern_7_of_hearts.svg) [`8H`](https://commons.wikimedia.org/wiki/File:English_pattern_8_of_hearts.svg) [`9H`](https://commons.wikimedia.org/wiki/File:English_pattern_9_of_hearts.svg) [`TH`](https://commons.wikimedia.org/wiki/File:English_pattern_10_of_hearts.svg) [`JH`](https://commons.wikimedia.org/wiki/File:English_pattern_jack_of_hearts.svg) [`QH`](https://commons.wikimedia.org/wiki/File:English_pattern_queen_of_hearts.svg) [`KH`](https://commons.wikimedia.org/wiki/File:English_pattern_king_of_hearts.svg) |
| Diamonds | [`AD`](https://commons.wikimedia.org/wiki/File:English_pattern_ace_of_diamonds.svg) [`2D`](https://commons.wikimedia.org/wiki/File:English_pattern_2_of_diamonds.svg) [`3D`](https://commons.wikimedia.org/wiki/File:English_pattern_3_of_diamonds.svg) [`4D`](https://commons.wikimedia.org/wiki/File:English_pattern_4_of_diamonds.svg) [`5D`](https://commons.wikimedia.org/wiki/File:English_pattern_5_of_diamonds.svg) [`6D`](https://commons.wikimedia.org/wiki/File:English_pattern_6_of_diamonds.svg) [`7D`](https://commons.wikimedia.org/wiki/File:English_pattern_7_of_diamonds.svg) [`8D`](https://commons.wikimedia.org/wiki/File:English_pattern_8_of_diamonds.svg) [`9D`](https://commons.wikimedia.org/wiki/File:English_pattern_9_of_diamonds.svg) [`TD`](https://commons.wikimedia.org/wiki/File:English_pattern_10_of_diamonds.svg) [`JD`](https://commons.wikimedia.org/wiki/File:English_pattern_jack_of_diamonds.svg) [`QD`](https://commons.wikimedia.org/wiki/File:English_pattern_queen_of_diamonds.svg) [`KD`](https://commons.wikimedia.org/wiki/File:English_pattern_king_of_diamonds.svg) |
| Clubs | [`AC`](https://commons.wikimedia.org/wiki/File:English_pattern_ace_of_clubs.svg) [`2C`](https://commons.wikimedia.org/wiki/File:English_pattern_2_of_clubs.svg) [`3C`](https://commons.wikimedia.org/wiki/File:English_pattern_3_of_clubs.svg) [`4C`](https://commons.wikimedia.org/wiki/File:English_pattern_4_of_clubs.svg) [`5C`](https://commons.wikimedia.org/wiki/File:English_pattern_5_of_clubs.svg) [`6C`](https://commons.wikimedia.org/wiki/File:English_pattern_6_of_clubs.svg) [`7C`](https://commons.wikimedia.org/wiki/File:English_pattern_7_of_clubs.svg) [`8C`](https://commons.wikimedia.org/wiki/File:English_pattern_8_of_clubs.svg) [`9C`](https://commons.wikimedia.org/wiki/File:English_pattern_9_of_clubs.svg) [`TC`](https://commons.wikimedia.org/wiki/File:English_pattern_10_of_clubs.svg) [`JC`](https://commons.wikimedia.org/wiki/File:English_pattern_jack_of_clubs.svg) [`QC`](https://commons.wikimedia.org/wiki/File:English_pattern_queen_of_clubs.svg) [`KC`](https://commons.wikimedia.org/wiki/File:English_pattern_king_of_clubs.svg) |

**The jokers** are Dmitry Fomin's too, from his Atlas deck, CC0 by the same
dedication ("own work", 2017-02-25), checked 2026-09-30:
[`RJ` Atlas deck joker red.svg](https://commons.wikimedia.org/wiki/File:Atlas_deck_joker_red.svg) and
[`BJ` Atlas deck joker black.svg](https://commons.wikimedia.org/wiki/File:Atlas_deck_joker_black.svg).
Their corner word, the Russian джокер, was taken off, and Toranpu writes
JOKER (or ジョーカー) in its place.

**What was done to them**, by `scripts/designs.mjs`: each file was made
smaller with svgo (one decimal place in its 360 by 540 box; 2.5 MB of SVG
became 0.7 MB), its outline taken off so that Toranpu draws the card's paper,
and every id given the card's own prefix. The drawings are otherwise as
Fomin made them. Each card is fitted to Toranpu's 100 by 140 card by its
height, and centred.

## The realistic design

The number cards and aces of `@johnmorrisdotca/toranpu/card-faces/realistic`:
**Byron Knoll**'s vector playing cards, drawn by him in Inkscape and first
published on Google Code as vector-playing-cards
([his post](http://byronknoll.blogspot.com/2011/03/vector-playing-cards.html)).

- **Licence:** public domain. Knoll: "I am releasing the images into the
  public domain. This means that they can be used for any purpose without
  any attribution." Each file's page on Wikimedia Commons records "This work
  has been released into the public domain by its author, Byron Knoll. This
  applies worldwide." Checked on every one of the 39 pages below, 2026-10-01,
  and each file's SHA-1 matched to the one Commons records.
- **Not used:** his ace of spades, which he based on artwork by Suzanne Tyson
  whose licence is not stated; his kings, queens and jacks, which he scanned
  from a printed pack (the traditional design is old, but a scan of a modern
  printing copies its maker's redrawing); and the two jokers of the GitHub
  copy, whose origin is not stated. Those cards are drawn from Fomin's CC0
  English pattern above.

| Suit | The file of each card, ace to ten |
| --- | --- |
| Spades | [`2S`](https://commons.wikimedia.org/wiki/File:2_of_spades.svg) [`3S`](https://commons.wikimedia.org/wiki/File:3_of_spades.svg) [`4S`](https://commons.wikimedia.org/wiki/File:4_of_spades.svg) [`5S`](https://commons.wikimedia.org/wiki/File:5_of_spades.svg) [`6S`](https://commons.wikimedia.org/wiki/File:6_of_spades.svg) [`7S`](https://commons.wikimedia.org/wiki/File:7_of_spades.svg) [`8S`](https://commons.wikimedia.org/wiki/File:8_of_spades.svg) [`9S`](https://commons.wikimedia.org/wiki/File:9_of_spades.svg) [`TS`](https://commons.wikimedia.org/wiki/File:10_of_spades.svg) |
| Hearts | [`AH`](https://commons.wikimedia.org/wiki/File:Ace_of_hearts.svg) [`2H`](https://commons.wikimedia.org/wiki/File:2_of_hearts.svg) [`3H`](https://commons.wikimedia.org/wiki/File:3_of_hearts.svg) [`4H`](https://commons.wikimedia.org/wiki/File:4_of_hearts.svg) [`5H`](https://commons.wikimedia.org/wiki/File:5_of_hearts.svg) [`6H`](https://commons.wikimedia.org/wiki/File:6_of_hearts.svg) [`7H`](https://commons.wikimedia.org/wiki/File:7_of_hearts.svg) [`8H`](https://commons.wikimedia.org/wiki/File:8_of_hearts.svg) [`9H`](https://commons.wikimedia.org/wiki/File:9_of_hearts.svg) [`TH`](https://commons.wikimedia.org/wiki/File:10_of_hearts.svg) |
| Diamonds | [`AD`](https://commons.wikimedia.org/wiki/File:Ace_of_diamonds.svg) [`2D`](https://commons.wikimedia.org/wiki/File:2_of_diamonds.svg) [`3D`](https://commons.wikimedia.org/wiki/File:3_of_diamonds.svg) [`4D`](https://commons.wikimedia.org/wiki/File:4_of_diamonds.svg) [`5D`](https://commons.wikimedia.org/wiki/File:5_of_diamonds.svg) [`6D`](https://commons.wikimedia.org/wiki/File:6_of_diamonds.svg) [`7D`](https://commons.wikimedia.org/wiki/File:7_of_diamonds.svg) [`8D`](https://commons.wikimedia.org/wiki/File:8_of_diamonds.svg) [`9D`](https://commons.wikimedia.org/wiki/File:9_of_diamonds.svg) [`TD`](https://commons.wikimedia.org/wiki/File:10_of_diamonds.svg) |
| Clubs | [`AC`](https://commons.wikimedia.org/wiki/File:Ace_of_clubs.svg) [`2C`](https://commons.wikimedia.org/wiki/File:2_of_clubs.svg) [`3C`](https://commons.wikimedia.org/wiki/File:3_of_clubs.svg) [`4C`](https://commons.wikimedia.org/wiki/File:4_of_clubs.svg) [`5C`](https://commons.wikimedia.org/wiki/File:5_of_clubs.svg) [`6C`](https://commons.wikimedia.org/wiki/File:6_of_clubs.svg) [`7C`](https://commons.wikimedia.org/wiki/File:7_of_clubs.svg) [`8C`](https://commons.wikimedia.org/wiki/File:8_of_clubs.svg) [`9C`](https://commons.wikimedia.org/wiki/File:9_of_clubs.svg) [`TC`](https://commons.wikimedia.org/wiki/File:10_of_clubs.svg) |

**What was done to them**, by `scripts/designs-realistic.mjs`: each file was
made smaller with svgo (457 kB of SVG became 87 kB), its outline taken off so
that Toranpu draws the card's paper, and every id given the card's own prefix.
One change to the drawings themselves: Knoll's large diamond pips are about a
sixth taller than his other suits' (72 units against 62), so from the seven up
they touched and overlapped; on the 2 to the 10 of diamonds each large pip is
drawn at 84% of its size about its own centre, heart-sized, every pip in its
place. The drawings are otherwise as Knoll made them. Each card is fitted to
Toranpu's 100 by 140 card by its height, and centred.

## Drawn for Toranpu

The card backs, the plain and four-colour faces with their jester's-cap
jokers, and the suits are drawn for Toranpu and are MIT like the rest of it.
The two classic backs are in the manner of a casino back and copy no maker's
design.
