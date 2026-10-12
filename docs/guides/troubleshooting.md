---
title: Troubleshooting & FAQ
section: troubleshooting
order: 9
description: Learn troubleshooting & faq.
---

## A game or move returns null

Each game supports its own player counts and match lengths; inspect `CARD_GAME_TABLES`. `newGame` and native starts refuse unsupported setup. Native play refuses an illegal move or inappropriate phase. Shape readers and type guards do not prove that a move is legal now. Ask the engine’s moves and check its result.

## Card and design readers refuse input

`cardFromCode`, `cardFromId` and `readCards` return null for unreadable standard cards. `readHand` also validates the display hand. `cardFaceSvg`/`cardFaceUrl` may return null when the face cannot be drawn; `loadCardDesign` returns null when a design cannot be loaded. `safeImageUrl` refuses unsafe URLs. A custom display id is not automatically a standard game card.

## Save and replay failures

Game decoders, `fromJSON`, `fromCode`, `recordOf`, solitaire move readers, deal readers and replay helpers return null when their format or move sequence is invalid. `without` refuses cards the hand does not contain. `laid` refuses cards absent from that seat. A spades contract may be null before bids are complete; climbing `nextRound` returns null when no seat matches.

## Solitaire actions and budgets

Move/lift interpretation can find no legal carry, foundation move or stock action. `countOnto` can return null when there is no unique carry, including an empty destination where the person must choose its size. Spider’s deal is unavailable while a column is empty or stock is spent. Finishing helpers return null when they cannot finish from that position; solver null means no solution found within the supplied search budget. An empty FreeCell cell has undefined topOf. These are refusals or missing choices, not fabricated moves.

## The element or hook does nothing

Import the correct definition entry, choose valid card ids and give the host a sensible size. The hook offers no human moves while a computer is acting or setup failed. Use it inside a React component. Audio needs a user action and may be muted. [Elements](../ELEMENTS.md) retain attributes, reflected properties, events and disposal details.
