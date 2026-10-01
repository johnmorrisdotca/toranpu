// The demo's sounds: one player for the page, the table's Sound switch (off until pressed, and
// remembered on the device), and the panel that plays each kind of sound on a tap.
import { CARD_SOUND_KINDS, createCardSounds } from "./dist/card-sounds.js";

const KEY = "toranpu.page.sound";
const $ = (id) => document.getElementById(id);
let remembered = null;
try {
  remembered = localStorage.getItem(KEY);
} catch {
  // A browser that keeps nothing starts with the sound off, as everybody does.
}

/** The page's one player. The panel's buttons always sound; the table only while its switch is on. */
export const player = createCardSounds();
export const table = { on: remembered === "on" };

/** Every card a move names, in any field. */
const cardsIn = (move) => Object.values(move).flatMap((value) => (Array.isArray(value) ? value : [value])).filter((value) => typeof value === "string" && /^[A2-9TJQK][SHDC]$/.test(value));
const held = (game) => (game?.hands ?? []).reduce((sum, hand) => sum + hand.length, 0);

/** A new deal at the table: the deck shuffled, then every card dealt. */
export function dealt(game) {
  if (!table.on) return;
  player.play("shuffle");
  player.play("deal", { count: held(game), gap: 60, delay: 1100 });
}

/** A move at the table, heard from the game before it and after it: a card played or drawn, a trick or a pile taken in, a new deal. */
export function moved(before, after, move) {
  if (!table.on) return;
  if ("draw" in move) player.play("deal");
  else if (cardsIn(move).length > 0) player.play("play", { count: cardsIn(move).length, gap: 70 });
  const trickBefore = before.trick?.length ?? 0;
  const trickAfter = after.trick?.length ?? 0;
  const pileBefore = before.pile?.cards?.length ?? 0;
  const pileAfter = after.pile?.cards?.length ?? 0;
  if ((trickBefore > 0 && trickAfter === 0) || (pileBefore > 0 && pileAfter === 0)) player.play("gather", { delay: 260 });
  // More cards in the hands than a move could put there is a new deal.
  if (held(after) > held(before) + 2) dealt(after);
}

/** The switch by the Deal button, and the panel of sounds. `say` gives a word in the page's language. */
export function wire(say) {
  const button = $("sound");
  const show = () => button.setAttribute("aria-pressed", String(table.on));
  button.addEventListener("click", () => {
    table.on = !table.on;
    try {
      localStorage.setItem(KEY, table.on ? "on" : "off");
    } catch {
      // Not remembered; still switched.
    }
    show();
    if (table.on) player.play("flip");
  });
  show();
  const box = $("sound-kinds");
  const names = { shuffle: "pageSoundShuffle", deal: "pageSoundDeal", flip: "pageSoundFlip", play: "pageSoundPlay", gather: "pageSoundGather", fan: "pageSoundFan" };
  box.replaceChildren(
    ...CARD_SOUND_KINDS.map((kind) => {
      const one = document.createElement("button");
      one.type = "button";
      one.className = "fam-button";
      one.dataset.testid = `sound-${kind}`;
      one.dataset.say = names[kind];
      one.textContent = say(names[kind]);
      one.addEventListener("click", () => player.play(kind, kind === "deal" ? { count: 5, gap: 110 } : {}));
      return one;
    }),
  );
}
