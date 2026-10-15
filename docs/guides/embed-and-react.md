---
title: Embed cards or use React
section: how-to
order: 6
description: Register the card tags, use the builder, and drive a table from React hooks.
---

## Register the native tags

The element definition entry registers card, hand and pile tags. The table definition is separate. Importing a pure game engine does not register either.

```ts no-run
import "@johnmorrisdotca/toranpu/element/define";

const hand = document.createElement("toranpu-hand");
hand.setAttribute("cards", "AS KH TD");
hand.setAttribute("back", "classic-blue");
hand.setAttribute("design", "four-colour");
document.body.append(hand);
console.log(hand.getAttribute("cards"));
```

## Use the builder

Choose a card, hand or pile, preview the native element and copy the code. The shared builder supplies module, element, iframe, framework and plain-HTML formats. Its URL contains setup; the standard frame validates parameters. Host-only callbacks and custom renderers belong in host code. [Elements and events](../ELEMENTS.md) document reflected settings and JSON-safe messages.

## Use the state hook

The React hook holds the game and computer-turn timing; drawing is the component’s job. Give it actual setup and render its native legal moves. Restart explicitly for changed setup.

```ts no-run
import { createElement } from "react";
import { moveText } from "@johnmorrisdotca/toranpu";
import { useCardGame } from "@johnmorrisdotca/toranpu/react";

const setup = { players: ["You", "Aki", "Ben", "Cy"], computers: [false, true, true, true], seed: 42 };
export function Table() {
  const table = useCardGame("hearts", setup);
  return createElement("div", null, ...table.moves.map((move, index) =>
    createElement("button", { key: index, onClick: () => table.play(move) }, moveText("hearts", move))));
}
```

## Sound and disposal

Sound loads lazily after it is requested and may stay off. Removing native elements disposes their work; React removes its scheduled computer turn on unmount. A directly owned sound handle should be closed.
