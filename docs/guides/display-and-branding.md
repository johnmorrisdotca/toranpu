---
title: Display and brand cards
section: how-to
order: 4
description: Draw cards and backs as SVG, register your own designs, and show them with elements.
---

## Use the native SVG

The [card-faces entry](entry:card-faces) draws card ids as SVG or data URLs, with plain and four-colour designs. English-pattern and realistic artwork have separate entries and can be loaded by `loadCardDesign`. The [back entry](entry:card-backs) offers built-in and registered backs.

```ts
import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";
import { cardBackSvg, registerCardBack, unregisterCardBack } from "@johnmorrisdotca/toranpu/card-backs";

registerCardBack("club-back", { base: "classic-blue", mark: "JM" });
console.log(cardBackSvg("club-back", { width: 80 }).slice(0, 140));
console.log(cardFaceSvg("AS", { design: "four-colour", width: 80 })?.slice(0, 140));
unregisterCardBack("club-back");
```

## Register your own design

A `CardDesign` supplies a name, box dimensions and artwork keyed by card id, optionally a draw function, labels and fallback. Custom ids can be drawn without becoming cards accepted by the eleven game engines. The native markup and image-URL helpers sanitize supplied artwork; use their existing contract rather than inserting raw markup yourself.

## Put it in an element

`toranpu-card`, `toranpu-hand` and `toranpu-pile` use the same registered designs and backs. The builder previews actual native elements and copies the corresponding host or frame code. [Cards](../CARDS.md), [branding](../CARDS.md#your-own-branding) and [elements](../ELEMENTS.md) preserve the detailed options and methods.
