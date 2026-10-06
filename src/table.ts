/**
 * `<toranpu-table>`: any of the ten games, ready to play on a page — the seats, the felt in any of the family's
 * cloths, the trick and the piles (the stock and the discard as `<toranpu-pile>`, as untidy as asked), the hand of
 * whoever is to play and the moves they may make, with computers in every other seat.
 *
 * ```html
 * <script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/toranpu@2/dist/table-define.js"></script>
 * <toranpu-table game="crazy-eights" players="3" cloth="blue" messiness="0.4"></toranpu-table>
 * ```
 *
 * This entry carries the rules of all ten games, so it is its own: a page that wants only a card or a hand
 * imports `./element`. `defineToranpuTable()` registers it, and the card, hand and pile elements it lays out.
 */
import { defineToranpuElements } from "./element.ts";
import { ToranpuTable } from "./ui/table-element.ts";

export { TABLE_CLOTHS, ToranpuTable } from "./ui/table-element.ts";
export type { TableCloth } from "./ui/table-element.ts";

/** Registers `<toranpu-table>`, and the card, hand and pile elements, once. Nothing happens where there is no browser. */
export function defineToranpuTable(): void {
  if (typeof customElements === "undefined") return;
  defineToranpuElements();
  if (customElements.get("toranpu-table") === undefined) customElements.define("toranpu-table", ToranpuTable);
}
