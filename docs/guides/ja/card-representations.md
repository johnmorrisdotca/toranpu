---
title: カードの表し方と配置
section: explanation
order: 8
description: カードの表し方と配置の使い方と注意点。
---

## 3 種類の表し方

deck エントリーは `{ suit, rank }`のオブジェクトで、名前付きのスートと 1〜13 のランクです。11 種類のゲームは `AS`、`KH`、`TD`などの短い ID を使います。ソリティアはスートとランクの順の 0〜51 の番号です。スパイダーは選んだスートを繰り返し、104 枚のデッキにします。表し方を変える場合は本来の変換関数を使います。

```ts
import { cardFromId, cardId, cardIndex, dealRound, shuffledDeck } from "@johnmorrisdotca/toranpu/deck";
import { cardOfId } from "@johnmorrisdotca/toranpu";

const card = cardFromId("AS")!;
console.log(card, cardId(card), cardIndex(card));
console.log(cardOfId("AS"));
console.log(dealRound(shuffledDeck(42), 4, 5).hands.map((hand) => hand.length));
```

## 配置はゲームの状態ではない

手札や山札の配置は座標と角度です。表示の並べ替え、シャッフル、分割、カードの取り除きはゲームの手を進めません。登録した絵柄で描ける独自の ID でも、標準のデッキのゲームでは使えない場合があります。

## 読み上げと見分け方

カードと手の文言をラベルに使い、色だけでなくスートの形も使います。4 色の絵柄は表示の選択で、ゲームのスートは変わりません。`faceName` と `cardText`は、それぞれ表示用とゲーム用のエントリーで同じ標準 ID を説明できます。
