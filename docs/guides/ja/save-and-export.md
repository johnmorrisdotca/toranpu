---
title: 保存・再開・書き出し
section: how-to
order: 3
description: 保存・再開・書き出しの使い方と注意点。
---

## 設定と手順を保存する

保存形式にはゲームの種類、長さ、名前、コンピューターの席、シード、各手が入ります。読み取りではゲームを作り直し、すべての手をルールで進めます。渡された手札や得点を信用せず、不正な手順を拒否します。

```ts
import { fromCode, fromJSON, newGame, rulesFor, toCSV, toCode, toJSON } from "@johnmorrisdotca/toranpu";

const game = newGame("war", { players: ["Aki", "Ben"], seed: 42 })!;
const next = rulesFor("war").play(game, { turn: true })!;
console.log(fromJSON(toJSON("war", next))?.kind);
console.log(fromCode(toCode("war", next))?.kind);
console.log(toCSV("war", next));
console.log(fromJSON("not JSON"));
```

## 書き出しを選ぶ

`toJSON`は構造化した記録、`toCode`は短いコードです。`fromJSON` と `fromCode`は種類付きの `ReadGame`か null を返します。`toText`は選んだ言語で手を読み、`toCSV`は表計算向けの行を書きます。[書き出しと読み込み](../../export-and-import.md)に形式と CLI の詳しい説明があります。

## 読めなかった記録

結果を確認してから再開します。null は形式、ゲーム、設定、手順のいずれかを受け入れられなかったことを示します。シードで配りを、手順でその後の選択を再現します。記録には名前とカードを再構成できる情報が入るので、保存と共有はアプリ側で選びます。
