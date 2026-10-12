---
title: カードの表示と絵柄
section: how-to
order: 4
description: カードの表示と絵柄の使い方と注意点。
---

## 本来の SVG を使う

[card-faces](entry:card-faces)はカード ID を SVG やデータ URL にし、通常と 4 色の絵柄を表示します。イングリッシュパターンと写実的な絵柄には別のエントリーがあり、`loadCardDesign`でも読み込めます。[裏面](entry:card-backs)には組み込みと登録したデザインがあります。

```ts
import { cardFaceSvg } from "@johnmorrisdotca/toranpu/card-faces";
import { cardBackSvg, registerCardBack, unregisterCardBack } from "@johnmorrisdotca/toranpu/card-backs";

registerCardBack("club-back", { base: "classic-blue", mark: "JM" });
console.log(cardBackSvg("club-back", { width: 80 }).slice(0, 140));
console.log(cardFaceSvg("AS", { design: "four-colour", width: 80 })?.slice(0, 140));
unregisterCardBack("club-back");
```

## 自分の絵柄を登録する

`CardDesign`には名前、大きさ、ID ごとの絵を入れ、描画関数、読み上げ、代替の絵柄も指定できます。独自の ID を描けますが、それが 11 種類のゲームで使えるカードになるわけではありません。マークアップと画像 URL の関数が内容を確認するので、無確認のマークアップを直接入れず、その契約を使います。

## 要素で表示する

`toranpu-card`、`toranpu-hand`、`toranpu-pile`は同じ絵柄と裏面を使います。ビルダーは本来の要素でプレビューし、表示先やフレームのコードをコピーできます。[カード](../../CARDS.md)、[絵柄](../../CARDS.md#your-own-branding)、[要素](../../ELEMENTS.md)に詳しい設定とメソッドがあります。
