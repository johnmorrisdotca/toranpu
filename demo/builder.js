import { VERSION } from "./dist/index.js";
import { ToranpuCard, ToranpuHand, ToranpuPile, readHand } from "./dist/element.js";
import { CARD_DESIGNS, faceName, isCardFace } from "./dist/card-faces.js";
import { CARD_BACKS } from "./dist/card-backs.js";
import "./dist/element-define.js";
import { familyEmbedBuilder } from "./family-embed-builder.js";

const words = {
  en: { pitch: "Arrange a hand, card or pile, preview it, and copy the code for your page.", name: "Toranpu is the Japanese word for playing cards.", nameLink: "About the name", foot: "The setup is in the link. No game or personal data is stored.", toGallery: "The card table",
    previewTitle: "Your cards", makerLabel: "What to build", makerHand: "A hand", makerCard: "One card", makerPile: "A pile", makerHandSays: "A hand for a strategy article or a card display.", makerCardSays: "One card in the chosen design.", makerPileSays: "A stock or discard pile.",
    notSet: "Not set", on: "On", off: "Off", reset: "Reset", startAgain: "Start again", copy: "Copy", copied: "Copied.", copyLink: "Copy a link to these cards", linkCopied: "The link is copied.", codeTitle: "The code", codeText: "Choose how to include these cards on your page.", defaultIs: "Default: {value}", badCards: "Use valid card ids, such as AS KH 10D." },
  ja: { pitch: "手札、カード、山札を選んで表示を確認し、ページに載せるコードをコピーします。", name: "「トランプ」は playing cards に当たる日本語です。", nameLink: "名前について", foot: "設定はリンクに入ります。ゲームや個人情報は保存しません。", toGallery: "カードテーブル",
    previewTitle: "あなたのカード", makerLabel: "作るもの", makerHand: "手札", makerCard: "カード1枚", makerPile: "山札", makerHandSays: "攻略記事やカードの表示に使う手札です。", makerCardSays: "選んだデザインのカード1枚です。", makerPileSays: "山札や捨て札の山です。",
    notSet: "指定なし", on: "オン", off: "オフ", reset: "元に戻す", startAgain: "最初からやり直す", copy: "コピー", copied: "コピーしました。", copyLink: "このカードへのリンクをコピー", linkCopied: "リンクをコピーしました。", codeTitle: "コード", codeText: "ページへの載せ方を選びます。", defaultIs: "初期値: {value}", badCards: "AS KH 10D のような、有効なカードの記号を使ってください。" },
};
const both = (name) => ({ hand: name, card: name, pile: name });
const row = (id, kind, names, en, ja, extra = {}) => ({ id, group: "cards", kind, names, say: { en: { label: en[0], help: en[1] }, ja: { label: ja[0], help: ja[1] } }, ...extra });
const options = [
  row("cards", "text", { hand: "cards", pile: "cards" }, ["Cards", "Card ids separated by spaces, such as AS KH 10D."], ["カード", "AS KH 10D のように、記号を空白で区切ります。"], { default: "AS KH 10D" }),
  row("card", "text", { card: "card" }, ["Card", "One card id, such as AS."], ["カード", "AS のようなカード1枚の記号です。"], { default: "AS" }),
  row("size", "choice", both("size"), ["Display size", "Small, medium or large cards."], ["表示の大きさ", "小・中・大のカードを選びます。"], { default: "medium", choices: ["small", "medium", "large"] }),
  row("width", "number", both("width"), ["Card width", "Each card's width in pixels."], ["カードの幅", "カード1枚の幅をピクセルで指定します。"], { range: { min: 20, max: 300, step: 2 } }),
  row("design", "choice", both("design"), ["Design", "The artwork used for the card faces."], ["デザイン", "カードの表に使う絵柄です。"], { default: "plain", choices: CARD_DESIGNS }),
  row("back", "choice", both("back"), ["Back", "The artwork on the reverse."], ["裏面", "カードの裏に使う絵柄です。"], { default: "classic-red", choices: CARD_BACKS }),
  row("back-colour", "colour", both("back-colour"), ["Back colour", "An optional colour for the back."], ["裏面の色", "裏面の色を指定します。指定は任意です。"]),
  row("lang", "choice", both("lang"), ["Language", "The language of the spoken card names."], ["言語", "読み上げるカード名の言語です。"], { choices: ["en", "ja"] }),
  row("label", "text", both("label"), ["Spoken label", "An optional label for a screen reader."], ["読み上げる名前", "スクリーンリーダー用の名前です。指定は任意です。"]),
  row("theme", "choice", both("theme"), ["Theme", "Light, dark or the device's preference."], ["配色", "明るい配色・暗い配色、または端末の設定に合わせます。"], { default: "auto", choices: ["auto", "light", "dark"] }),
  row("sound", "boolean", { card: "sound", hand: "sound" }, ["Sound", "Play a card sound during an action."], ["音", "操作に合わせてカードの音を出します。"], { default: false }),
  row("face-down", "boolean", both("face-down"), ["Face down", "Show the backs of the cards."], ["裏向き", "カードの裏を表示します。"], { default: false }),
  row("flip", "boolean", { card: "flip" }, ["Flip on tap", "Allow a tap or keyboard action to turn the card."], ["めくる操作", "タップやキー操作でカードをめくります。"], { default: false }),
  row("reveal", "boolean", { hand: "reveal" }, ["Open on tap", "Allow the closed hand to open and close."], ["開く操作", "閉じた手札を開いたり、閉じたりします。"], { default: false }),
  row("closed", "number", { hand: "closed" }, ["Closed amount", "Zero is an open fan; one is closed."], ["閉じる度合い", "0では開いた扇形、1では閉じた手札です。"], { default: 0, range: { min: 0, max: 1, step: 0.1 } }),
  row("scrunched", "boolean", { hand: "scrunched" }, ["Bundle", "Square the hand into a bundle."], ["束", "手札を1つの束にまとめます。"], { default: false }),
  row("order", "choice", { hand: "order" }, ["Order", "Sort by rank, suit or face."], ["並べ方", "数字・スート・絵札で並べます。"], { choices: ["rank", "suit", "face"] }),
  row("turned", "text", { hand: "turned" }, ["Turned cards", "Cards showing the opposite side."], ["反対向きのカード", "ほかのカードと反対の面を表示するカードです。"]),
  row("parted", "text", { hand: "parted" }, ["Part at card", "Lift one card out of the fan."], ["取り出すカード", "扇形の手札からカード1枚を取り出します。"]),
  row("marked", "text", { hand: "marked" }, ["Marked cards", "Card ids that carry the mark."], ["印を付けるカード", "印を付けるカードの記号です。"]),
  row("card-marked", "boolean", { card: "marked" }, ["Marked", "Put the chosen mark on this card."], ["印", "このカードに選んだ印を付けます。"], { default: false }),
  row("mark", "text", both("mark"), ["Mark", "The mark drawn on marked cards."], ["印の種類", "印を付けたカードに表示する印です。"]),
  row("count", "number", { pile: "count" }, ["Count", "A face-down pile's number of cards."], ["枚数", "裏向きの山札の枚数です。"], { range: { min: 0, max: 200, step: 1 } }),
  row("messiness", "number", { pile: "messiness" }, ["Messiness", "Zero is neat; one is very messy."], ["散らばり", "0では整った山、1では大きく散らばった山です。"], { default: 0.3, range: { min: 0, max: 1, step: 0.1 } }),
  row("seed", "number", { pile: "seed" }, ["Seed", "The same seed gives the same pile."], ["シード", "同じシードで同じ山になります。"], { default: 1, range: { min: 0, max: 1000000, step: 1 } }),
  row("depth", "number", { pile: "depth" }, ["Visible depth", "How many cards under the top are drawn."], ["見える枚数", "一番上のカードの下に描く枚数です。"], { default: 10, range: { min: 1, max: 30, step: 1 } }),
];
const leftOut = {};
for (const kind of ["card", "hand", "pile"]) for (const name of ["back-image", "back-logo"]) leftOut[`${kind}.${name}`] = "Host-specific images and logos are supplied by the host, not by this static builder.";
leftOut["hand.receive"] = "Receive controls programmatic replacement, not the initial hand.";
leftOut["hand.deal-after"] = "Deal delay is for a table dealing hands over time.";
const formats = ["element", "iframe", "module", "react", "vue", "svelte", "angular", "html", "url"];
let mounted;
const page = globalThis.familyLanguage({ id: "toranpu", words, onChange: () => mounted?.draw() });
const builder = familyEmbedBuilder({ id: "toranpu", packageName: "@johnmorrisdotca/toranpu", major: VERSION.split(".")[0], site: "https://johnmorrisdotca.github.io/toranpu/", title: "Toranpu · cards", options, leftOut, groups: { cards: { en: "The cards", ja: "カードの設定" } },
  makers: {
    hand: { names: "hand", element: "hand", tag: "toranpu-hand", embed: "embed/", required: ["cards"], description: "makerHandSays", formats, width: 480, height: (settings) => ({ small: 160, medium: 200, large: 360 }[settings.size] ?? 200) },
    card: { names: "card", element: "card", tag: "toranpu-card", embed: "embed/card/", required: ["card"], description: "makerCardSays", formats: [...formats, "image"], width: (settings) => (Number(settings.width) || ({ small: 46, medium: 70, large: 104 }[settings.size] ?? 70)) + 8, height: (settings) => Math.ceil((Number(settings.width) || ({ small: 46, medium: 70, large: 104 }[settings.size] ?? 70)) * 1.4) + 8, image: (settings) => `https://johnmorrisdotca.github.io/toranpu/${settings["face-down"] ? `backs/${settings.back ?? "classic-red"}` : `cards/${settings.design ?? "plain"}/${settings.card ?? "AS"}`}.svg` },
    pile: { names: "pile", element: "pile", tag: "toranpu-pile", embed: "embed/pile/", description: "makerPileSays", formats, width: 360, height: 260 },
  }, code: ({ maker, format, settings, spec }) => {
    if (maker === "card" ? !isCardFace(String(settings.card ?? "AS").toUpperCase()) : readHand(settings.cards ?? "AS KH 10D") === null) return null;
    if (maker === "card" && format === "image") {
      const escape = (value) => String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
      const alt = settings.label ?? (settings["face-down"] ? page.lang === "ja" ? "裏向きのカード" : "A face-down card" : faceName(settings.card ?? "AS", settings.lang ?? page.lang));
      return `<img src="${escape(spec.image(settings))}" alt="${escape(alt)}" />`;
    }
    if ((format === "iframe" || format === "url") && settings.lang === undefined) return builder.codeFor(maker, format, options, { ...settings, lang: page.lang });
    return undefined;
  },
});
builder.validateCoverage({ hand: ToranpuHand.observedAttributes, card: ToranpuCard.observedAttributes, pile: ToranpuPile.observedAttributes });
mounted = builder.mount({ words, language: () => page, colourDefault: () => "#b5452c", initial: { hand: { cards: "AS KH 10D", lang: page.lang }, card: { card: "AS", lang: page.lang }, pile: { cards: "AS KH 10D", lang: page.lang } },
  renderPreview: ({ stage, maker, settings, attrs, note, say }) => {
    const valid = maker === "card" ? isCardFace(String(settings.card ?? "AS").toUpperCase()) : readHand(settings.cards ?? "AS KH 10D") !== null;
    if (!valid) { note.textContent = say("badCards"); return { destroy() {} }; }
    const element = globalThis.document.createElement(`toranpu-${maker}`);
    for (const [name, value] of attrs) element.setAttribute(name, value);
    stage.append(element);
    return { destroy() { element.remove(); } };
  },
});
