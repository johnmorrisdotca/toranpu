import type { WarGame, WarMove } from "./war.types.ts";

/**
 * A COMPUTER AT THE WAR TABLE. War has no choices, so there is nothing to be clever about: it turns the cards over, as
 * a person does, and a table of computers plays itself. It sees nothing it should not, because there is nothing hidden.
 */

/** The move a computer makes: the only one War has. */
export function warComputer(game: WarGame): WarMove {
  void game;
  return { turn: true };
}
