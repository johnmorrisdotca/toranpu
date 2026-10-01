/**
 * Toranpu トランプ: a deck of playing cards and ten card games to play with
 * it, each with a computer player.
 *
 * - Every game by name: `newGame`, `rulesFor`, `playComputers`, and every
 *   game's rules in `CARD_GAME_RULES`.
 * - Each game's own functions and types, as a namespace here (`hearts`,
 *   `spades`…) or from its own entry point (`@johnmorrisdotca/toranpu/hearts`).
 * - The cards the games deal, as two-letter ids ("QS", "TD"), and the helpers
 *   every game shares: dealing, seats, choices, the saved-game format.
 * - The deck as card objects, for a game of your own: `@johnmorrisdotca/toranpu/deck`.
 * - Any game written out and read back (`toJSON`, `fromJSON`, `toCode`,
 *   `toText`, `toCSV`), and the games, cards and moves in words, in English
 *   and Japanese (`gameName`, `cardText`, `moveText`, `STRINGS`).
 * - The command line as a function: `runCli`.
 */
export * from "./play.ts";
export * from "./games/cardGameRules.ts";
export * from "./games/cardGames.constants.ts";
export type * from "./games/cardGames.types.ts";
export * from "./games/cardGameCodec.ts";
export * from "./games/cards.ts";
export { seededRandom, shuffled } from "./random.ts";
export type { Random } from "./random.ts";
export * from "./save.ts";
export * from "./words.ts";
export * from "./strings.ts";
export { runCli, cliLanguage, type CliResult, type CliSurroundings } from "./cli.ts";
export { VERSION } from "./version.ts";

export * as hearts from "./hearts.ts";
export * as spades from "./spades.ts";
export * as euchre from "./euchre.ts";
export * as cribbage from "./cribbage.ts";
export * as ohHell from "./oh-hell.ts";
export * as crazyEights from "./crazy-eights.ts";
export * as goFish from "./go-fish.ts";
export * as bigTwo from "./big-two.ts";
export * as president from "./president.ts";
export * as ginRummy from "./gin-rummy.ts";
