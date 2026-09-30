import js from "@eslint/js";
import tseslint from "typescript-eslint";

const browser = Object.fromEntries(["document", "window", "location", "history", "navigator", "setTimeout", "clearTimeout", "console", "URLSearchParams", "familyLanguage"].map((name) => [name, "readonly"]));

export default tseslint.config(
  { ignores: ["dist/", "site/", "node_modules/", "test-results/", "playwright-report/"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  { files: ["scripts/**/*.mjs"], languageOptions: { globals: { console: "readonly", URL: "readonly", document: "readonly", window: "readonly", Buffer: "readonly", MutationObserver: "readonly", setTimeout: "readonly" } } },
  { files: ["e2e/**/*.mjs", "playwright.config.mjs"], languageOptions: { globals: { console: "readonly", URL: "readonly", document: "readonly", window: "readonly", location: "readonly" } } },
  { files: ["demo/**/*.js"], languageOptions: { globals: browser } },
);
