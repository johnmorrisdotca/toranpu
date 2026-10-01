/**
 * THE SOUNDS OF A CARD TABLE: a card dealt, turned over, played, the deck
 * shuffled, a pile gathered in, a hand fanned. The recordings are real cards
 * (Kenney's Casino Audio, CC0; see docs/credits.md), loaded the first time a
 * sound is played and never before, so a page that stays silent never fetches
 * them. Where they cannot be loaded or decoded, a short sound made in the
 * browser stands in. Nothing here throws: a platform with no audio, a context
 * the browser holds still, or a failed decode is simply silent.
 *
 * Toranpu never makes a sound by itself. A table asks for one with `play`.
 */

/** Every kind of sound, in the order a game meets them. */
export const CARD_SOUND_KINDS = ["shuffle", "deal", "flip", "play", "gather", "fan"] as const;

/** One kind of sound: `deal` a card sent to a hand, `flip` a card turned over, `play` a card laid on the table, `shuffle` the deck shuffled, `gather` a pile swept in, `fan` a hand spread open. */
export type CardSoundKind = (typeof CARD_SOUND_KINDS)[number];

/** The recordings, by name (`deal-2`), as base64 AAC. */
export type CardSoundData = Readonly<Record<string, string>>;

/** The parts of a window the sounds use: an audio context and `atob`. Any of them may be missing. */
export type CardSoundWindow = {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
  atob?: (text: string) => string;
};

/** How a table's sounds are made. Every field may be left out. */
export type CardSoundsOptions = {
  /** Start muted: nothing plays, and nothing is fetched, until `setMuted(false)`. Unless said, not muted. */
  muted?: boolean;
  /** How loud, from 0 to 1. Unless said, 0.6. */
  volume?: number;
  /** Where the recordings come from: the package's own module unless another is handed in. */
  load?: () => Promise<{ CARD_SOUND_DATA: CardSoundData }>;
  /** The window to make sound in: the page's own unless another is handed in (a test's, or none for silence). */
  window?: CardSoundWindow | null;
};

/** How one sound is played. */
export type PlayCardSoundOptions = {
  /** How many cards: `deal` with 13 is thirteen cards dealt one after another (heard as at most `MOST_SOUNDS_AT_ONCE`). Unless said, one. */
  count?: number;
  /** Milliseconds between one card's sound and the next. Unless said, 85. */
  gap?: number;
  /** Milliseconds to wait before the first. Unless said, none. */
  delay?: number;
};

/** A table's sounds: `play` one, mute and unmute, change the volume, `close` when the table goes. */
export type CardSounds = {
  /** Play a sound, or several of one kind in a row; nothing while muted or closed. */
  play(kind: CardSoundKind, options?: PlayCardSoundOptions): void;
  /** Fetch and decode the recordings now, rather than at the first sound. True once they are ready; false where they cannot be had. */
  load(): Promise<boolean>;
  /** Whether it is muted. */
  readonly muted: boolean;
  /** Mute or unmute. Muting stops nothing already playing; it only keeps anything new from starting. */
  setMuted(muted: boolean): void;
  /** How loud, from 0 to 1. */
  volume: number;
  /** Stop for good, and let the audio context go. */
  close(): void;
};

/** As many sounds as one call plays: thirteen cards dealt are eight slides, not a wall of noise. */
export const MOST_SOUNDS_AT_ONCE = 8;

/** When each of `count` sounds starts, in milliseconds from the first: one every `gap`, and no more than `MOST_SOUNDS_AT_ONCE`, spread over the same time. */
export function soundTimes(count: number, gap = 85): number[] {
  const whole = Math.max(1, Math.floor(Number.isFinite(count) ? count : 1));
  const span = (whole - 1) * Math.max(0, gap);
  const heard = Math.min(whole, MOST_SOUNDS_AT_ONCE);
  if (heard === 1) return [0];
  return Array.from({ length: heard }, (_, at) => Math.round((at * span) / (heard - 1)));
}

type Loaded = Partial<Record<CardSoundKind, AudioBuffer[]>>;

const clampVolume = (value: number) => (Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.6);

function bytesOf(base64: string, atob: (text: string) => string): ArrayBuffer {
  const text = atob(base64);
  const bytes = new Uint8Array(text.length);
  for (let i = 0; i < text.length; i++) bytes[i] = text.charCodeAt(i);
  return bytes.buffer;
}

/** Decoding as a promise, on browsers that take callbacks and on those that return one. */
function decode(ctx: AudioContext, data: ArrayBuffer): Promise<AudioBuffer> {
  return new Promise((resolve, reject) => {
    const pending = ctx.decodeAudioData(data, resolve, reject) as Promise<AudioBuffer> | undefined;
    if (pending !== undefined && typeof pending.then === "function") pending.then(resolve, reject);
  });
}

/** What a sound made here is like, for when the recordings cannot be had: bursts of noise, each band-passed and cut off fast. */
const MADE: Record<CardSoundKind, { ticks: number; over: number; length: number; pitch: number }> = {
  deal: { ticks: 1, over: 0, length: 0.06, pitch: 2600 },
  flip: { ticks: 2, over: 0.03, length: 0.035, pitch: 3200 },
  play: { ticks: 1, over: 0, length: 0.05, pitch: 1500 },
  shuffle: { ticks: 14, over: 0.9, length: 0.03, pitch: 2800 },
  gather: { ticks: 3, over: 0.12, length: 0.08, pitch: 1900 },
  fan: { ticks: 8, over: 0.3, length: 0.025, pitch: 3400 },
};

