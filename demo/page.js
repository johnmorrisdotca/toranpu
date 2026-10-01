// The Toranpu demo: every game is driven through the same few calls (newGame, rulesFor, and
// each rule's moves, play and computer), and the page knows nothing of any game's rules.
// Moves are matched to the cards you pick. Every word comes from the package's own table.
import { CARD_GAME_LIST, CARD_GAME_TABLES, STRINGS, cardShort, cardText, fillIn, fromJSON, gameName, gameSays, isCard, moveText, namesList, newGame, randomSeed, rulesFor, suitSymbol, toCSV, toCode, toJSON, toText } from "./dist/index.js";
import { cardId, shuffledDeck, writeCards } from "./dist/deck.js";
import { dealt, moved, wire as wireSound } from "./sound.js";
import { wire as wireBacks } from "./backs.js";
import { lookQuery, onLook } from "./look.js";

const $ = (id) => document.getElementById(id);
const NAMES = ["You", "Aiko", "Ben", "Chloé", "Dev", "Emi", "Finn", "Grace"];
const RULES = "https://github.com/johnmorrisdotca/toranpu/blob/main/docs/games.md";
const ANCHORS = { hearts: "hearts", spades: "spades", euchre: "euchre", cribbage: "cribbage", ohHell: "oh-hell", crazyEights: "crazy-eights", goFish: "go-fish", bigTwo: "big-two", president: "president", ginRummy: "gin-rummy" };
const SEED_MOST = 2147483647;

// The page's words are the package's own table, under the names the shared header and footer ask for.
const words = (lang) => ({ ...STRINGS[lang], pitch: STRINGS[lang].pagePitch, name: STRINGS[lang].pageName, nameLink: STRINGS[lang].pageNameLink, foot: STRINGS[lang].pageFoot });
const language = familyLanguage({ id: "toranpu", words: { en: words("en"), ja: words("ja") }, onChange: () => drawAll() });
const t = () => STRINGS[language.lang];

const asked = new URLSearchParams(location.search);
const whole = (text, least, most) => (/^\d{1,10}$/.test(text ?? "") && Number(text) >= least && Number(text) <= most ? Number(text) : null);
// An older link carried the game after a hash: #hearts/4/123.
const [hashKind, hashCount, hashSeed] = location.hash.slice(1).split("/");

// A game is written in an address in kebab case, as its entry point is (crazy-eights), whatever its key in a saved game.
const inAddress = (kind) => kind.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const fromAddress = (text) => CARD_GAME_LIST.find((one) => inAddress(one) === text) ?? null;
let kind = fromAddress(asked.get("game")) ?? fromAddress(hashKind) ?? "hearts";
let game = null;
let picked = [];
let timer = null;
let log = [];
let form = "code";
const deck = { seed: whole(asked.get("deck"), 1, SEED_MOST) ?? 42, hands: 4, each: 5 };

const rules = () => rulesFor(kind);
const el = (tag, text = "", attributes = {}) => {
  const made = document.createElement(tag);
  made.textContent = text;
  for (const [name, value] of Object.entries(attributes)) made.setAttribute(name, value);
  return made;
};
/** The language not being shown. */
const other = () => (language.lang === "ja" ? "en" : "ja");
/**
 * The same words in the other language, laid exactly under the shown ones and never seen or read out: whatever
 * holds both is as big as the larger of the two in the font this device has, so changing language moves nothing.
 */
// Each copy carries its own language, so that it is drawn in the font that language is drawn in when it is the one shown.
const ghost = (text) => el("span", text, { class: "ghost", "aria-hidden": "true", lang: other() });
/** The names as the table shows them: a person's first seat is "You" in the page's language. */
const shown = (players) => players.map((name, seat) => (seat === 0 && name === NAMES[0] ? t().pageYou : name));

function cardEl(card, { small = false, button = false } = {}) {
  const made = el(button ? "button" : "div", "", { class: "card", "data-red": String(card[1] === "H" || card[1] === "D"), "data-small": String(small), "aria-label": cardText(card, language.lang), "data-card": card });
  if (button) made.type = "button";
  else made.setAttribute("role", "img");
  made.append(el("span", cardShort(card).slice(0, -1)), el("span", suitSymbol(card[1]), { class: "pip" }));
  return made;
}

/** Every card a move names, in any field. */
const cardsOf = (move) => Object.values(move).flatMap((value) => (Array.isArray(value) ? value.filter(isCard) : isCard(value) ? [value] : []));

/** The seat whose hand is shown: the person to play, or else the first seat a person holds. */
function viewer(toPlay, computers) {
  if (toPlay !== null && !computers[toPlay]) return toPlay;
  const person = computers.findIndex((computer) => !computer);
  return person < 0 ? 0 : person;
}

