#!/usr/bin/env node
// Adds a performance to the Music page.
//   node tools/add-performance.mjs
// It asks a few questions, then saves the entry in src/data/performances.json.
// Video: paste a YouTube / Instagram / TikTok link, or drag a video file from Finder
// into the terminal. Files must be under 25 MB (Cloudflare Pages' limit per file);
// anything bigger, upload to YouTube as "Unlisted" and paste that link instead.
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, copyFileSync } from "node:fs";
import { extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DATA = join(ROOT, "src/data/performances.json");
const MAX = 25 * 1024 * 1024;
const rl = createInterface({ input: stdin, output: stdout });
const ask = async (q, fallback = "") => ((await rl.question(q)).trim() || fallback);
const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60);

console.log("\nAdd a performance to tayyong.com/music\n");
const title = await ask("Title (e.g. What if Golden Hour had a viola part): ");
if (!title) { console.log("A title is needed. Nothing saved."); process.exit(1); }
let instrument = (await ask("Instrument: keys or strings? [strings] ", "strings")).toLowerCase();
if (!["keys", "strings"].includes(instrument)) instrument = instrument.startsWith("k") ? "keys" : "strings";
const piece = await ask("Song or piece (optional): ");
const date = await ask("When? YYYY-MM (e.g. 2026-11) [this month] ", new Date().toISOString().slice(0, 7));
const where = await ask("Where (optional, e.g. Astoria, NYC): ");
let url = (await ask("Paste a link, or drag the video file here: ")).replace(/^['"]|['"]$/g, "").replace(/\\(.)/g, "$1");

if (url && !/^https?:\/\//.test(url)) {
  const file = resolve(url.replace(/^~(?=\/)/, process.env.HOME || "~"));
  if (!existsSync(file)) { console.log(`\nCouldn't find ${file}. Nothing saved.`); process.exit(1); }
  const size = statSync(file).size;
  if (size > MAX) {
    console.log(`\nThat file is ${(size / 1048576).toFixed(1)} MB. The site can only host files under 25 MB.`);
    console.log("Upload it to YouTube as Unlisted, then run this again and paste the YouTube link. Nothing saved.");
    process.exit(1);
  }
  mkdirSync(join(ROOT, "public/music"), { recursive: true });
  const name = `${date}-${slug(title)}${extname(file).toLowerCase()}`;
  copyFileSync(file, join(ROOT, "public/music", name));
  url = `/music/${name}`;
  console.log(`Copied the video to public/music/${name}`);
}
if (!url) { console.log("A link or file is needed. Nothing saved."); process.exit(1); }

const list = existsSync(DATA) ? JSON.parse(readFileSync(DATA, "utf8")) : [];
const entry = { title, instrument, date, url };
if (piece) entry.piece = piece;
if (where) entry.where = where;
list.push(entry);
list.sort((a, b) => String(b.date).localeCompare(String(a.date)));
writeFileSync(DATA, JSON.stringify(list, null, 2) + "\n");
rl.close();

console.log(`\nSaved "${title}" (${instrument}). ${list.length} performance${list.length === 1 ? "" : "s"} in total.`);
console.log("Check it with: npm run dev   then open http://localhost:4321/music");
console.log('Put it live with: git add -A && git commit -m "Add performance" && git push\n');
