// A page's own branding, in a real browser: a design and backs registered by name, cards no deck has, a face put in as a slot,
// a face drawn by a function; and the branding panel of the demo.
import { expect, test } from "@playwright/test";

import { open, serve, tap } from "./demo.mjs";

async function bare(page, html, script) {
  const errors = [];
  page.on("pageerror", (error) => errors.push(String(error)));
  await serve(page);
  await page.route("http://toranpu.test/bare.html", (route) =>
    route.fulfill({ contentType: "text/html", body: `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>${html}<script type="module">import { registerCardDesign, registerCardBack } from "./dist/element-define.js"; ${script}; document.body.dataset.ready = "yes";</script></body></html>` }),
  );
  await page.goto("http://toranpu.test/bare.html");
  await page.waitForSelector("body[data-ready=yes]");
  return errors;
}

const REGISTER = `registerCardDesign({ name: "shop", box: [100, 140], art: { KS: '<rect width="100" height="140" fill="#123456"/>' }, draw: (card, { language }) => card === "gold" ? '<circle cx="50" cy="70" r="30" fill="#c98b2b" onclick="alert(1)"/><text x="50" y="76" text-anchor="middle" font-size="14">' + (language === "ja" ? "金" : "gold") + '</text><script>alert(1)<\\/script>' : null, label: (card, language) => card !== "gold" ? null : language === "ja" ? "金のカード" : "the gold card" });
registerCardBack("shop", { colour: "#224422", logo: '<circle cx="50" cy="50" r="40" fill="gold"/>' });`;

const inside = (page, selector) => page.locator(selector).evaluate((card) => ({ label: card.getAttribute("aria-label"), face: card.shadowRoot.querySelector(".face").innerHTML, back: card.shadowRoot.querySelector(".back").innerHTML }));

test("a card of a registered design is drawn, named for a screen reader, and kept clean", async ({ page }) => {
  const errors = await bare(page, '<toranpu-card id="g" card="gold" design="shop" back="shop" flip></toranpu-card><toranpu-card id="k" card="KS" design="shop"></toranpu-card><toranpu-card id="q" card="QS" design="shop"></toranpu-card><toranpu-card id="n" card="nothing" design="shop"></toranpu-card>', REGISTER);
  const gold = await inside(page, "#g");
  expect(gold.label).toBe("the gold card");
  expect(gold.face).toContain(">gold<");
  expect(gold.face).toContain('fill="#c98b2b"');
  expect(gold.face).not.toContain("onclick");
  expect(gold.face).not.toContain("<script");
  expect(gold.back).toBe("");
  // A standard card the design draws is the design's; one it does not is drawn plain; a card nobody draws is nothing.
  expect((await inside(page, "#k")).face).toContain('fill="#123456"');
  expect((await inside(page, "#q")).face).toContain("var(--toranpu-card-ink,#1b1b1b)");
  expect((await inside(page, "#n")).label).toBe("");
  // Turned over, it shows the page's back, with the logo, and the face is gone.
  await tap(page, "#g");
  await expect(page.locator("#g")).toHaveAttribute("aria-label", "a card, face down");
  const turned = await inside(page, "#g");
  expect(turned.face).toBe("");
  expect(turned.back).toContain('fill="#224422"');
  expect(turned.back).toContain('fill="gold"');
  expect(errors).toEqual([]);
});

test("a custom card speaks Japanese when the page does, and a hand holds custom and standard cards together", async ({ page }) => {
  const errors = await bare(page, '<toranpu-card id="g" card="gold" design="shop" lang="ja"></toranpu-card><toranpu-hand id="h" cards="AS gold KS" design="shop" back="shop"></toranpu-hand><toranpu-pile id="p" cards="gold 2C" design="shop"></toranpu-pile>', REGISTER);
  expect((await inside(page, "#g")).label).toBe("金のカード");
  expect((await inside(page, "#g")).face).toContain(">金<");
  await expect(page.locator("#h")).toHaveAttribute("aria-label", "Hand: ace of spades, the gold card, king of spades");
  expect(await page.locator("#h").evaluate((hand) => hand.cards)).toEqual(["AS", "gold", "KS"]);
  await expect(page.locator("#p")).toHaveAttribute("aria-label", "a pile, two of clubs on top, cards: 2");
  expect(errors).toEqual([]);
});

