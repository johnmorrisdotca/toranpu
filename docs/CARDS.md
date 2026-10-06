# Card sounds, backs, designs and your own branding

What the cards sound like and look like, and how to make them your own. Moved here from [the README](../README.md) to keep it under the length npm shows.

## Card sounds

Recordings of real cards for a table to play: the deck shuffled, a card dealt,
turned over or laid down, a trick gathered in, a hand fanned. Nothing sounds
unless a table asks, and nothing is fetched until the first sound.

```ts
import { createCardSounds } from "@johnmorrisdotca/toranpu/card-sounds";

const sounds = createCardSounds();                 // silent until asked: nothing is fetched yet
sounds.play("shuffle");
sounds.play("deal", { count: 13, delay: 900 });     // thirteen cards, one after another, after the shuffle
sounds.play("play");                               // a card laid on the table
muteButton.onclick = () => sounds.setMuted(!sounds.muted);
```

| Kind | What it is |
| --- | --- |
| `shuffle` | the deck shuffled |
| `deal` | a card slid to a hand; `{ count }` deals several, one every `gap` milliseconds |
| `flip` | a card turned over |
| `play` | a card laid on the table |
| `gather` | a trick or a pile swept in |
| `fan` | a hand spread open |

| Option of `createCardSounds` | Means | Unless said |
| --- | --- | --- |
| `muted` | start muted; nothing plays and nothing is fetched until `setMuted(false)` | `false` |
| `volume` | from 0 to 1, and a property to change later | `0.6` |
| `load` | where the recordings come from | the package's own `/sounds` |
| `window` | the window to make sound in; `null` for silence | the page's |

- **What it costs.** The player is about 3 kB. The thirteen recordings are
  50 kB of AAC (68 kB as the module that carries them), fetched by the first
  sound played and never before: a muted table, or one that never asks, never
  downloads them. Thirteen cards dealt are eight slides, not a wall of noise.
- **A browser only lets a page make sound after somebody has touched it**, so
  a sound asked for by code before any tap is silent, and `load()` fetches and
  decodes the recordings ahead of the first one.
- If the recordings cannot be fetched or decoded, a short sound made in the
  browser stands in. Nothing throws where there is no audio, as on a server or
  in a test.

