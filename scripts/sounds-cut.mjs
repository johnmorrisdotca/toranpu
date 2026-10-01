// Cuts the card sounds in ./sounds from Kenney's Casino Audio pack (CC0; see docs/credits.md).
// Run by hand, once, on a Mac (it uses macOS's own `afconvert` to decode Ogg Vorbis and to encode AAC):
//
//   node scripts/sounds-cut.mjs <the pack's Audio folder>
//
// Each recording is decoded, mixed to one channel, cut to the part with sound in it, faded at both
// ends, brought to the same peak level and encoded as AAC at 48 kbit/s in an .m4a, which every
// current browser decodes, Safari on an iPhone included. Then `pnpm sounds` writes them into
// src/sounds.ts. Nothing here runs in CI or is published.
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import process from "node:process";

/** What each file here is cut from: the pack's file, and the most of it kept, in seconds. */
const CUTS = {
  "deal-1": ["card-slide-1.ogg", 0.4],
  "deal-2": ["card-slide-2.ogg", 0.4],
  "deal-3": ["card-slide-3.ogg", 0.4],
  "deal-4": ["card-slide-5.ogg", 0.4],
  "flip-1": ["card-slide-4.ogg", 0.35],
  "flip-2": ["card-slide-7.ogg", 0.4],
  "play-1": ["card-place-1.ogg", 0.4],
  "play-2": ["card-place-2.ogg", 0.35],
  "play-3": ["card-place-4.ogg", 0.4],
  "shuffle-1": ["card-shuffle.ogg", 1.6],
  "gather-1": ["card-shove-1.ogg", 0.6],
  "gather-2": ["card-shove-3.ogg", 0.55],
  "fan-1": ["card-fan-1.ogg", 0.6],
};

const from = process.argv[2];
if (from === undefined) {
  console.error("Usage: node scripts/sounds-cut.mjs <the Casino Audio pack's Audio folder>");
  process.exit(2);
}
const scratch = mkdtempSync(join(tmpdir(), "toranpu-sounds-"));

/** The samples of a 16-bit PCM WAV, mixed to one channel, from -1 to 1. */
function readWav(path) {
  const file = readFileSync(path);
  let at = 12;
  let channels = 2;
  let rate = 44100;
  while (at < file.length) {
    const id = file.toString("latin1", at, at + 4);
    const size = file.readUInt32LE(at + 4);
    if (id === "fmt ") {
      channels = file.readUInt16LE(at + 10);
      rate = file.readUInt32LE(at + 12);
    }
    if (id === "data") {
      const frames = size / 2 / channels;
      const out = new Float32Array(frames);
      for (let i = 0; i < frames; i++) {
        let sum = 0;
        for (let c = 0; c < channels; c++) sum += file.readInt16LE(at + 8 + (i * channels + c) * 2);
        out[i] = sum / channels / 32768;
      }
      return { samples: out, rate };
    }
    at += 8 + size;
  }
  throw new Error(`${path}: no data`);
}

function writeWav(path, samples, rate) {
  const data = Buffer.alloc(samples.length * 2);
  samples.forEach((value, i) => data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(value * 32767))), i * 2));
  const head = Buffer.alloc(44);
  head.write("RIFF", 0, "latin1");
  head.writeUInt32LE(36 + data.length, 4);
  head.write("WAVEfmt ", 8, "latin1");
  head.writeUInt32LE(16, 16);
  head.writeUInt16LE(1, 20);
  head.writeUInt16LE(1, 22);
  head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * 2, 28);
  head.writeUInt16LE(2, 32);
  head.writeUInt16LE(16, 34);
  head.write("data", 36, "latin1");
  head.writeUInt32LE(data.length, 40);
  writeFileSync(path, Buffer.concat([head, data]));
}

/**
 * The file without the empty `free` box afconvert leaves before the audio (about 3 kB, more than a
 * short sound itself): the box is dropped and the audio's offsets in `stco` moved back by its size.
 */
function withoutFree(file) {
  const boxes = [];
  for (let at = 0; at < file.length; at += file.readUInt32BE(at)) boxes.push({ at, size: file.readUInt32BE(at), type: file.toString("latin1", at + 4, at + 8) });
  const free = boxes.filter((box) => box.type === "free");
  const gone = free.reduce((sum, box) => sum + box.size, 0);
  const kept = Buffer.concat(boxes.filter((box) => box.type !== "free").map((box) => file.subarray(box.at, box.at + box.size)));
  const stco = kept.indexOf("stco", 0, "latin1");
  const count = kept.readUInt32BE(stco + 8);
  for (let i = 0; i < count; i++) {
    const where = stco + 12 + i * 4;
    kept.writeUInt32BE(kept.readUInt32BE(where) - gone, where);
  }
  return kept;
}

for (const [name, [source, most]] of Object.entries(CUTS)) {
  const wav = join(scratch, `${name}.wav`);
  execFileSync("afconvert", ["-f", "WAVE", "-d", "LEI16", join(from, source), wav]);
  const { samples, rate } = readWav(wav);
  const peak = samples.reduce((top, value) => Math.max(top, Math.abs(value)), 0);
  // The sound starts where it first reaches a tenth of its peak, less a few milliseconds of run-up.
  const first = samples.findIndex((value) => Math.abs(value) >= peak * 0.1);
  const start = Math.max(0, first - Math.round(rate * 0.004));
  let end = samples.length;
  while (end > start && Math.abs(samples[end - 1]) < peak * 0.01) end -= 1;
  end = Math.min(end, start + Math.round(rate * most));
  const cut = samples.slice(start, end);
  const fadeIn = Math.round(rate * 0.003);
  const fadeOut = Math.min(Math.round(rate * 0.06), Math.floor(cut.length / 3));
  for (let i = 0; i < fadeIn; i++) cut[i] *= i / fadeIn;
  for (let i = 0; i < fadeOut; i++) cut[cut.length - 1 - i] *= i / fadeOut;
  const level = 0.89 / peak; // every recording to the same peak, a decibel under full
  for (let i = 0; i < cut.length; i++) cut[i] *= level;
  writeWav(wav, cut, rate);
  const m4a = join(scratch, `${name}.m4a`);
  execFileSync("afconvert", ["-f", "m4af", "-d", "aac", "-b", "48000", "-c", "1", wav, m4a]);
  writeFileSync(join("sounds", `${name}.m4a`), withoutFree(readFileSync(m4a)));
  console.log(`sounds/${name}.m4a from ${source}: ${(cut.length / rate).toFixed(2)} s, ${readFileSync(join("sounds", `${name}.m4a`)).length} bytes`);
}
rmSync(scratch, { recursive: true, force: true });
