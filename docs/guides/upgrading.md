---
title: Upgrading from 1.x and other card libraries
section: upgrading
order: 10
description: Learn upgrading from 1.x and other card libraries.
---

## From 1.x to 2.x

Version 2 changed multiword entry-point paths to kebab case: `/oh-hell`, `/crazy-eights`, `/go-fish`, `/big-two` and `/gin-rummy`. The previous camelCase import paths changed; saved-game keys such as crazyEights remained unchanged. Update imports and demo URL game values, rather than rewriting saved logs. The [2.0.0 changelog](../../CHANGELOG.md#200---2026-09-30) records the migration.

## Within 2.x

This rollout changes documentation and site navigation without changing SDK behavior. Keep the named imports you use, the existing element definition entries and native game codecs. The typed defineHand helper’s standard tag is `toranpu-hand`; its checked example uses that published type.

## Coming from another card library

Distinguish card objects, short game ids and packed solitaire numbers. Transfer a deck through native readers/converters, not by assigning one representation to another. Native game setup, legal moves, house rules and scoring belong to that engine. Registering artwork changes presentation rather than those rules.

## Before release

Review new Japanese and check the installed package. The documentation search index is local and adds no hosted service. Building and committing this rollout do not publish a release or upload repository settings.