The demo's table has a **Sound** switch by its Deal button, off until pressed,
and a panel that plays each sound. Card sounds from Kenney's
[Casino Audio](https://kenney.nl/assets/casino-audio), CC0;
[docs/credits.md](./docs/credits.md) names the files and what was done to them.

## Card backs

One home for the backs of the cards, for every card game in the family: this
package's tables, [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) and
[itsutsu.com](https://itsutsu.com). Three backs, drawn for Toranpu as SVG in
the same 100 by 140 box as every card: a classic red and a classic blue in the
manner of a casino back, and ink with dots.

```ts
import { cardBackSvg, cardBackUrl } from "@johnmorrisdotca/toranpu/card-backs";

cardBackSvg("classic-blue", { width: 70 });                    // '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" width="70" height="98" …'
cardBackUrl("ink-dots", { colour: "#8f2826", mark: "五つ" });  // "data:image/svg+xml;charset=utf-8,…": for an <img>, a CSS background or a canvas
```

| Back | Looks like |
| --- | --- |
| `classic-red` | a fine lattice on red inside a white border, a rosette in the middle |
| `classic-blue` | the same on blue |
| `ink-dots` | ivory dots on ink, the four suits in the middle |

| Option of `cardBackSvg` and `cardBackUrl` | Means | Unless said |
| --- | --- | --- |
| `colour` | the field's colour: a hex colour, a name, or `rgb()`, `hsl()`, `oklch()` | the back's own |
| `ink` | the colour of the lines and dots | the back's own |
| `paper` | the colour of the border | the back's own |
| `mark` | up to twelve characters in the middle, such as a site's name, in place of the ornament | none |
| `width` | pixels wide; the height is 1.4 times it | none: it fills what holds it |
| `title` | what a screen reader says | nothing: it is decoration |
| `art` | your own artwork for the whole back: SVG markup in the 100 by 140 box, in place of the lattice and the ornament | none |
| `image` | your own picture for the whole back: a `data:image/` address, an `https:` address or one on your own site | none |
| `logo` | your logo in the middle: SVG markup in a 100 by 100 box, or a picture's address; on a plate over the lattice, as it is over your own `art` or `image` | none |
| `logoSize` | how wide the logo is drawn, in units of the card's 100: at most 80 | `34` |

A colour that is not one is ignored rather than written into the drawing, and
the mark is escaped, so neither can put markup into a page. Drawn into a page
with no colour given, a back takes the CSS custom properties
`--toranpu-back`, `--toranpu-back-ink` and `--toranpu-back-paper` where they
are set, so a site's theme can recolour every back at once; as an image it
keeps its own colours. Each back is under 5 kB of SVG.

Your own back can be kept under a name, so that `back="frontier"` asks for it
on every card, hand, pile and table of the page: see
[Your own branding](#your-own-branding).

## Card designs

The faces of the cards, drawn as SVG in the same 100 by 140 box as the backs.
Plain is the default; four colour and the English pattern are there to
choose. A card is a picture, never text: its letters cannot be selected by a
drag or a long press.

```ts
import { cardFaceSvg, cardFaceUrl, loadCardDesign } from "@johnmorrisdotca/toranpu/card-faces";

cardFaceSvg("QS");                                    // '<svg … role="img" aria-label="queen of spades" …>…': the plain queen of spades
cardFaceUrl("TD", { design: "four-colour" });         // "data:image/svg+xml;charset=utf-8,…": a blue ten of diamonds
const english = await loadCardDesign("english");      // the English pattern, fetched now and not before
cardFaceSvg("KS", { design: english, width: 120 });   // the traditional king of spades, 120 pixels wide
cardFaceSvg("RJ", { language: "ja" });                // the red joker, ジョーカー down its corners
cardFaceSvg("R1");                                    // a rules card: the rules of Hearts in five lines
```

| Design | What it is | Size |
| --- | --- | --- |
| `plain` | drawn for Toranpu: big corners, the pips laid out as a real deck lays them, kings, queens and jacks as their letter in a frame, jokers in a jester's cap | in the package's 35 kB (11 kB gzipped) with the cards' names |
| `four-colour` | plain, with diamonds blue and clubs green, as many poker players like them | the same |
| `english` | the traditional English pattern, with its drawn kings, queens and jacks, by Dmitry Fomin, who gave it to the public domain (CC0); his jokers too | 715 kB (166 kB gzipped), its own entry point, fetched only when asked for |
| `realistic` | Byron Knoll's public-domain deck, round pips and a shaded ace, with Fomin's kings, queens, jacks, ace of spades and jokers | 91 kB of its own, and the English pattern for its courts; its own entry point, fetched only when asked for |

| Option of `cardFaceSvg` and `cardFaceUrl` | Means | Unless said |
| --- | --- | --- |
| `design` | `"plain"`, `"four-colour"`, a design handed in (`ENGLISH_PATTERN`, or what `loadCardDesign` gives), or the name of a design the page registered | `"plain"` |
| `width` | pixels wide; the height is 1.4 times it | none: it fills what holds it |
| `title` | what a screen reader says; `""` for none | the card's name in `language` |
| `language` | `"en"` or `"ja"`, for the card's name and a joker's corner word | `"en"` |

- **Every card, and the extras of a real deck.** A card is its id, as
  everywhere in Toranpu (`"QS"`, `"TD"`). The extras a pack is sold with are
  there too, though no game here deals them: the jokers `"RJ"` and `"BJ"`, two
  rules cards, `"R1"` (the rules of Hearts) and `"R2"` (of Spades), and the
  blank `"BL"`, each drawn in every design and named in both languages.
  Anything else gives `null`. A table of your own may deal them, as wild
  cards or for the look of it.
- **A hand writes them as words too.** `JOKER` is the next joker, red then
  black; `RULES` the next rules card; `BLANK` the blank. A hand holds at most
  what a pack might (`EXTRA_LIMITS`): four jokers, two rules cards and two
  blanks.

  ```html
  <toranpu-hand cards="AS KH QD JC JOKER"></toranpu-hand>
  <toranpu-hand cards="JOKER JOKER RULES BLANK"></toranpu-hand>
  ```
- **The English pattern by import**, where a bundler should carry it:
  `import { ENGLISH_PATTERN } from "@johnmorrisdotca/toranpu/card-faces/english"`.
  **By name**, where it should be fetched only when somebody chooses it:
  `await loadCardDesign("english")`. The realistic design the same way:
  `REALISTIC` from `@johnmorrisdotca/toranpu/card-faces/realistic`, or
  `await loadCardDesign("realistic")`.
- **A design of your own** is `{ name, box: [width, height], art: { KS: "<path …/>", … } }`:
  each card's drawing inside an `<svg>` of that box. A card it has no drawing
  for is drawn by its `fallback` design if it names one (the realistic design
  names the English pattern), and otherwise plain. It can draw cards no deck
  has too, and be registered by name: see [Your own branding](#your-own-branding).
- Plain and four colour take the CSS custom properties under
  [The drawings](#the-drawings) when put into a page. The English pattern
  keeps its own colours, as a printed deck does.

The English pattern's 54 files, their licence and what was done to them are
listed in [docs/credits.md](./docs/credits.md). The plain and four-colour
faces were drawn for Toranpu.

## Your own branding

A site's own cards: its own backs, its own faces for the standard cards, and
cards no deck has. Toranpu draws them all, turns them over and lays them out
in hands, piles and tables, so a game of your own, or a standard game in your
own colours, looks like yours and not like a library's. The demo's panel does
this with invented cards, a game of territories each showing a place and a
soldier, a horse or a cannon, every picture drawn for the demo.

Nobody's trademark or artwork ships with Toranpu, and none should be put in a
page that is not yours to put it in. What follows only draws what you give it.

**A back of your own.** Colours and a logo, your own art, or a picture:

```ts
import { cardBackSvg, registerCardBack } from "@johnmorrisdotca/toranpu/card-backs";

registerCardBack("frontier", { base: "classic-blue", colour: "#2f4a3a", ink: "#e7d9a8", logo: shield });   // a logo on the lattice
registerCardBack("frontier-art", { art: ridges, logo: shield });                                          // art of your own, the logo on it
cardBackSvg("frontier", { width: 70 });                                                                    // or draw it straight away
```

```html
<toranpu-card back="frontier" card="KS" face-down flip></toranpu-card>
<toranpu-hand cards="AS KH" back="frontier-art" face-down></toranpu-hand>
<toranpu-card back-image="/art/back.jpg" back-logo="/art/logo.svg" card="KS" face-down></toranpu-card>
```

A registered back is its options with the built-in back it starts from
(`base`, the classic red unless said); an option given later wins. `back-image`
and `back-logo` on an element are the page's own picture and logo by address,
for a page that registers nothing.

**Faces of your own, for the standard cards or for cards no deck has.** A
design is `{ name, box, art, draw?, label?, frame?, fallback? }`. A card
it draws takes any id of letters, digits, `-`, `_`, `.` or `:` (up to forty),
and a hand or a pile written as text reads those ids beside the usual ones.

```ts
import { registerCardDesign } from "@johnmorrisdotca/toranpu/card-faces";

registerCardDesign({
  name: "frontier",
  box: [100, 140],
  art: { KS: kingOfSpades },                                  // a face for a standard card, as SVG
  draw: (card, { language }) => territory(card, language),    // cards no deck has; null for a card that is not one
  label: (card, language) => nameOf(card, language),          // what a screen reader says; null leaves the usual name
});
```

```html
<toranpu-card card="ridgeway-horse" design="frontier" flip></toranpu-card>
<toranpu-hand cards="AS KS ridgeway-horse wild" design="frontier"></toranpu-hand>
<toranpu-table game="hearts" design="frontier" back="frontier"></toranpu-table>
```

| Field of a design | Means | Unless said |
| --- | --- | --- |
| `name` | kebab case, up to forty characters; never one of the package's own (`plain`, `four-colour`, `english`, `realistic`) | required |
| `box` | the width and height each card's drawing is made in, fitted to the card's height and centred | required |
| `art` | each card's drawing by its id, inside an `<svg>` of `box`: `KS`, or any id of your own | required, empty if every card is drawn by `draw` |
| `draw(card, { language })` | a card's drawing worked out from its id, in `"en"` or `"ja"`, or `null` where the design has no such card | none |
| `label(card, language)` | what a screen reader says for the card; `null` leaves it to the card's usual name, or its id | the usual name, or the id |
| `frame` | `"paper"` draws the card's paper and edge under the art; `"none"` for art that fills the whole card and draws its own edge | `"paper"` |
| `fallback` | the design that draws a card this one does not | plain |

A card the design does not draw is drawn plain if it is a standard card, and
is nothing if it is not, so a mistyped id shows as an empty card with no name
rather than somebody else's. Registering a design or a back again under the
same name replaces it, and every element on the page draws again with it, even
one on the page before the registering. `registerCardDesign` and
`registerCardBack` are also exported from `@johnmorrisdotca/toranpu/element`,
for a page that loads only the tags. Names are listed by
`registeredCardDesigns()` and `registeredCardBacks()`, and forgotten by
`unregisterCardDesign(name)` and `unregisterCardBack(name)`.

**A face put into the card.** An element in the card with `slot="face"` (or
`slot="back"`) is drawn as that side, in the card's box, on the card's
paper, in place of the card's own. It is in the page only while the card lies
that way up, as the drawn face is. The card's `label` attribute says what a
screen reader hears, as the card has no name in any deck. Style it with
`::part(face)` and `::part(back)`.

```html
<toranpu-card label="Harbour, soldier" flip>
  <svg slot="face" viewBox="0 0 100 140">…</svg>
  <img slot="back" src="/art/back.svg" alt="">
</toranpu-card>
```

**A face drawn by a function.** The card's `face` property is a function from
a card's id and its context (`{ language, design }`) to SVG markup, drawn on
the card's paper in a box 100 by 140 (or a whole `<svg>`), or to an element,
or to `null` to draw the card as its design does:

```js
card.face = (id, { language }) => `<text x="50" y="70" text-anchor="middle">${id}</text>`;
```

`cardFaceFromArt(art, options?)` does the same for one picture with no design
registered: the card's paper under your art, as an SVG document.

**What is kept out.** The markup you give is your own, and it is drawn into
shadow roots and other people's pages as a string, so what could run or fetch
is taken out of it first: `<script>`, `<foreignObject>`, frames, animation
elements and `<style>`, every `on…` handler, and any `href` that is not a
picture or a `#fragment` of the drawing (`cleanMarkup`). A picture's address is
a `data:image/` address, an `https:` or `http:` address, an address on your own
site, or a file name; `javascript:` and every other kind is refused
(`safeImageUrl`). That is a guard for your own code, not a sanitiser for
strangers' files: never give it what a visitor typed. As an image of its own
(`cardBackUrl`, `cardFaceUrl`), a drawing can load only a `data:image/`
picture, which is how browsers treat a picture inside a picture.
