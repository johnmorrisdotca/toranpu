---
title: Card representations and layouts
section: explanation
order: 8
description: Learn card representations and layouts.
---

## Three representations

The deck entry uses `{ suit, rank }` objects: named suits and ranks 1–13. The eleven games use short card ids such as `AS`, `KH` and `TD`. Solitaires use numbers 0–51 in suit/rank order; Spider repeats the selected suits in its 104-card deck. Use native conversion helpers when crossing boundaries.

```ts
import { cardFromId, cardId, cardIndex, dealRound, shuffledDeck } from "@johnmorrisdotca/toranpu/deck";
import { cardOfId } from "@johnmorrisdotca/toranpu";

const card = cardFromId("AS")!;
console.log(card, cardId(card), cardIndex(card));
console.log(cardOfId("AS"));
console.log(dealRound(shuffledDeck(42), 4, 5).hands.map((hand) => hand.length));
```

## Layout is not game state

A hand or pile layout gives drawing coordinates and rotations. Ordering, shuffling, parting and tossing cards for display do not apply game rules. A custom drawable card id may be valid in a registered design while being invalid for the standard deck’s game engine.

## Accessible descriptions

Use card and move wording for labels, and the native designs’ suit shapes as well as colour. Four-colour faces are a display choice; game suits remain the same. `faceName` and `cardText` can describe the same standard id through their respective presentation and game entries.