function makeMove(move) {
  const seat = rules().toPlay(game);
  const next = rules().play(game, move);
  if (next === null) return;
  log.push({ seat, move, mine: !rules().seats(game).computers[seat] });
  moved(game, next, move);
  game = next;
  picked = [];
  drawAll();
}

function pile(label, cards, small = true) {
  const box = el("div", "", { class: "pile" });
  const row = el("div", "", { class: "cards" });
  row.append(...cards.map((card) => cardEl(card, { small })));
  box.append(el("span", label, { class: "label" }), row);
  return box;
}
const sign = (label, text) => {
  const box = el("div", "", { class: "pile" });
  box.append(el("span", label, { class: "label" }), el("span", text, { class: "big" }));
  return box;
};

function drawPiles(names) {
  const g = game;
  const plays = (list) => list.map((play) => play.card);
  const piles = [];
  if (g.trick?.length) piles.push(pile(`${t().pageTrick}: ${namesList(g.trick.map((play) => names[play.seat]), language.lang)}`, plays(g.trick), false));
  else if (g.lastTrick?.plays?.length) piles.push(pile(fillIn(t().pageLastTrick, { player: names[g.lastTrick.winner] }), plays(g.lastTrick.plays)));
  if (g.pile?.cards) piles.push(pile(fillIn(t().pageToBeat, { player: names[g.pile.seat] }), g.pile.cards, false));
  if (g.run?.length) piles.push(pile(fillIn(t().pageCount, { n: g.count }), plays(g.run), false));
  if (g.discard?.length) piles.push(pile(t().pageDiscard, [g.discard[g.discard.length - 1]], false));
  if (g.suit && kind === "crazyEights") piles.push(sign(t().pageSuitToFollow, suitSymbol(g.suit)));
  if (g.upcard && g.phase !== "playing" && g.trump === null) piles.push(pile(t().pageTurnedUp, [g.upcard], false));
  if (g.turned && kind === "ohHell") piles.push(pile(t().pageTurnedUp, [g.turned]));
  if (g.trump) piles.push(sign(t().pageTrump, suitSymbol(g.trump)));
  if (g.starter) piles.push(pile(t().pageStarter, [g.starter], false));
  if (g.stock) piles.push(sign(t().pageStock.replace("{n}", ""), String(g.stock.length)));
  $("piles").replaceChildren(...piles);
}

function drawTable() {
  clearTimeout(timer);
  const r = rules();
  const { players, computers } = r.seats(game);
  const names = shown(players);
  const toPlay = r.toPlay(game);
  const over = r.over(game);
  const me = viewer(toPlay, computers);

  $("seats").replaceChildren(
    ...names.map((name, seat) => {
      const box = el("div", "", { class: "seat", "data-turn": String(seat === toPlay) });
      const held = game.hands?.[seat]?.length;
      const score = (game.scores ?? game.penalties)?.[(game.scores ?? game.penalties).length === 2 && names.length === 4 ? seat % 2 : seat];
      const extra = [
        computers[seat] ? t().pageComputer : "",
        held !== undefined ? fillIn(t().pageCards, { n: held }) : "",
        score !== undefined ? fillIn(t().pageScore, { n: score }) : "",
        game.bids?.[seat] != null ? fillIn(t().pageBid, { n: game.bids[seat] }) : "",
        game.tricks && game.phase === "playing" ? fillIn(t().pageTricks, { n: game.tricks[seat] }) : "",
        game.books ? fillIn(t().pageBooks, { n: game.books[seat].length }) : "",
      ].filter(Boolean);
      box.append(el("div", name, { class: "who" }), el("div", extra.join(" · "), { class: "meta" }));
      return box;
    }),
  );
  drawPiles(names);

  const mine = !over && toPlay !== null && !computers[toPlay];
  const offered = mine ? r.moves(game) : [];
  const hand = game.hands?.[me] ?? [];
  const usable = new Set(offered.flatMap(cardsOf));
  $("hand").replaceChildren(
    ...hand.map((card) => {
      const button = cardEl(card, { button: true });
      // Dimmed only while some cards may be played and this is not one of them.
      button.disabled = !usable.has(card);
      if (usable.size === 0) button.dataset.idle = "true";
      button.setAttribute("aria-pressed", String(picked.includes(card)));
      button.addEventListener("click", () => {
        picked = picked.includes(card) ? picked.filter((one) => one !== card) : [...picked, card];
        drawTable();
      });
      return button;
    }),
  );

  const same = (a, b) => a.length === b.length && a.every((card) => b.includes(card));
  const fitting = offered.filter((move) => cardsOf(move).length === 0 || same(cardsOf(move), picked));
  $("moves").replaceChildren(
    ...fitting.map((move) => {
      const button = el("button", moveText(kind, move, { language: language.lang, players: names }), { type: "button", class: "fam-button", "data-testid": "move", "data-move": JSON.stringify(move) });
      if (cardsOf(move).length > 0) button.dataset.primary = "true";
      button.addEventListener("click", () => makeMove(move));
      return button;
    }),
  );

  if (over || toPlay === null) {
    $("status").textContent = fillIn(t().pageOver, { players: namesList(r.winners(game).map((seat) => names[seat]), language.lang) });
    return;
  }
  if (computers[toPlay]) {
    $("status").textContent = fillIn(t().pageThinking, { player: names[toPlay] });
    timer = setTimeout(() => makeMove(r.computer(game)), window.toranpuDelay ?? 550);
    return;
  }
  const first = offered[0] ?? {};
  const yours = toPlay === 0 ? "" : `${fillIn(t().pageToPlay, { player: names[toPlay] })} `;
  $("status").textContent =
    yours +
    (Array.isArray(first.pass)
      ? fillIn(t().pageYourTurnPass, { n: first.pass.length })
      : "crib" in first
        ? t().pageYourTurnCrib
        : "give" in first
          ? fillIn(t().pageYourTurnGive, { n: first.give.length })
          : offered.some((move) => cardsOf(move).length > 0)
            ? t().pageYourTurnPick
            : t().pageYourTurn);
}

