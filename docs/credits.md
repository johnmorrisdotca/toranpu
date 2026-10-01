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
