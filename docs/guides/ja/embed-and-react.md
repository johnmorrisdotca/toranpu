---
title: カードの埋め込み・React
section: how-to
order: 6
description: カードの埋め込み・Reactの使い方と注意点。
---

## タグを登録する

要素の定義用エントリーでカード、手札、山札を登録します。テーブルの定義は別です。基本エンジンだけでは登録されません。

```ts no-run
import "@johnmorrisdotca/toranpu/element/define";

const hand = document.createElement("toranpu-hand");
hand.setAttribute("cards", "AS KH TD");
hand.setAttribute("back", "classic-blue");
hand.setAttribute("design", "four-colour");
document.body.append(hand);
console.log(hand.getAttribute("cards"));
```

## ビルダーを使う

カード、手札、山札を選び、本来の要素で確認してコードをコピーします。共通のビルダーにはモジュール、要素、iframe、フレームワーク、HTML の形式があります。URL には設定が入り、標準フレームはパラメーターを確認します。通知関数や独自の描画は表示先のコードに置きます。[要素とイベント](../../ELEMENTS.md)に対応する設定と JSON で扱える通知があります。

## 状態のフックを使う

React フックはゲームとコンピューターの待ち時間を管理し、描画はコンポーネントが行います。設定を渡し、本来の可能な手を表示します。設定を変えて始め直す場合は明示的に restart を使います。

```ts no-run
import { createElement } from "react";
import { moveText } from "@johnmorrisdotca/toranpu";
import { useCardGame } from "@johnmorrisdotca/toranpu/react";

const setup = { players: ["You", "Aki", "Ben", "Cy"], computers: [false, true, true, true], seed: 42 };
export function Table() {
  const table = useCardGame("hearts", setup);
  return createElement("div", null, ...table.moves.map((move, index) =>
    createElement("button", { key: index, onClick: () => table.play(move) }, moveText("hearts", move))));
}
```

## 音と片付け

音は必要になってから読み込み、切ったままにもできます。要素を外すと処理が片付けられ、React はアンマウント時に待機中の手を取り消します。自分で作った音のハンドルは close を呼んでください。
