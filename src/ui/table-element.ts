import { CARD_GAME_LIST, CARD_GAME_TABLES, type CardGameKind } from "../games/card-games.constants.ts";
import { isCard } from "../games/cards.ts";
import { newGame, randomSeed, rulesFor } from "../play.ts";
import { STRINGS, fillIn } from "../strings.ts";
import { cardText, moveText, namesList, suitSymbol } from "../words.ts";
import { cardDrawing, designNamed, ElementBase, followLanguage, isOn, languageOf, lessMotion, pageSounds, widthOf } from "./element-kit.ts";

/**
 * THE CLOTHS A TABLE MAY BE LAID IN: the same five the whole family offers, and itsutsu.com's boards. Each is the
 * felt's colour, its deep edge and the ink written on it.
 */
export const TABLE_CLOTHS = {
  green: { felt: "#2f5d4a", deep: "#1f4135", ink: "#f3efe4" },
  blue: { felt: "#2865a6", deep: "#1a4677", ink: "#f3efe4" },
  red: { felt: "#a3342e", deep: "#7a231f", ink: "#f3efe4" },
  black: { felt: "#2f3236", deep: "#1b1d20", ink: "#ece8dc" },
  wood: { felt: "#e2ba7a", deep: "#c4954f", ink: "#2b1d0e" },
} as const;

/** A cloth's name. */
export type TableCloth = keyof typeof TABLE_CLOTHS;

