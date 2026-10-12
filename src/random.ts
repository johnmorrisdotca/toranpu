/**
 * SEEDED RANDOMNESS, the one thing every deal is made from.
 *
 * mulberry32: small, fast, and the same stream for the same seed in every
 * browser and every Node. It decides every shuffle, so it must never change —
 * a game kept as its seed and its moves is dealt again from it, and a changed
 * stream would deal somebody a different hand from the one they were playing.
 * `random.test.ts` pins its first numbers for that reason.
 *
 * Nothing here is a credential: it is for fair-looking deals, not secrets.
 */

/** A number in [0, 1), like `Math.random`, from a stream a seed fixes.
 *
 * @example
 * ```ts
 * import type { Random } from "@johnmorrisdotca/toranpu/deck";
 * import { seededRandom } from "@johnmorrisdotca/toranpu/deck";
 *
 * const value: Random = seededRandom(42);
 * console.log(value());
 * ```
 */
export type Random = () => number;

/** A stream of numbers in [0, 1) fixed by a seed.
 *
 * @param seed - The numeric seed that reproduces the same shuffle or deal.
 * @returns A stream of numbers in [0, 1) fixed by a seed.
 *
 * @example
 * ```ts
 * import { seededRandom } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(seededRandom(42)());
 * ```
 */
export function seededRandom(seed: number): Random {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A copy of the list in a random order (Fisher–Yates); the list given is left alone.
 *
 * @param items - The items to shuffle without changing the input.
 * @param random - A source of numbers in [0, 1), such as seededRandom(seed).
 * @returns A copy of the list in a random order (Fisher–Yates); the list given is left alone.
 *
 * @example
 * ```ts
 * import { seededRandom, shuffled } from "@johnmorrisdotca/toranpu/deck";
 *
 * console.log(shuffled(["A", "B", "C"], seededRandom(42)));
 * ```
 */
export function shuffled<T>(items: readonly T[], random: Random): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}
