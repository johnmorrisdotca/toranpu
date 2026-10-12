---
title: Engine, views and replay
section: explanation
order: 7
description: Learn engine, views and replay.
---

## Each game owns its rules

`CARD_GAME_RULES` adapts each native engine to a shared interface; it does not replace the individual algorithms. Phase-specific moves, scores, computer choices and saved-game replay stay with the game. The facade preserves the game and move types selected by the key.

## New state and repeatable deals

A legal play creates a new state. Numeric seeds and native deal counters make shuffles repeatable. Saved logs reconstruct through the rules instead of trusting a second copy of the state. Player-visible view helpers supply a seat’s own hand and public observations; the full native game holds more information and should stay with the trusted host in network play.

## Separate presentation

SVG designs, backs, element layouts, sound, React and solitaires have named entries. A rules-only application can import one game without mounting a DOM view. Development-only docs tools add no runtime package dependency.

## Preserve detailed references

[Rules API](../RULES-API.md), [all games](../games.md) and [the public API tables](../API.md) retain the existing detailed descriptions. Namespace reference pages list the members of their named game entry.
