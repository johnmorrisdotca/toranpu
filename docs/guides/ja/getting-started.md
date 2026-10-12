---
title: はじめに
section: tutorial
order: 1
description: はじめにの使い方と注意点。
---

パッケージを入れ、シードでゲームを始め、可能な手を 1 手進めます。エンジンは普通の関数で、ページなしでも Node 22 以降で使えます。

## インストール

```sh
npm install @johnmorrisdotca/toranpu
```

実行時の依存パッケージはなく、型も含まれています。React は別のフック用エントリーを使う場合だけ必要です。

## 始めて進める

```ts
import { newGame, rulesFor } from "@johnmorrisdotca/toranpu";

const game = newGame("hearts", { players: ["Aki", "Ben", "Cy", "Dev"], seed: 42 });
if (game === null) throw new Error("Unsupported setup");
const rules = rulesFor("hearts");
const next = rules.play(game, rules.moves(game)[0]!);
console.log(game.phase, game.moves.length);
console.log(next?.phase, next?.moves.length);
```

カードを出す前に、手札の交換、ビッド、捨て札などを行う場合があります。現在の選択肢は本来のルールに聞きます。`play`は新しいゲームを返し、元のゲームを変えません。null はその手を出せないことを示します。

## エントリーを選ぶ

[基本エントリー](entry:main)には 11 種類のゲーム、共通の文言と書き出しがあります。各ゲームには個別のエントリーと `hearts`などの名前空間もあります。[deck](entry:deck)は独自のゲームに使うカードのオブジェクトです。ソリティアには別のエントリーがあります。

## 次に読む

[コンピューター](run-computers.md)、[保存と書き出し](save-and-export.md)、[カードの表示](display-and-branding.md)、[ソリティア](solitaires.md)、[埋め込みと React](embed-and-react.md)へ進みます。
