/**
 * The sounds of a card table, from real recorded cards: a card dealt, turned
 * over or played, the deck shuffled, a pile gathered in, a hand fanned. Off
 * unless a table asks: nothing plays and nothing is fetched until `play`.
 *
 * ```ts
 * import { createCardSounds } from "@johnmorrisdotca/toranpu/card-sounds";
 *
 * const sounds = createCardSounds();
 * sounds.play("shuffle");
 * sounds.play("deal", { count: 13, delay: 900 });
 * ```
 *
 * The recordings themselves are `@johnmorrisdotca/toranpu/sounds`, loaded by
 * the first sound played. Kenney's Casino Audio, CC0: see docs/credits.md.
 */
export { CARD_SOUND_KINDS, MOST_SOUNDS_AT_ONCE, createCardSounds, soundTimes } from "./ui/card-sounds.ts";
export type { CardSoundData, CardSoundKind, CardSounds, CardSoundsOptions, CardSoundWindow, PlayCardSoundOptions } from "./ui/card-sounds.ts";
