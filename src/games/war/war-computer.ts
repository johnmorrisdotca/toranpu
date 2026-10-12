import type { WarGame, WarMove } from "./war.types.ts";

/**
 * A COMPUTER AT THE WAR TABLE. War has no choices, so there is nothing to be clever about: it turns the cards over, as
 * a person does, and a table of computers plays itself. It sees nothing it should not, because there is nothing hidden.
 */

/** The move a computer makes: the only one War has.
 *
 * @param game - The current native game; applying a move returns a new state.
 * @returns The move a computer makes: the only one War has.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, newGame } from "@johnmorrisdotca/toranpu";
 * import { warComputer } from "@johnmorrisdotca/toranpu/war";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.war.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("war", { players: names, seed: 42 })!;
 * console.log(warComputer(game));
 * ```
 */
export function warComputer(game: WarGame): WarMove {
  void game;
  return { turn: true };
}