function drawLog() {
  const { players } = rules().seats(game);
  const names = shown(players);
  const seed = game.seed;
  $("log").replaceChildren(
    el("li", fillIn(t().pageLogStart, { game: gameName(kind, language.lang), n: players.length, seed })),
    ...log.map(({ seat, move, mine }) => el("li", `${names[seat]}: ${moveText(kind, move, { language: language.lang, form: mine ? "did" : "hidden", players: names })}`)),
  );
  $("log").scrollTop = $("log").scrollHeight;
}

function drawKeep() {
  for (const tab of document.querySelectorAll("[data-form]")) tab.setAttribute("aria-selected", String(tab.dataset.form === form));
  $("kept").dataset.wrap = String(form === "code");
  $("kept").textContent = form === "code" ? toCode(kind, game) : form === "json" ? toJSON(kind, game) : form === "text" ? toText(kind, game, language.lang) : toCSV(kind, game).replaceAll("\r\n", "\n");
}

function drawChooser() {
  const table = CARD_GAME_TABLES[kind];
  const count = rules().seats(game).players.length;
  $("games").replaceChildren(
    ...CARD_GAME_LIST.map((one) => {
      const button = el("button", "", { type: "button", class: "fam-button both", "aria-pressed": String(one === kind), "data-testid": `game-${one}` });
      button.append(el("span", gameName(one, language.lang), { lang: language.lang }), ghost(gameName(one, other())));
      button.addEventListener("click", () => deal(one));
      return button;
    }),
  );
  $("players").replaceChildren(...Array.from({ length: table.mostPlayers - table.fewestPlayers + 1 }, (_, at) => el("option", String(table.fewestPlayers + at), { value: String(table.fewestPlayers + at) })));
  $("players").value = String(count);
  $("seed").value = String(game.seed);
  $("blurb").textContent = gameSays(kind, language.lang);
  $("blurb-ghost").replaceChildren(el("span", `${gameSays(kind, other())} ${STRINGS[other()].pageRules}`));
  $("blurb-ghost").lang = other();
  for (const unseen of document.querySelectorAll("[data-ghost-say]")) {
    unseen.textContent = STRINGS[other()][unseen.dataset.ghostSay];
    unseen.lang = other();
  }
  $("rules-link").href = `${RULES}#${ANCHORS[kind]}`;
}

function drawDeck() {
  const cards = shuffledDeck(deck.seed).map(cardId);
  deck.each = Math.min(deck.each, Math.floor(52 / deck.hands));
  $("deck-seed").value = String(deck.seed);
  $("deck-hands").replaceChildren(...Array.from({ length: 8 }, (_, at) => el("option", String(at + 1), { value: String(at + 1) })));
  $("deck-hands").value = String(deck.hands);
  $("deck-each").replaceChildren(...Array.from({ length: Math.floor(52 / deck.hands) }, (_, at) => el("option", String(at + 1), { value: String(at + 1) })));
  $("deck-each").value = String(deck.each);
  const hands = Array.from({ length: deck.hands }, (_, seat) => cards.slice(0, deck.hands * deck.each).filter((_, at) => at % deck.hands === seat));
  $("fans").replaceChildren(
    ...hands.map((hand, seat) => {
      const box = el("div", "", { class: "fan-box" });
      const fan = el("div", "", { class: "fan", "data-testid": "fan", style: `--mid: ${(hand.length - 1) / 2}; --overlap: ${hand.length > 7 ? 30 : 22}px; --turn-by: ${hand.length > 7 ? 2 : 3}deg` });
      fan.append(...hand.map((card, at) => Object.assign(cardEl(card, { small: true }), { style: `--at: ${at}` })));
      box.append(el("span", fillIn(t().seatName, { n: seat + 1 }), { class: "fam-label" }), fan);
      return box;
    }),
  );
  $("deck-left").textContent = fillIn(t().pageLeft, { n: 52 - deck.hands * deck.each });
  $("deck-code").textContent = writeCards(shuffledDeck(deck.seed));
}

