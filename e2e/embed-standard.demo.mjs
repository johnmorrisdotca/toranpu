import { expect, test } from "@playwright/test";
import { serve } from "./demo.mjs";

test("the shared builder previews a hand, card and pile and writes host formats", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.goto("http://toranpu.test/builder.html?lang=en");
  await expect(page.locator("html")).toHaveAttribute("data-ready", "true");
  await expect(page.locator("#bld-stage toranpu-hand")).toHaveAttribute("cards", "AS KH 10D");
  await expect(page.locator("#bld-code")).toContainText("toranpu-hand");
  await page.locator('[data-maker="card"]').click();
  await expect(page.locator("#bld-stage toranpu-card")).toBeVisible();
  await page.locator('#bld-formats [data-format="image"]').click();
  await expect(page.locator("#bld-code")).toContainText("/cards/plain/AS.svg");
  await page.locator('[data-maker="pile"]').click();
  await expect(page.locator("#bld-stage toranpu-pile")).toBeVisible();
  for (const format of ["iframe", "module", "react", "vue", "svelte", "angular", "html", "url"]) {
    await page.locator(`#bld-formats [data-format="${format}"]`).click();
    await expect(page.locator("#bld-code")).not.toHaveText("");
  }
  await expect(page.locator("#bld-code")).toContainText("/embed/pile/");
  await page.locator('[data-lang="ja"]').click();
  await expect(page.locator("#bld-maker-says")).toContainText("カードの山");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test("reflected attributes preserve card methods and structured hand getters", async ({ page }) => {
  await serve(page);
  await page.goto("http://toranpu.test/embed/?cards=AS%20KH%2010D");
  await expect(page.locator("toranpu-hand")).toBeVisible();
  const value = await page.locator("toranpu-hand").evaluate((element) => {
    element.size = "large";
    element.width = 80;
    element.theme = "dark";
    element.label = "Example hand";
    element.faceDown = "off";
    element.marked = ["AS"];
    return { cards: element.cards, width: element.getAttribute("width"), label: element.getAttribute("aria-label"), theme: element.style.colorScheme, hidden: element.getAttribute("face-down"), marked: element.getAttribute("marked"), hide: typeof element.hide, mark: typeof element.mark };
  });
  expect(value).toMatchObject({ cards: ["AS", "KH", "TD"], width: "80", label: "Example hand", theme: "dark", hidden: "off", marked: "AS", hide: "function", mark: "function" });
});

test("canonical iframe inputs stay text, validate choices and do not scroll", async ({ page }) => {
  await serve(page);
  const label = '<img src=x onerror="bad">';
  await page.goto(`http://toranpu.test/embed/?cards=AS%20KH%2010D&size=small&theme=dark&label=${encodeURIComponent(label)}`);
  const hand = page.locator("toranpu-hand");
  await expect(hand).toHaveAttribute("aria-label", label);
  expect(await page.locator("img").count()).toBe(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth && document.documentElement.scrollHeight <= window.innerHeight)).toBe(true);
  await page.goto("http://toranpu.test/embed/card/?card=not-a-card&width=Infinity");
  await expect(page.getByRole("status")).toHaveText(/valid card ids/);
});

test("the hand iframe forwards the same native JSON-safe event detail", async ({ page }) => {
  await serve(page);
  await page.route("http://host.test/", (route) => route.fulfill({ contentType: "text/html", body: '<script>window.messages=[];addEventListener("message",event=>{if(event.origin==="http://toranpu.test")messages.push(event.data);});</script><iframe src="http://toranpu.test/embed/?cards=AS%20KH&closed=1&reveal=1"></iframe>' }));
  await page.goto("http://host.test/");
  const child = page.frameLocator("iframe");
  await child.locator("toranpu-hand").click();
  await expect.poll(() => page.evaluate(() => window.messages.some((message) => message.type === "toranpu-hand"))).toBe(true);
  const message = await page.evaluate(() => window.messages.find((made) => made.type === "toranpu-hand"));
  expect(message.detail).toMatchObject({ faceDown: false, scrunched: false });
  expect(JSON.parse(JSON.stringify(message))).toEqual(message);
});
