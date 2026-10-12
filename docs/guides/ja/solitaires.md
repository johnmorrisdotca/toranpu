---
title: ソリティアを配る・進める・解く
section: how-to
order: 5
description: ソリティアを配る・進める・解くの使い方と注意点。
---

## 個別のエンジンを使う

クロンダイク、フリーセル、スパイダーには、それぞれ状態、可能な手、入力を変えない進行、配りのコード、再生、ソルバーがあります。11 種類のゲームの文字列 ID ではなく、カードの番号を使います。デッキは本来の配りの読み取りで作ります。

```ts
import { dealKlondike, dealOfSeed, deckOf, movesFrom, playKlondike } from "@johnmorrisdotca/toranpu/klondike";

const table = dealKlondike(deckOf(dealOfSeed(42))!, { draw: 3, passes: 3 });
const move = movesFrom(table)[0]!;
const next = playKlondike(table, move);
console.log(move, table.stock.length, next?.stock.length);
```

## 山の名前を確認する

クロンダイクの列は `"1"`〜`"7"`、捨て札は `"w"`、山札は `"s"`、組札は S/H/D/C です。フリーセルの列は `"1"`〜`"8"`、空きセルは a/b/c/d、組札は S/H/D/C です。スパイダーの操作用関数は列 `"0"`〜`"9"`、山札 `"s"`、完成した組 `"f"`を使います。持ったカードと移動先は、本来の `moveFor`や取り上げる関数で確認します。

## 探索量を決める

ソルバーは時間ではなく、調べる状態数に上限を設けます。同じ配りと上限で同じ結果になります。手順が null なら、その探索量で解法が見つからなかったという意味で、解けない証明ではありません。長い探索はページの描画から分けます。

```ts no-run
import { dealFreeCell, dealOfSeed, deckOf, solveFreeCell } from "@johnmorrisdotca/toranpu/freecell";

const table = dealFreeCell(deckOf(dealOfSeed(42))!, 4);
const result = solveFreeCell(table, 10000);
console.log(result.tables, result.moves);
```

[クロンダイク](entry:klondike)、[フリーセル](entry:freecell)、[スパイダー](entry:spider)に状態、手、拒否の契約があります。