function drawAll() {
  drawChooser();
  drawTable();
  drawLog();
  drawKeep();
  drawDeck();
  writeAddress();
}

/** The address is the link: the game, the table, the seed, and the look the cards are shown in. */
function writeAddress() {
  const query = new URLSearchParams();
  if (language.asked !== null) query.set("lang", language.asked);
  query.set("game", inAddress(kind));
  query.set("players", String(rules().seats(game).players.length));
  query.set("seed", String(game.seed));
  if (deck.seed !== 42) query.set("deck", String(deck.seed));
  lookQuery(query);
  history.replaceState(null, "", `?${query}`);
}

/** A new game: the kind given (or the one on the table), the players chosen, and the seed typed or a new one. */
function deal(next = kind, { count, seed } = {}) {
  const table = CARD_GAME_TABLES[next];
  const chosen = count ?? (next === kind ? whole($("players").value, table.fewestPlayers, table.mostPlayers) : null) ?? table.defaultPlayers;
  const players = NAMES.slice(0, chosen);
  kind = next;
  game = newGame(kind, { players, seed: seed ?? randomSeed(), computers: players.map((_, seat) => seat > 0) });
  picked = [];
  log = [];
  drawAll();
  dealt(game);
}

$("deal").addEventListener("click", () => deal());
wireSound((key) => t()[key]);
wireBacks((key) => t()[key]);
onLook(writeAddress);
$("players").addEventListener("change", () => deal(kind, { seed: game.seed }));
$("seed").addEventListener("change", () => {
  const seed = whole($("seed").value.trim(), 1, SEED_MOST);
  if (seed === null) $("seed").value = String(game.seed);
  else deal(kind, { count: rules().seats(game).players.length, seed });
});
for (const tab of document.querySelectorAll("[data-form]")) {
  tab.addEventListener("click", () => {
    form = tab.dataset.form;
    drawKeep();
  });
}
$("copy").addEventListener("click", async () => {
  let said = t().pageCopied;
  try {
    await navigator.clipboard.writeText($("kept").textContent);
  } catch {
    said = t().pageCopyFailed;
  }
  $("copy").textContent = said;
  setTimeout(() => ($("copy").textContent = t().pageCopy), 1500);
});
const read = () => {
  const back = fromJSON($("paste").value);
  $("read-error").textContent = back === null ? t().pageReadBad : "";
  $("paste").setAttribute("aria-invalid", String(back === null));
  if (back === null) return;
  clearTimeout(timer);
  kind = back.kind;
  game = back.game;
  picked = [];
  // The moves read back are shown as the table saw them: a computer's hidden cards stay hidden.
  const r = rules();
  const { size, players, computers, seed, moves } = game;
  let now = r.start(size, players, undefined, seed, computers);
  log = moves.map((move) => {
    const seat = r.toPlay(now);
    now = r.play(now, move);
    return { seat, move, mine: !computers[seat] };
  });
  $("paste").value = "";
  drawAll();
};
$("read").addEventListener("click", read);
$("paste").addEventListener("keydown", (event) => event.key === "Enter" && read());
$("shuffle").addEventListener("click", () => {
  deck.seed = randomSeed();
  drawAll();
});
$("deck-seed").addEventListener("change", () => {
  deck.seed = whole($("deck-seed").value.trim(), 1, SEED_MOST) ?? deck.seed;
  drawAll();
});
$("deck-hands").addEventListener("change", () => {
  deck.hands = Number($("deck-hands").value);
  drawAll();
});
$("deck-each").addEventListener("change", () => {
  deck.each = Number($("deck-each").value);
  drawAll();
});

const table = CARD_GAME_TABLES[kind];
deal(kind, {
  count: whole(asked.get("players") ?? hashCount, table.fewestPlayers, table.mostPlayers) ?? table.defaultPlayers,
  seed: whole(asked.get("seed") ?? hashSeed, 1, SEED_MOST) ?? undefined,
});