/** A table's card sounds. Nothing is fetched and no audio context is made until the first sound. */
export function createCardSounds(options: CardSoundsOptions = {}): CardSounds {
  const win: CardSoundWindow | undefined = options.window === null ? undefined : (options.window ?? (typeof window === "undefined" ? undefined : (window as unknown as CardSoundWindow)));
  const load = options.load ?? ((): Promise<{ CARD_SOUND_DATA: CardSoundData }> => import("../sounds.ts"));
  let muted = options.muted === true;
  let volume = clampVolume(options.volume ?? 0.6);
  let ctx: AudioContext | null = null;
  let out: GainNode | null = null;
  let loaded: Promise<Loaded | null> | null = null;
  let closed = false;

  function context(): AudioContext | null {
    if (ctx !== null) return ctx;
    const Context = win?.AudioContext ?? win?.webkitAudioContext;
    if (Context === undefined) return null;
    ctx = new Context();
    out = ctx.createGain();
    out.gain.value = volume;
    out.connect(ctx.destination);
    return ctx;
  }

  function recordings(audio: AudioContext): Promise<Loaded | null> {
    loaded ??= (async () => {
      try {
        const atob = win?.atob ?? globalThis.atob;
        const { CARD_SOUND_DATA } = await load();
        const names = Object.keys(CARD_SOUND_DATA).sort();
        const buffers = await Promise.all(names.map((name) => decode(audio, bytesOf(CARD_SOUND_DATA[name] as string, atob))));
        const made: Loaded = {};
        names.forEach((name, at) => {
          const kind = name.replace(/-\d+$/, "") as CardSoundKind;
          if ((CARD_SOUND_KINDS as readonly string[]).includes(kind)) (made[kind] ??= []).push(buffers[at] as AudioBuffer);
        });
        return Object.keys(made).length > 0 ? made : null;
      } catch {
        return null;
      }
    })();
    return loaded;
  }

  function recorded(audio: AudioContext, buffer: AudioBuffer, at: number, gain: number) {
    const source = audio.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.value = 0.94 + Math.random() * 0.12;
    const level = audio.createGain();
    level.gain.value = gain;
    source.connect(level);
    level.connect(out as GainNode);
    source.start(at);
  }

  function madeHere(audio: AudioContext, kind: CardSoundKind, at: number, gain: number) {
    const shape = MADE[kind];
    const length = Math.max(1, Math.round(audio.sampleRate * shape.length));
    for (let tick = 0; tick < shape.ticks; tick++) {
      const buffer = audio.createBuffer(1, length, audio.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** 3;
      const source = audio.createBufferSource();
      source.buffer = buffer;
      const band = audio.createBiquadFilter();
      band.type = "bandpass";
      band.frequency.value = shape.pitch * (0.9 + Math.random() * 0.2);
      band.Q.value = 1.2;
      const level = audio.createGain();
      level.gain.value = gain * 1.4;
      source.connect(band);
      band.connect(level);
      level.connect(out as GainNode);
      source.start(at + (shape.ticks === 1 ? 0 : (tick * shape.over) / (shape.ticks - 1)) + Math.random() * 0.006);
    }
  }

  function schedule(audio: AudioContext, sounds: Loaded | null, kind: CardSoundKind, times: number[], began: number) {
    const pick = <T>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)] as T;
    const each = 0.9 / Math.sqrt(times.length);
    // The first sound waits for the recordings to be fetched and decoded; the rest keep their spacing from it, so nothing is lost or bunched.
    const late = Math.max(0, audio.currentTime - began);
    for (const ms of times) {
      const at = began + late + ms / 1000;
      const gain = each * (0.8 + Math.random() * 0.4);
      const takes = sounds?.[kind];
      if (takes !== undefined && takes.length > 0) recorded(audio, pick(takes), at, gain);
      else madeHere(audio, kind, at, gain);
    }
  }

  return {
    play(kind, how = {}) {
      if (closed || muted || !(CARD_SOUND_KINDS as readonly string[]).includes(kind)) return;
      try {
        const audio = context();
        if (audio === null) return;
        const times = soundTimes(how.count ?? 1, how.gap ?? 85).map((ms) => ms + Math.max(0, how.delay ?? 0));
        const go = () => {
          const began = audio.currentTime;
          void recordings(audio).then((sounds) => {
            try {
              if (!closed && !muted) schedule(audio, sounds, kind, times, began);
            } catch {
              // A node that will not start is a card without its sound, nothing more.
            }
          });
        };
        // A browser holds a context still until the page has been touched; a sound asked for by code before then stays silent.
        if (audio.state === "running") go();
        else
          void audio.resume().then(
            () => {
              if (audio.state === "running") go();
            },
            () => undefined,
          );
      } catch {
        // No audio here, or none allowed: the game goes on.
      }
    },
    async load() {
      if (closed) return false;
      try {
        const audio = context();
        if (audio === null) return false;
        return (await recordings(audio)) !== null;
      } catch {
        return false;
      }
    },
    get muted() {
      return muted;
    },
    setMuted(next) {
      muted = next === true;
    },
    get volume() {
      return volume;
    },
    set volume(next) {
      volume = clampVolume(next);
      if (out !== null) out.gain.value = volume;
    },
    close() {
      closed = true;
      try {
        void ctx?.close().catch(() => undefined);
      } catch {
        // Already closed.
      }
      ctx = null;
    },
  };
}
