/**
 * The custom elements, registered by being imported:
 *
 *   <script type="module" src="…/dist/element-define.js"></script>
 *   <toranpu-card card="QS" flip></toranpu-card>
 *
 * This is the one module of the package that does something when it is
 * imported, and `package.json` says so, so that a bundler keeps it.
 * `./element` exports the same classes and `defineToranpuElements()` with no
 * effect of its own, for a page that wants to choose when.
 */
import { defineToranpuElements } from "./element.ts";

export * from "./element.ts";

defineToranpuElements();
