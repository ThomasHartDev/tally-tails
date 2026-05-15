#!/usr/bin/env node
/**
 * Generate full-screen UI mockup images for the TallyTails homepage in
 * three different aesthetic directions via fal.ai FLUX Pro 1.1. Saves
 * PNGs to public/brand/mockups/.
 *
 * These are STATIC IMAGES, not interactive prototypes — for art-direction
 * decisions only. The picked direction then drives the actual frontend
 * implementation in a follow-up PR.
 *
 * Three explicit anti-default directions: BarkBox playful pastels, Liquid
 * Death edgy black, and warm earth-tone tribal. All three include the
 * same functional elements (tally bar, split hero, catalog grid, trust bar)
 * so the comparison is honest.
 *
 * Run:
 *   node scripts/generate-ui-mockups.mjs                # all 3
 *   node scripts/generate-ui-mockups.mjs --only barkbox  # one
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT_DIR = join(ROOT, "public/brand/mockups");

async function loadFalKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  const env = await readFile(join(ROOT, ".env"), "utf8");
  const m = env.match(/^FAL_KEY=(.+)$/m);
  if (!m) throw new Error("FAL_KEY not in .env");
  return m[1].trim();
}

const FUNCTIONAL_REQS =
  "Pet ecommerce website homepage screenshot. Layout from top to bottom: " +
  "(1) thin tally bar showing CAT 4,217 vs DOG 3,891 with 'Cats up by 326 this week' text. " +
  "(2) Split-screen hero, cat side on the left with a cartoon black cat mascot, " +
  "dog side on the right with a cartoon golden retriever mascot, each side has a 'Shop cat side' / 'Shop dog side' button. " +
  "(3) Trust bar with four icons: '$5 flat shipping', 'Free over $50', '30-day returns', 'US warehouses'. " +
  "(4) Product grid of 8 cards in 4 columns, each card has a product name, price like '$44.99', and a small colored stripe indicating cat or dog side. " +
  "(5) Subscription banner: '$19.99/mo Tribe Box' with two side-by-side buttons 'Cat Tribe Box' and 'Dog Tribe Box'. " +
  "Web design mockup, 1440x900, desktop layout, sharp text, professional ecommerce design.";

const DIRECTIONS = [
  {
    name: "barkbox-playful",
    prompt:
      FUNCTIONAL_REQS +
      " AESTHETIC: BarkBox-style. Bold saturated playful colors — coral, mint, sunshine yellow, plum. Chunky hand-drawn cartoon mascots with thick black outlines, big expressive eyes. Display font is a quirky rounded sans like Fraunces or Recoleta with custom weight. Cards have rounded corners, dotted patterns, sticker-style badges. Energetic. Pet-store friendly, anti-SaaS. Color blocking, not monochrome. Background has subtle grain texture.",
  },
  {
    name: "liquid-death-edgy",
    prompt:
      FUNCTIONAL_REQS +
      " AESTHETIC: Liquid Death-style. Black background dominant. Bold metal-band typography for the tally numbers, like a heavy metal poster. Cat side accented in toxic green, dog side in blood-orange. Mascots illustrated in punk/skater zine style, black-and-white with selective spot color. Brutalist grid, hard edges, no rounded corners. Sticker-pack aesthetic. Anti-corporate, rebellious, makes pet stuff feel like a band merch drop.",
  },
  {
    name: "tribal-warm-earth",
    prompt:
      FUNCTIONAL_REQS +
      " AESTHETIC: Cole & Marmalade meets Aesop. Warm earth tones — terracotta, sage, ochre, cream, charcoal. Hand-drawn illustration with watercolor texture. Mascots feel storybook-illustrated, not vector. Display font is a quirky transitional serif like Cooper Black or Bookmania. Layout has ribbon-banner motifs and woodcut-style decorative borders. Feels handmade, craft-store, neighborhood-pet-shop. Anti-tech, anti-minimalist.",
  },
];

async function generate(falKey, direction) {
  const body = {
    prompt: direction.prompt,
    image_size: "landscape_16_9",
    num_images: 1,
    seed: Math.floor(Math.random() * 1000),
    enable_safety_checker: false,
    output_format: "png",
  };
  const res = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
    method: "POST",
    headers: {
      Authorization: `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`fal.ai ${res.status}: ${t.slice(0, 300)}`);
  }
  const data = await res.json();
  const url = data.images?.[0]?.url;
  if (!url) throw new Error("No image URL in fal response");
  const imgRes = await fetch(url);
  const buf = Buffer.from(await imgRes.arrayBuffer());
  await mkdir(OUT_DIR, { recursive: true });
  const outPath = join(OUT_DIR, `${direction.name}.png`);
  await writeFile(outPath, buf);
  return { name: direction.name, path: outPath, bytes: buf.length };
}

async function main() {
  const args = process.argv.slice(2);
  const onlyIdx = args.indexOf("--only");
  const only = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
  const targets = only ? DIRECTIONS.filter(d => d.name === only) : DIRECTIONS;
  if (!targets.length) { console.error(`Unknown direction: ${only}`); process.exit(1); }

  const falKey = await loadFalKey();
  console.log(`Generating ${targets.length} mockups via fal.ai FLUX Pro 1.1...`);
  const start = Date.now();
  const results = [];
  await Promise.all(targets.map(async (d) => {
    const t0 = Date.now();
    try {
      const r = await generate(falKey, d);
      const sec = ((Date.now() - t0) / 1000).toFixed(1);
      console.log(`  ✓ ${d.name} (${(r.bytes / 1024).toFixed(0)}kb, ${sec}s)`);
      results.push(r);
    } catch (e) {
      console.error(`  ✗ ${d.name}: ${e.message}`);
    }
  }));
  const totalSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${totalSec}s. ${results.length}/${targets.length} succeeded.`);
}

main().catch(e => { console.error(e); process.exit(1); });
