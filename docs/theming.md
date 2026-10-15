# Theming: the drawings

From [the README's Theming section](../README.md#theming), with the custom properties of what Toranpu draws.

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
