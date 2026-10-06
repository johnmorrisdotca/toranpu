import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unicorn from "eslint-plugin-unicorn";

const browser = Object.fromEntries(["document", "window", "location", "history", "navigator", "setTimeout", "clearTimeout", "console", "URLSearchParams", "familyLanguage", "localStorage", "customElements", "requestAnimationFrame", "matchMedia", "navigator", "HTMLElement", "URL", "Blob", "encodeURIComponent"].map((name) => [name, "readonly"]));

export default tseslint.config(
  { ignores: [".readme-examples/", "dist/", "site/", "node_modules/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["scripts/**/*.mjs"], languageOptions: { globals: { console: "readonly", URL: "readonly", document: "readonly", window: "readonly", Buffer: "readonly", MutationObserver: "readonly", setTimeout: "readonly" } } },
  { files: ["e2e/**/*.mjs", "playwright.config.mjs"], languageOptions: { globals: { console: "readonly", URL: "readonly", document: "readonly", window: "readonly", location: "readonly", AudioBufferSourceNode: "readonly", getComputedStyle: "readonly", matchMedia: "readonly", DOMParser: "readonly", customElements: "readonly", requestAnimationFrame: "readonly", MutationObserver: "readonly" } } },
  { files: ["demo/**/*.js"], languageOptions: { globals: browser } },
  { files: ["src/**/*.test.js"], languageOptions: { globals: { atob: "readonly", setTimeout: "readonly" } } },
  { files: ["src/**/*.ts", "scripts/**/*.mjs", "demo/**/*.js", "e2e/**/*.mjs"], plugins: { unicorn }, rules: { "unicorn/filename-case": ["error", { case: "kebabCase" }] } },
  { files: ["scripts/readme-pictures.mjs", "scripts/readme-pictures-lib.mjs"], languageOptions: { globals: { console: "readonly", process: "readonly", window: "readonly", document: "readonly", localStorage: "readonly", getComputedStyle: "readonly", URL: "readonly", URLSearchParams: "readonly" } }, rules: { "no-redeclare": ["error", { builtinGlobals: false }] } },
);
