
/**
 * HOW A CARD GAME IS KEPT AS TEXT: its table (the size chosen, the
 * names, which seats a computer plays), the seed its deals are shuffled from,
 * and every move in order — never a hand, a pile or a score, which the moves
 * make again. Read back, the game is started from its table and seed and every
 * move played again through its own rules, so what comes back is exactly the
 * game those moves make, or nothing: saved text is somebody's to
 * edit, and a move the rules refuse means the text is not a game.
 */

/** The version of what is written, so a later shape can refuse an older one rather than misread it. */
const KEPT_VERSION = 1;

/** What every card game's state carries for its keeping.
 *
 * @example
 * ```ts
 * import type { KeptCardGame, MoveOf } from "@johnmorrisdotca/toranpu";
 * import { newGame } from "@johnmorrisdotca/toranpu";
 *
 * const value: KeptCardGame<MoveOf<"hearts">> = newGame("hearts", { players: ["Aki", "Ben", "Cy", "Dev"], seed: 42 })!;
 * console.log(value.seed);
 * ```
 */
export type KeptCardGame<M> = {
  size: number;
  players: readonly string[];
  computers: readonly boolean[];
  seed: number;
  moves: readonly M[];
};

/** A game's keeping: `encode` writes it as text, `decode` reads it back or gives null.
 *
 * @example
 * ```ts
 * import type { CardGameCodec, GameOf } from "@johnmorrisdotca/toranpu";
 * import { rulesFor } from "@johnmorrisdotca/toranpu";
 *
 * const value: CardGameCodec<GameOf<"hearts">> = rulesFor("hearts");
 * console.log(typeof value.decode);
 * ```
 */
export type CardGameCodec<S> = {
  encode: (game: S) => string;
  decode: (text: string | null) => S | null;
};

/**
 * The keeping for one game: `game` names it, so one game's text is never read
 * as another's; `start` and `play` are its rules; `isMove` checks a move's
 * shape before the rules are asked about it.
 *
 * @param game - The short game name recorded in the saved format.
 * @param start - The native function that starts a game from size, names, seed and computer flags.
 * @param play - The native function that applies one legal move and returns the next game.
 * @param isMove - The game-specific structural validator for a move.
 * @returns The keeping for one game: `game` names it, so one game's text is never read as another's; `start` and `play` are its rules; `isMove` checks a move's shape before the rules are asked about it.
 *
 * @example
 * ```ts
 * import { CARD_GAME_TABLES, cardGameCodec, newGame } from "@johnmorrisdotca/toranpu";
 * import { encodeWar, isWarMove, playWar, startWar } from "@johnmorrisdotca/toranpu/war";
 *
 * const names = Array.from({ length: CARD_GAME_TABLES.war.defaultPlayers }, (_, seat) => `Seat ${seat + 1}`);
 * let game = newGame("war", { players: names, seed: 42 })!;
 * console.log(cardGameCodec("war", startWar, playWar, isWarMove).decode(encodeWar(game))?.phase);
 * ```
 */
export function cardGameCodec<S extends KeptCardGame<M>, M>(
  game: string,
  start: (size: number, players: readonly string[], language: undefined, seed: number, computers: readonly boolean[]) => S | null,
  play: (state: S, move: M) => S | null,
  isMove: (value: unknown) => value is M,
): CardGameCodec<S> {
  return {
    encode: (state) =>
      JSON.stringify({ v: KEPT_VERSION, g: game, size: state.size, players: state.players, computers: state.computers, seed: state.seed, moves: state.moves }),
    decode: (text) => {
      if (text === null) return null;
      let kept: unknown;
      try {
        kept = JSON.parse(text);
      } catch {
        return null;
      }
      if (typeof kept !== "object" || kept === null) return null;
      const { v, g, size, players, computers, seed, moves } = kept as Record<string, unknown>;
      if (v !== KEPT_VERSION || g !== game || typeof size !== "number" || typeof seed !== "number" || !Number.isInteger(seed)) return null;
      if (!Array.isArray(players) || !players.every((name) => typeof name === "string")) return null;
      if (!Array.isArray(computers) || computers.length !== players.length || !computers.every((seat) => typeof seat === "boolean")) return null;
      if (!Array.isArray(moves) || !moves.every(isMove)) return null;
      let state = start(size, players as string[], undefined, seed, computers as boolean[]);
      for (const move of moves as M[]) {
        if (state === null) return null;
        state = play(state, move);
      }
      return state;
    },
  };
}

/** The seats a computer plays, one a seat, from what the set-up said: a seat it said nothing about is a person's.
 *
 * @param count - The requested number of cards, sounds or layout positions.
 * @param computers - Flags by seat: true where a computer controls that seat.
 * @returns The seats a computer plays, one a seat, from what the set-up said: a seat it said nothing about is a person's.
 *
 * @example
 * ```ts
 * import { computerSeats } from "@johnmorrisdotca/toranpu";
 *
 * console.log(computerSeats(4, [false, true]));
 * ```
 */
export function computerSeats(count: number, computers?: readonly boolean[]): boolean[] {
  return Array.from({ length: count }, (_, seat) => computers?.[seat] === true);
}

/** A list of card names, checked for shape only: whether they are cards the game holds is the rules' to say.
 *
 * @param value - The unknown value to validate.
 * @returns A list of card names, checked for shape only: whether they are cards the game holds is the rules' to say.
 *
 * @example
 * ```ts
 * import { isCardList } from "@johnmorrisdotca/toranpu";
 *
 * console.log(isCardList(["AS", "KH"]));
 * ```
 */
export function isCardList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((card) => typeof card === "string");
}
