---
title: カードの表し方と配置
section: explanation
order: 8
description: カードの3種類の表し方を知り、配置や読み上げの名前をゲームの状態と分けて扱います。
---

## 3種類の表し方

deckエントリーは`{ suit, rank }`のオブジェクトで、名前付きのスートと1〜13のランクです。11種類のゲームは`AS`、`KH`、`TD`などの短いIDを使います。ソリティアはスートとランクの順の0〜51の番号です。スパイダーは選んだスートを繰り返し、104枚のデッキにします。表し方を変える場合は本来の変換関数を使います。

```ts
import { cardFromId, cardId, cardIndex, dealRound, shuffledDeck } from "@johnmorrisdotca/toranpu/deck";
import { cardOfId } from "@johnmorrisdotca/toranpu";

const card = cardFromId("AS")!;
console.log(card, cardId(card), cardIndex(card));
console.log(cardOfId("AS"));
console.log(dealRound(shuffledDeck(42), 4, 5).hands.map((hand) => hand.length));
```

## 配置はゲームの状態ではない

手札や山札の配置は座標と角度です。表示の並べ替え、シャッフル、分割、カードの取り除きはゲームの手を進めません。登録した絵柄で描ける独自のIDでも、標準のデッキのゲームでは使えない場合があります。

## 読み上げと見分け方

カードと手の文言をラベルに使い、色だけでなくスートの形も使います。4色の絵柄は表示の選択で、ゲームのスートは変わりません。`faceName`と`cardText`は、それぞれ表示用とゲーム用のエントリーで同じ標準IDを説明できます。
