import { expect, test } from "@playwright/test";
import { serve, tap } from "./demo.mjs";

for (const path of ["/", "/builder.html"]) {
  test(`the Docs link follows the selected language on ${path}`, async ({ page }) => {
    await serve(page);
    await page.goto(`http://toranpu.test${path}?lang=ja`);
    const docs = page.locator('[data-say="pageDocs"]');
    await expect(docs).toHaveText("ドキュメント");
    await expect(docs).toHaveAttribute("href", "docs/ja/index.html");
    await tap(page, '[data-lang="en"]');
    await expect(docs).toHaveAttribute("href", "docs/index.html");
    await tap(page, '[data-lang="ja"]');
    await tap(page, '[data-say="pageDocs"]');
    await expect(page).toHaveURL("http://toranpu.test/docs/ja/index.html");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  });
}
