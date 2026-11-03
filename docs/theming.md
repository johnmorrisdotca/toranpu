# Theming

From [the README's Theming section](../README.md#theming): the custom properties of the demo's table, and of what Toranpu draws.

## The demo's table

The demo's table is themed, and is the worked example. It wears the family's
one stylesheet, [`demo/family.css`](./demo/family.css), which is the same file
byte for byte on every sibling's site (a test holds it to its hash), and one
of its own for the cards and the table, [`demo/toranpu.css`](./demo/toranpu.css).
Every colour and size in both is a CSS custom property on `:root`:

| Property | What it colours or sizes | Light | Dark |
| --- | --- | --- | --- |
| `--page` | the page behind everything | `#f4efe4` | `#141614` |
| `--ink` | text, and a pressed button | `#1f2320` | `#ece8dc` |
| `--muted` | notes and labels | `#6b6f68` | `#a09d93` |
| `--rule` | borders and rules | `#ddd6c6` | `#3a3d38` |
| `--surface` | panels, fields and buttons | `#fbf8f1` | `#1d201e` |
| `--felt`, `--felt-deep` | the table | `#2f5d4a`, `#1f4135` | `#214337`, `#152c24` |
| `--felt-ink` | text on the table | `#f3efe4` | the same |
| `--accent`, `--accent-ink` | the selected tab, the focus ring | `#b5452c`, `#fff` | the same |
| `--good`, `--bad` | a refusal | `#2f7a4f`, `#b5452c` | the same |
| `--gold`, `--gold-ink` | the seat to play, a picked card | `#e0b43b`, `#1f2320` | the same |
| `--radius` | the corners of panels | `16px` | |
| `--font`, `--mono` | the type: the system's own, and its monospace | | |
| `--card`, `--card-ink`, `--card-red` | a card's face, its black suits and its red | `#fffdf8`, `#1b1b1b`, `#c2272d` | the same |
| `--card-w`, `--card-h` | a card's size (46px by 68px on a phone) | `58px`, `84px` | |
| `--intro-room`, `--intro-room-wide` | room kept for the header's words, so that changing language moves nothing | `11.5rem`, `7rem` | |

The page follows the device's light or dark setting; `data-theme="light"` or
`"dark"` on `<html>` forces one. To give a copy of the table another look, set
the properties after the two stylesheets:

```css
:root { --felt: #23405a; --felt-deep: #162a3c; --card-red: #b00020; --card-w: 64px; --card-h: 92px; }
```

## The drawings

What Toranpu draws, the backs and the plain and four-colour faces, takes
these custom properties when it is put into a page as SVG, and keeps its own
colours as an image:

| Custom property | Colours | Unless set |
| --- | --- | --- |
| `--toranpu-back` | a back's field | the back's own: `#b3262d`, `#1f4e8c` or `#24231f` |
| `--toranpu-back-ink` | the lines and dots on it | `#fffaf0` |
| `--toranpu-back-paper` | the border round it | `#fffdf8` |
| `--toranpu-card` | a face's paper | `#fffdf8` |
| `--toranpu-card-ink` | spades and clubs, and a black joker | `#1b1b1b` |
| `--toranpu-card-red` | hearts and diamonds, and a red joker | `#c2272d` |
| `--toranpu-card-blue` | diamonds, in four colour | `#1f5fbf` |
| `--toranpu-card-green` | clubs, in four colour | `#1f7a3a` |

```css
.my-table { --toranpu-back: #3d4d38; }   /* every back on this table, moss green */
```

The elements take three more:

| Custom property | Sizes or times | Unless set |
| --- | --- | --- |
| `--toranpu-card-width` | a card's width, where the element has no `size` or `width` | `70px` |
| `--toranpu-flip-ms` | how long a card takes to turn over | `450ms` |
| `--toranpu-focus` | the ring round a card that has the keyboard's focus | `#b5452c` |
