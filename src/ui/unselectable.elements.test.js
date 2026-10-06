// Every element's host is never selectable: a card, a hand or a pile is never text to highlight.
// Plain JavaScript, so that reading files needs no Node types.
import { readFileSync } from "node:fs";

import { expect, it } from "vitest";

it("keeps every element's letters from being selected: a card, a hand and a pile", () => {
  for (const file of ["card-element.ts", "hand-element.ts", "pile-element.ts"]) {
    expect(readFileSync(`src/ui/${file}`, "utf8"), file).toMatch(/:host \{[^}]*user-select: none; -webkit-user-select: none;/);
  }
});