/** A game's key as an attribute writes it, in kebab case (`crazy-eights`), or as its key (`crazyEights`). */
function kindOf(text: string | null): CardGameKind {
  const found = CARD_GAME_LIST.find((one) => one === text || one.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`) === text);
  return found ?? "hearts";
}

/** Every card a move names, in any field. */
const cardsOf = (move: object): string[] => Object.values(move).flatMap((value) => (Array.isArray(value) ? value.filter((one) => isCard(one)) : isCard(value) ? [value as string] : []));

/** The game as the table holds it: only the fields a table draws from, read loosely, since every game keeps its own. */
type Seen = {
  seed: number;
  hands?: string[][];
  scores?: number[];
  penalties?: number[];
  bids?: (number | null)[];
  tricks?: number[];
  books?: unknown[][];
  phase?: string;
  trick?: { seat: number; card: string }[];
  lastTrick?: { winner: number; plays: { seat: number; card: string }[] };
  pile?: { seat: number; cards: string[] };
  run?: { seat: number; card: string }[];
  count?: number;
  discard?: string[];
  suit?: string;
  upcard?: string;
  turned?: string;
  trump?: string | null;
  starter?: string;
  stock?: string[];
  /** War: the last turn, every card laid in order and who took them; how many turns are played, and how many it may last. */
  last?: { laid: { seat: number; card: string; down: boolean }[]; wars: number; winner: number | null } | null;
  moves?: unknown[];
  size?: number;
};

/** The first seat's name, until a page gives names: "You" in the table's language. */
const YOU = "\u0000you";
const NAMES = [YOU, "Aiko", "Ben", "Chloé", "Dev", "Emi", "Finn", "Grace"];

/**
 * <toranpu-table>: ANY OF THE ELEVEN GAMES, READY TO PLAY. The seats round the felt, what lies on the table (the
 * trick, the pile to beat, the stock and the discard as `<toranpu-pile>`), the hand of whoever is to play, the
 * moves they may make, and computers in every other seat, playing their turns after a short pause.
 *
 *   <toranpu-table game="crazy-eights" players="3" cloth="blue" messiness="0.4"></toranpu-table>
 *
 * Attributes:
 *   game        any of the eleven, by its key or in kebab case: hearts (unless said), spades, euchre, cribbage,
 *               oh-hell, crazy-eights, go-fish, big-two, president, gin-rummy, war
 *   players     how many sit at the table, within the game's own range (its usual number unless said)
 *   people      how many of the seats are people's, the first ones; the rest are computers (1 unless said)
 *   names       the seats' names, separated by commas; the first is "You" unless said
 *   seed        the deal: the same seed deals the same cards (a new one each game unless said)
 *   cloth       the felt: green (unless said), blue, red, black or wood
 *   messiness   how untidy the stock and the discard lie, 0 to 1 (0.3 unless said)
 *   delay       how long a computer thinks before it plays, in milliseconds (550 unless said)
 *   design, back, back-colour, back-image, back-logo, mark, size, width, lang, sound   as on `<toranpu-card>`
 *
 * `deal()` deals again, with a new seed unless one is given; the `game` property is the game as it stands.
 * Each move is a `toranpu-table` event that bubbles, its detail `{ seat, move, over, winners }`.
 */
export class ToranpuTable extends ElementBase {
  static get observedAttributes(): readonly string[] {
    return ["game", "players", "people", "names", "seed", "cloth", "messiness", "delay", "design", "back", "back-colour", "back-image", "back-logo", "mark", "size", "width", "lang", "sound"];
  }

  #root: ShadowRoot | null = null;
  #forget: (() => void) | null = null;
  #game: Seen | null = null;
  #kind: CardGameKind = "hearts";
  #picked: string[] = [];
  #timer: ReturnType<typeof setTimeout> | null = null;

  /** The game as it stands, as the game's own rules hold it. Setting it to a game's key (`"hearts"`, `"crazy-eights"`) sets the `game` attribute, which deals that game. */
  get game(): unknown {
    return this.#game;
  }
  set game(kind: unknown) {
    if (typeof kind === "string") this.setAttribute("game", kind);
    else if (kind === null || kind === undefined) this.removeAttribute("game");
  }

  /** Deal again: the same game and table, with `seed`, or a new seed. */
  deal(seed?: number): void {
    this.#start(seed ?? randomSeed());
  }

  connectedCallback(): void {
    this.#forget ??= followLanguage(() => this.#draw());
    if (this.#root === null) this.#root = this.attachShadow({ mode: "open" });
    if (this.#game === null) this.#start(this.#seedAsked());
    else this.#draw();
  }

  disconnectedCallback(): void {
    this.#forget?.();
    this.#forget = null;
    if (this.#timer !== null) clearTimeout(this.#timer);
  }

  attributeChangedCallback(name: string, before: string | null, after: string | null): void {
    if (this.#root === null || before === after) return;
    // A different game or table is a new deal; anything else is the same game, drawn again.
    if (["game", "players", "people", "seed"].includes(name)) this.#start(this.#seedAsked());
    else this.#draw();
  }

  #seedAsked(): number {
    const seed = Number(this.getAttribute("seed"));
    return Number.isInteger(seed) && seed >= 1 && seed <= 0x7fffffff ? seed : randomSeed();
  }

  #names(count: number): string[] {
    const given = (this.getAttribute("names") ?? "").split(",").map((name) => name.trim()).filter(Boolean);
    return Array.from({ length: count }, (_, seat) => given[seat] ?? NAMES[seat] ?? `${seat + 1}`);
  }

  #start(seed: number): void {
    this.#kind = kindOf(this.getAttribute("game"));
    const table = CARD_GAME_TABLES[this.#kind];
    const asked = Number(this.getAttribute("players"));
    const count = Number.isInteger(asked) && asked >= table.fewestPlayers && asked <= table.mostPlayers ? asked : table.defaultPlayers;
    const people = Math.max(1, Math.min(count, Number(this.getAttribute("people")) || 1));
    const players = this.#names(count);
    this.#game = newGame(this.#kind, { players, seed, computers: players.map((_, seat) => seat >= people) }) as Seen | null;
    this.#picked = [];
    if (isOn(this, "sound")) pageSounds().play("shuffle");
    this.#draw();
  }

  #play(move: object): void {
    const rules = rulesFor(this.#kind);
    const game = this.#game;
    if (game === null) return;
    const seat = rules.toPlay(game as never);
    const next = rules.play(game as never, move as never) as Seen | null;
    if (next === null) return;
    this.#game = next;
    this.#picked = [];
    if (isOn(this, "sound")) pageSounds().play(cardsOf(move).length > 0 ? "play" : "deal");
    const over = rules.over(next as never);
    this.dispatchEvent(new CustomEvent("toranpu-table", { bubbles: true, composed: true, detail: { seat, move, over, winners: over ? rules.winners(next as never) : [] } }));
    this.#draw();
  }

  #draw(): void {
    const root = this.#root;
    const game = this.#game;
    if (root === null || game === null) return;
    if (this.#timer !== null) clearTimeout(this.#timer);
    const rules = rulesFor(this.#kind);
    const language = languageOf(this);
    const t = STRINGS[language];
    const { design, ready } = designNamed(this.getAttribute("design"));
    if (ready !== null) void ready.then(() => this.#draw());
    const { players, computers } = rules.seats(game as never);
    const names = players.map((name, seat) => (name === YOU && seat === 0 ? t.pageYou : name));
    const toPlay = rules.toPlay(game as never);
    const over = rules.over(game as never);
    // The hand shown: the person to play, or else the first seat a person holds.
    const me = toPlay !== null && !computers[toPlay] ? toPlay : Math.max(0, computers.findIndex((computer) => !computer));
    const cloth = TABLE_CLOTHS[(this.getAttribute("cloth") ?? "green") as TableCloth] ?? TABLE_CLOTHS.green;
    const messiness = Math.min(1, Math.max(0, Number(this.getAttribute("messiness") ?? 0.3) || 0));
    const worn = ["design", "back", "back-colour", "back-image", "back-logo", "mark", "lang"].filter((name) => this.hasAttribute(name)).map((name) => ` ${name}="${escape(this.getAttribute(name) ?? "")}"`).join("");
    const face = (card: string) => cardDrawing(card, false, this, design, language);

    const seats = names
      .map((name, seat) => {
        const held = game.hands?.[seat]?.length;
        const points = game.scores ?? game.penalties;
        const score = points?.[points.length === 2 && names.length === 4 ? seat % 2 : seat];
        const meta = [
          computers[seat] ? t.pageComputer : "",
          held !== undefined ? fillIn(t.pageCards, { n: held }) : "",
          score !== undefined ? fillIn(t.pageScore, { n: score }) : "",
          game.bids?.[seat] != null ? fillIn(t.pageBid, { n: game.bids[seat] as number }) : "",
          game.tricks && game.phase === "playing" ? fillIn(t.pageTricks, { n: game.tricks[seat] as number }) : "",
          game.books ? fillIn(t.pageBooks, { n: (game.books[seat] ?? []).length }) : "",
        ].filter(Boolean);
        return `<div class="seat" part="seat" data-turn="${seat === toPlay}" data-testid="table-seat"><div class="who">${escape(name)}</div><div class="meta">${escape(meta.join(" · "))}</div></div>`;
      })
      .join("");

    const laid = (label: string, cards: readonly string[]) => `<div class="pile"><span class="label">${escape(label)}</span><div class="laid">${cards.map((card) => `<span class="card" data-card="${card}">${face(card)}</span>`).join("")}</div></div>`;
    const heap = (label: string, attributes: string, id: string) =>
      `<div class="pile"><span class="label">${escape(label)}</span><toranpu-pile ${attributes} messiness="${messiness}" seed="${game.seed % 100000}" depth="6" size="small"${worn} data-testid="${id}"></toranpu-pile></div>`;
    const sign = (label: string, text: string) => `<div class="pile"><span class="label">${escape(label)}</span><span class="big">${escape(text)}</span></div>`;
    const plays = (list: readonly { card: string }[]) => list.map((play) => play.card);
    const piles: string[] = [];
    if (game.trick?.length) piles.push(laid(`${t.pageTrick}: ${namesList(game.trick.map((play) => names[play.seat] ?? ""), language)}`, plays(game.trick)));
    else if (game.lastTrick?.plays?.length) piles.push(laid(fillIn(t.pageLastTrick, { player: names[game.lastTrick.winner] ?? "" }), plays(game.lastTrick.plays)));
    if (game.pile?.cards) piles.push(laid(fillIn(t.pageToBeat, { player: names[game.pile.seat] ?? "" }), game.pile.cards));
    if (game.run?.length) piles.push(laid(fillIn(t.pageCount, { n: game.count ?? 0 }), plays(game.run)));
    if (game.discard?.length) piles.push(heap(t.pageDiscard, `cards="${game.discard.join(" ")}"`, "table-discard"));
    if (game.suit && this.#kind === "crazyEights") piles.push(sign(t.pageSuitToFollow, suitSymbol(game.suit as never)));
    if (game.upcard && game.phase !== "playing" && game.trump === null) piles.push(laid(t.pageTurnedUp, [game.upcard]));
    if (game.turned && this.#kind === "ohHell") piles.push(laid(t.pageTurnedUp, [game.turned]));
    if (game.trump) piles.push(sign(t.pageTrump, suitSymbol(game.trump as never)));
    if (game.starter) piles.push(laid(t.pageStarter, [game.starter]));
    if (game.stock) piles.push(heap(fillIn(t.pageStock, { n: game.stock.length }), `count="${game.stock.length}" face-down`, "table-stock"));
    // War: each player's pile face down, the turn the game is at, and the last turn's cards turned up, with who took them.
    if (this.#kind === "war" && game.hands) {
      game.hands.forEach((cards, seat) => cards.length > 0 && piles.push(heap(`${names[seat] ?? ""}: ${cards.length}`, `count="${cards.length}" face-down`, `table-war-${seat}`)));
      piles.push(sign(t.pageWarTurn, `${game.moves?.length ?? 0} / ${game.size ?? 0}`));
      if (game.last !== null && game.last !== undefined) {
        const took = game.last.winner === null ? t.pageWarDraw : fillIn(t.pageWarTook, { player: names[game.last.winner] ?? "", n: game.last.laid.length });
        piles.push(laid(took + (game.last.wars > 0 ? fillIn(t.pageWarWars, { n: game.last.wars }) : ""), game.last.laid.filter((one) => !one.down).map((one) => one.card)));
      }
    }

    const mine = !over && toPlay !== null && !computers[toPlay];
    const offered = mine ? (rules.moves(game as never) as object[]) : [];
    const usable = new Set(offered.flatMap(cardsOf));
    // At War nobody holds a hand to choose from: each pile is turned a card at a time, and is drawn as a pile above.
    const hand = (this.#kind === "war" ? [] : (game.hands?.[me] ?? []))
      .map((card) => `<button type="button" class="card" part="card" data-card="${card}" aria-pressed="${this.#picked.includes(card)}"${usable.has(card) ? "" : " disabled"} aria-label="${escape(cardText(card, language))}">${face(card)}</button>`)
      .join("");
    const same = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((card) => b.includes(card));
    const fitting = offered.filter((move) => cardsOf(move).length === 0 || same(cardsOf(move), this.#picked));
    const moves = fitting
      .map((move, at) => `<button type="button" class="move" part="move" data-at="${at}"${cardsOf(move).length > 0 ? ' data-primary="true"' : ""} data-testid="table-move">${escape(moveText(this.#kind, move as never, { language, players: names }))}</button>`)
      .join("");

    let status: string;
    if (over || toPlay === null) status = fillIn(t.pageOver, { players: namesList(rules.winners(game as never).map((seat) => names[seat] ?? ""), language) });
    else if (computers[toPlay]) status = fillIn(t.pageThinking, { player: names[toPlay] ?? "" });
    else {
      const first = (offered[0] ?? {}) as Record<string, unknown>;
      const whose = toPlay === 0 ? "" : `${fillIn(t.pageToPlay, { player: names[toPlay] ?? "" })} `;
      status =
        whose +
        (Array.isArray(first.pass)
          ? fillIn(t.pageYourTurnPass, { n: first.pass.length })
          : "crib" in first
            ? t.pageYourTurnCrib
            : "give" in first
              ? fillIn(t.pageYourTurnGive, { n: (first.give as unknown[]).length })
              : offered.some((move) => cardsOf(move).length > 0)
                ? t.pageYourTurnPick
                : t.pageYourTurn);
    }

    root.innerHTML = `<style>${TABLE_STYLE}</style><div class="felt" part="felt" data-cloth="${escape(this.getAttribute("cloth") ?? "green")}" style="--felt:${cloth.felt};--felt-deep:${cloth.deep};--felt-ink:${cloth.ink};--toranpu-w:${widthOf(this)}">
<div class="seats">${seats}</div>
<div class="piles" data-testid="table-piles">${piles.join("")}</div>
<p class="status" aria-live="polite" data-testid="table-status">${escape(status)}</p>
<div class="hand" data-testid="table-hand">${hand}</div>
<div class="moves">${moves}</div>
</div>`;
    this.setAttribute("data-game", this.#kind);
    for (const button of root.querySelectorAll<HTMLButtonElement>(".hand .card")) {
      button.addEventListener("click", () => {
        const card = button.dataset.card as string;
        this.#picked = this.#picked.includes(card) ? this.#picked.filter((one) => one !== card) : [...this.#picked, card];
        this.#draw();
      });
    }
    for (const button of root.querySelectorAll<HTMLButtonElement>(".moves .move")) button.addEventListener("click", () => this.#play(fitting[Number(button.dataset.at)] as object));
    // A computer to play: after a short pause, as a person would see it think.
    if (!over && toPlay !== null && computers[toPlay]) {
      const delay = Number(this.getAttribute("delay"));
      this.#timer = setTimeout(() => this.#play(rules.computer(game as never) as object), lessMotion() ? 0 : Number.isFinite(delay) && delay >= 0 ? delay : 550);
    }
  }
}

const escape = (text: string) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const TABLE_STYLE = `
:host { display: block; user-select: none; -webkit-user-select: none; -webkit-tap-highlight-color: transparent; }
.felt { border-radius: 22px; padding: 16px; color: var(--felt-ink); background: radial-gradient(120% 90% at 50% 20%, var(--felt) 0%, var(--felt-deep) 100%); display: grid; gap: 14px; font: inherit; }
.seats { display: flex; flex-wrap: wrap; gap: 8px; }
.seat { border-radius: 12px; padding: 8px 12px; background: rgba(0,0,0,.18); min-width: 120px; }
.seat[data-turn="true"] { box-shadow: inset 0 0 0 2px #e0b43b; }
.who { font-weight: 700; }
.meta { font-size: .78rem; opacity: .8; }
.piles { display: flex; flex-wrap: wrap; gap: 14px 22px; align-items: flex-end; min-height: 90px; }
.pile { display: grid; gap: 4px; }
.label { font-size: .72rem; letter-spacing: .05em; text-transform: uppercase; opacity: .8; }
.laid { display: flex; gap: 4px; }
.laid .card { display: block; width: calc(var(--toranpu-w, 70px) * .66); aspect-ratio: 5 / 7; }
.big { font-size: 2rem; line-height: 1; }
.status { margin: 0; font-weight: 600; min-height: 1.4em; }
.hand { display: flex; flex-wrap: wrap; gap: 6px; }
.hand .card { width: var(--toranpu-w, 70px); aspect-ratio: 5 / 7; padding: 0; border: 0; background: none; cursor: pointer; transition: transform .15s; }
.hand .card[aria-pressed="true"] { transform: translateY(-14%); }
.hand .card:disabled { opacity: .45; cursor: default; }
.card svg { display: block; width: 100%; height: 100%; filter: drop-shadow(0 1px 2px rgba(0,0,0,.3)); }
.moves { display: flex; flex-wrap: wrap; gap: 8px; min-height: 44px; }
.move { font: inherit; font-weight: 600; min-height: 44px; padding: 0 16px; border-radius: 999px; border: 0; cursor: pointer; background: rgba(0,0,0,.28); color: var(--felt-ink); box-shadow: inset 0 0 0 1px rgba(255,255,255,.35); }
.move[data-primary="true"] { background: var(--felt-ink); color: var(--felt-deep); box-shadow: none; }
`;