test("a face and a back put in as slots replace the card's own, and are in the page only on their own side", async ({ page }) => {
  const errors = await bare(
    page,
    '<toranpu-card id="s" label="Our card" flip><svg slot="face" viewBox="0 0 10 10" id="f"><rect width="10" height="10" fill="red"/></svg><svg slot="back" viewBox="0 0 10 10" id="b"><rect width="10" height="10" fill="blue"/></svg></toranpu-card><toranpu-card id="r" card="77"></toranpu-card>',
    "document.getElementById('r').face = (card) => '<text x=\"50\" y=\"70\" text-anchor=\"middle\">' + card + '</text>';",
  );
  await expect(page.locator("#s")).toHaveAttribute("aria-label", "Our card");
  expect((await inside(page, "#s")).face).toContain('<slot name="face">');
  expect((await inside(page, "#s")).back).toBe("");
  expect(await page.locator("#f").evaluate((svg) => svg.assignedSlot?.name)).toBe("face");
  expect(await page.locator("#b").evaluate((svg) => svg.assignedSlot)).toBeNull();
  await tap(page, "#s");
  await expect(page.locator("#s")).toHaveAttribute("aria-label", "a card, face down");
  expect((await inside(page, "#s")).face).toBe("");
  expect(await page.locator("#b").evaluate((svg) => svg.assignedSlot?.name)).toBe("back");
  expect(await page.locator("#f").evaluate((svg) => svg.assignedSlot)).toBeNull();
  // A face from a function, for a card no design knows.
  expect((await inside(page, "#r")).face).toContain(">77<");
  expect(errors).toEqual([]);
});

test("backs of a page's own by attribute: a picture, a logo, colours and words; and an address that is not a picture is refused", async ({ page }) => {
  const errors = await bare(
    page,
    '<toranpu-card id="a" card="2C" face-down back-image="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\'/%3E"></toranpu-card><toranpu-card id="b" card="2C" face-down back-logo="/logo.png" back-colour="#336699"></toranpu-card><toranpu-card id="c" card="2C" face-down back-image="javascript:alert(1)"></toranpu-card>',
    "",
  );
  expect((await inside(page, "#a")).back).toContain("<image");
  const logo = (await inside(page, "#b")).back;
  expect(logo).toContain('<image href="/logo.png"');
  expect(logo).toContain('fill="#336699"');
  const refused = (await inside(page, "#c")).back;
  expect(refused).not.toContain("javascript");
  expect(refused).not.toContain("<image");
  expect(errors).toEqual([]);
});

test("the demo's branding panel shows territory cards, three kinds of back and a card put in as a slot, in both languages", async ({ page }) => {
  const errors = await open(page, "");
  const row = page.locator('[data-testid="brand-hand"] toranpu-card');
  await expect(row).toHaveCount(7);
  await expect(row.first()).toHaveAttribute("aria-label", "Ridgeway (soldier)");
  await expect(row.last()).toHaveAttribute("aria-label", "Wild card");
  await tap(page, '[data-testid="brand-turn"]');
  await expect(row.first()).toHaveAttribute("aria-label", "a card, face down");
  await expect(page.locator('[data-testid="brand-backs"] toranpu-card')).toHaveCount(4);
  await expect(page.locator("#brand-slot")).toHaveAttribute("aria-label", "a card, face down");
  await tap(page, '[data-testid="brand-turn"]');
  await expect(row.first()).toHaveAttribute("aria-label", "Ridgeway (soldier)");
  expect(await page.locator("#brand-fn").evaluate((card) => card.shadowRoot.querySelector(".face").innerHTML.includes(">42<"))).toBe(true);
  expect(errors).toEqual([]);
});
