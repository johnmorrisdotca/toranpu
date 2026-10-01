/**
 * `<toranpu-table>`, registered by being imported:
 *
 *   <script type="module" src="…/dist/table-define.js"></script>
 *   <toranpu-table game="hearts"></toranpu-table>
 *
 * Like `element-define`, the one kind of module here that does something when imported, and `package.json` says so.
 */
import { defineToranpuTable } from "./table.ts";

export * from "./table.ts";

defineToranpuTable();
