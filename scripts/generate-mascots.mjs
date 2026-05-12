#!/usr/bin/env node
/**
 * Generate the TallyTails mascot set + composite scenes + wordmark + favicon
 * via fal.ai's FLUX Pro 1.1 endpoint. Reads prompts from this file
 * (synced with docs/mascot-prompts.md), saves PNGs to public/brand/.
 *
 * Run:
 *   node scripts/generate-mascots.mjs                # full set
 *   node scripts/generate-mascots.mjs --only cat-idle   # one image
 *   node scripts/generate-mascots.mjs --dry            # print prompts, no API calls
 */
import { writeFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT_MASCOTS = join(ROOT, "public/brand/mascots");
const OUT_SCENES = join(ROOT, "public/brand/scenes");
const OUT_BRAND = join(ROOT, "public/brand");

// Load FAL_KEY from .env. Format: KEY=value lines.
async function loadFalKey() {
  if (process.env.FAL_KEY) return process.env.FAL_KEY;
  try {
    const env = await readFile(join(ROOT, ".env"), "utf8");
    const match = env.match(/^FAL_KEY=(.+)$/m);
    if (match) return match[1].trim();
  } catch {}
  throw new Error("FAL_KEY not set in env or .env");
}

const STYLE = "Flat illustration style, modern brand mascot, clean vector look, slight grainy texture, warm muted lighting, off-white background, no shadows, no text, single character centered, full body, square composition.";

const CAT_BASE = "Smug, slim, mostly black cat with a small white chest blaze and gold eyes. Russian-blue tuxedo hybrid look. Slightly arched eyebrows, knowing expression, judging-but-not-unfriendly energy.";

const DOG_BASE = "Earnest golden retriever, slightly chubby, floppy ears, big pink tongue, perpetual good mood. Light caramel cream coat with darker ears and tail tip. Loyal best friend energy.";

// Each image: { name, prompt, seed, size, subdir }
const IMAGES = [
  // --- Cat poses (seed 42) ---
  { name: "cat-idle", prompt: `${STYLE} ${CAT_BASE} Standing upright on hind legs, paws crossed across chest, head slightly tilted, looking directly at viewer.`, seed: 42, size: "square_hd", subdir: "mascots" },
  { name: "cat-victory-throne", prompt: `${STYLE} ${CAT_BASE} Sitting on a small simple wooden throne, one paw raised in salute, eyes half-closed in smug satisfaction.`, seed: 42, size: "square_hd", subdir: "mascots" },
  { name: "cat-sulking", prompt: `${STYLE} ${CAT_BASE} Slumped, ears back, tail wrapped around paws, looking down at the ground, defeated.`, seed: 42, size: "square_hd", subdir: "mascots" },
  { name: "cat-plotting", prompt: `${STYLE} ${CAT_BASE} Leaning forward, eyes narrowed, devious half-smile, plotting revenge.`, seed: 42, size: "square_hd", subdir: "mascots" },
  { name: "cat-dance", prompt: `${STYLE} ${CAT_BASE} Mid-jump in victory dance, paws in the air, mouth open in celebration.`, seed: 42, size: "square_hd", subdir: "mascots" },
  { name: "cat-side-eye", prompt: `${STYLE} ${CAT_BASE} Head turned three-quarters, looking sideways at viewer with deep skepticism.`, seed: 42, size: "square_hd", subdir: "mascots" },
  { name: "cat-stretched", prompt: `${STYLE} ${CAT_BASE} Classic cat stretch, arched back, front paws extended forward, tail up.`, seed: 42, size: "square_hd", subdir: "mascots" },
  { name: "cat-shocked", prompt: `${STYLE} ${CAT_BASE} Eyes wide, small "o" mouth, paws on cheeks, shocked expression.`, seed: 42, size: "square_hd", subdir: "mascots" },

  // --- Dog poses (seed 84) ---
  { name: "dog-idle", prompt: `${STYLE} ${DOG_BASE} Standing on all four legs, head up, tongue slightly out, tail mid-wag.`, seed: 84, size: "square_hd", subdir: "mascots" },
  { name: "dog-victory-trophy", prompt: `${STYLE} ${DOG_BASE} Sitting upright on hind legs, holding a small gold trophy between front paws, beaming smile, tongue out.`, seed: 84, size: "square_hd", subdir: "mascots" },
  { name: "dog-sulking", prompt: `${STYLE} ${DOG_BASE} Lying down, head resting on front paws, big sad puppy eyes looking up.`, seed: 84, size: "square_hd", subdir: "mascots" },
  { name: "dog-plotting", prompt: `${STYLE} ${DOG_BASE} Head tilted sideways, one ear flopped, eyebrows raised in adorable confusion, "wait, what?" pose.`, seed: 84, size: "square_hd", subdir: "mascots" },
  { name: "dog-dance", prompt: `${STYLE} ${DOG_BASE} Front paws on the ground, butt in the air, tail visibly wagging, classic zoomies play-bow posture.`, seed: 84, size: "square_hd", subdir: "mascots" },
  { name: "dog-side-eye", prompt: `${STYLE} ${DOG_BASE} Looking sideways at viewer with goofy concern.`, seed: 84, size: "square_hd", subdir: "mascots" },
  { name: "dog-stretched", prompt: `${STYLE} ${DOG_BASE} Classic downward-dog yoga stretch, front legs forward and low, butt high.`, seed: 84, size: "square_hd", subdir: "mascots" },
  { name: "dog-shocked", prompt: `${STYLE} ${DOG_BASE} Eyes wide, mouth dropped open, ears straight up, completely shocked.`, seed: 84, size: "square_hd", subdir: "mascots" },

  // --- Composite scenes (landscape) ---
  { name: "scene-cats-dominating", prompt: `Two character flat illustration in modern brand mascot style. Smug black cat with gold eyes sitting on a small wooden throne on the left, paw raised in salute. Golden retriever dog lying on the ground on the right, looking up sadly. Off-white background, no text, no shadows, slight grainy texture.`, seed: 200, size: "landscape_16_9", subdir: "scenes" },
  { name: "scene-dogs-dominating", prompt: `Two character flat illustration in modern brand mascot style. Golden retriever dog on the right holding a small gold trophy between paws, beaming with tongue out. Smug black cat on the left, eyes narrowed, devious smile, plotting. Off-white background, no text, no shadows, slight grainy texture.`, seed: 201, size: "landscape_16_9", subdir: "scenes" },
  { name: "scene-close-race", prompt: `Two character flat illustration in modern brand mascot style. Smug black cat on the left and golden retriever dog on the right pulling on opposite ends of a thick rope, tug of war. Both leaning back with effort, rope perfectly horizontal in the middle. Off-white background, no text, no shadows, slight grainy texture.`, seed: 202, size: "landscape_16_9", subdir: "scenes" },
  { name: "scene-upset-cats", prompt: `Two character flat illustration in modern brand mascot style. Smug black cat on the left mid-jump in victory dance, paws in air. Golden retriever dog on the right with eyes wide, mouth dropped open, ears straight up in shock. Off-white background, no text, no shadows, slight grainy texture.`, seed: 203, size: "landscape_16_9", subdir: "scenes" },
  { name: "scene-upset-dogs", prompt: `Two character flat illustration in modern brand mascot style. Golden retriever dog on the right mid-zoomies, butt in the air, tail wagging. Smug black cat on the left with eyes wide, paws on cheeks, shocked expression. Off-white background, no text, no shadows, slight grainy texture.`, seed: 204, size: "landscape_16_9", subdir: "scenes" },
  { name: "scene-stalemate", prompt: `Two character flat illustration in modern brand mascot style. Smug black cat and golden retriever dog sitting side by side facing forward, sharing a small bucket of popcorn between them. Both looking up at the viewer expectantly. Off-white background, no text, no shadows, slight grainy texture.`, seed: 205, size: "landscape_16_9", subdir: "scenes" },

  // --- Wordmark + favicon ---
  { name: "logo-wordmark", prompt: `Flat illustration brand wordmark reading "TallyTails", lowercase letters, friendly rounded serif typeface in warm cream color on a transparent looking background. Small silhouette of a cat ear above the first T, small silhouette of a dog tail curling under the last s. No other elements, no shadows, clean vector wordmark, off-white background.`, seed: 300, size: "landscape_16_9", subdir: "" },
  { name: "favicon", prompt: `Flat illustration brand mark icon, two small character heads in profile facing each other. Smug black cat head on the left, smiling golden retriever head on the right. Between them a thin vertical line divider. Warm cream background, modern minimalist, no text, no shadows, square composition.`, seed: 301, size: "square", subdir: "" },
];

async function generateOne(falKey, image) {
  const body = {
    prompt: image.prompt,
    image_size: image.size,
    num_images: 1,
    seed: image.seed,
    enable_safety_checker: false,
    output_format: "png",
  };
  const res = await fetch("https://fal.run/fal-ai/flux-pro/v1.1", {
    method: "POST",
    headers: {
      "Authorization": `Key ${falKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`fal.ai ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json();
  const url = data.images?.[0]?.url;
  if (!url) throw new Error(`No image url in response: ${JSON.stringify(data).slice(0, 300)}`);

  const imgRes = await fetch(url);
  if (!imgRes.ok) throw new Error(`download ${imgRes.status} from ${url}`);
  const buf = Buffer.from(await imgRes.arrayBuffer());

  const dir = image.subdir ? join(OUT_BRAND, image.subdir) : OUT_BRAND;
  await mkdir(dir, { recursive: true });
  const outPath = join(dir, `${image.name}.png`);
  await writeFile(outPath, buf);
  return { name: image.name, path: outPath, bytes: buf.length, url };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const onlyIdx = args.indexOf("--only");
  const onlyName = onlyIdx >= 0 ? args[onlyIdx + 1] : null;

  const targets = onlyName ? IMAGES.filter((i) => i.name === onlyName) : IMAGES;
  if (targets.length === 0) {
    console.error(`No matching image: ${onlyName}`);
    process.exit(1);
  }

  if (dry) {
    for (const img of targets) {
      console.log(`[dry] ${img.name} (${img.size}, seed ${img.seed})`);
      console.log(`      ${img.prompt.slice(0, 120)}...`);
    }
    return;
  }

  const falKey = await loadFalKey();
  await mkdir(OUT_MASCOTS, { recursive: true });
  await mkdir(OUT_SCENES, { recursive: true });

  console.log(`Generating ${targets.length} images via fal.ai/flux-pro/v1.1...`);
  const start = Date.now();
  const results = [];
  const errors = [];

  // Parallel with mild throttling. fal.ai handles bursts fine but 24 at once
  // can occasionally hit rate caps.
  const CONC = 6;
  const queue = [...targets];
  async function worker() {
    while (queue.length) {
      const img = queue.shift();
      if (!img) return;
      const t0 = Date.now();
      try {
        const r = await generateOne(falKey, img);
        const sec = ((Date.now() - t0) / 1000).toFixed(1);
        console.log(`  ✓ ${img.name} (${(r.bytes / 1024).toFixed(0)}kb, ${sec}s)`);
        results.push(r);
      } catch (e) {
        console.error(`  ✗ ${img.name}: ${e.message}`);
        errors.push({ name: img.name, error: e.message });
      }
    }
  }
  await Promise.all(Array.from({ length: CONC }, worker));

  const totalSec = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone in ${totalSec}s. ${results.length} ok, ${errors.length} failed.`);
  if (errors.length) {
    console.log("Errors:", errors);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
