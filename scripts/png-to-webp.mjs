#!/usr/bin/env node
/**
 * Convert every PNG under public/brand/ to a WebP next to it (quality 88,
 * lossless: false). Keeps the PNGs around in case we want to re-derive
 * other formats later; .gitignore handles whether they ship.
 */
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const BRAND = join(ROOT, "public/brand");

async function walk(dir) {
  const out = [];
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const s = await stat(full);
    if (s.isDirectory()) out.push(...(await walk(full)));
    else if (name.endsWith(".png")) out.push(full);
  }
  return out;
}

async function main() {
  const pngs = await walk(BRAND);
  console.log(`Converting ${pngs.length} PNGs to WebP...`);
  let totalIn = 0;
  let totalOut = 0;
  for (const png of pngs) {
    const webp = png.replace(/\.png$/, ".webp");
    const buf = await sharp(png).webp({ quality: 88 }).toBuffer();
    await (await import("node:fs/promises")).writeFile(webp, buf);
    const inBytes = (await stat(png)).size;
    totalIn += inBytes;
    totalOut += buf.length;
    const rel = png.slice(ROOT.length);
    console.log(`  ${rel}  ${(inBytes / 1024).toFixed(0)}kb → ${(buf.length / 1024).toFixed(0)}kb`);
  }
  console.log(`\nTotal ${(totalIn / 1024).toFixed(0)}kb → ${(totalOut / 1024).toFixed(0)}kb (${((totalOut / totalIn) * 100).toFixed(1)}%)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
