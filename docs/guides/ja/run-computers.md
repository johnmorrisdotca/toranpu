---
title: コンピューターの手を進める
section: how-to
order: 2
description: コンピューターの手を進めるの使い方と注意点。
---

## 席ごとに操作する人を決める

`computers`は席ごとの真偽値です。指定しない席は人になります。`playComputers`は人の操作が必要になるか、ゲームが終わるまで、必要なコンピューターの手を進めます。新しいゲームと各手が返るので、表示側で順に見せられます。

```ts
import { moveText, newGame, playComputers, rulesFor } from "@johnmorrisdotca/toranpu";

const game = newGame("hearts", { players: ["You", "Aki", "Ben", "Cy"], computers: [false, true, true, true], seed: 42 })!;
const rules = rulesFor("hearts");
const afterYou = rules.play(game, rules.moves(game)[0]!)!;
const result = playComputers("hearts", afterYou);
console.log(result.moves.map((move) => moveText("hearts", move)));
console.log(rules.toPlay(result.game));
```

## 自分で進行を管理する

ルールには `toPlay`、`moves`、`computer`、`play`、`over`、`winners`があります。次の手を選ぶ前に `over`を確認します。シミュレーションのループには上限を設け、可能な手と得点はルールに任せます。各コンピューターは自分の手札と公開情報を使います。

## 順に表示する

表示側で返った手をアニメーションにしたり、React フックの待ち時間を使ったりできます。基本エンジンはタイマーも通信も始めません。[ゲームのルール](../../games.md)に各ゲームの段階と目標があります。
