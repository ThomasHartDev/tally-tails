#!/usr/bin/env node
/**
 * Seed the 30-SKU TallyTails catalog via Shopify Admin GraphQL.
 * Idempotent: skips products that already exist (matched by handle).
 *
 * Source-of-truth schema in docs/catalog-seed.md.
 *
 * Run:
 *   node scripts/seed-catalog.mjs              # full seed
 *   node scripts/seed-catalog.mjs --dry        # print planned products, no API calls
 *   node scripts/seed-catalog.mjs --only=cat-pebble-fountain  # seed one
 *
 * Uses the offline-refreshable Admin token from .env. If SHOPIFY_ADMIN_TOKEN
 * is expired (24h lifetime), this script refreshes it via the client_credentials
 * grant against /admin/oauth/access_token using SHOPIFY_APP_CLIENT_ID and
 * SHOPIFY_APP_CLIENT_SECRET.
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const ENV_PATH = join(ROOT, ".env");

async function loadEnv() {
  const text = await readFile(ENV_PATH, "utf8");
  const env = {};
  for (const line of text.split("\n")) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

async function refreshAdminToken(env) {
  const res = await fetch(`https://${env.PUBLIC_STORE_DOMAIN}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: `client_id=${env.SHOPIFY_APP_CLIENT_ID}&client_secret=${env.SHOPIFY_APP_CLIENT_SECRET}&grant_type=client_credentials`,
  });
  if (!res.ok) throw new Error(`token refresh ${res.status}: ${await res.text()}`);
  const data = await res.json();
  // Write back to .env
  let text = await readFile(ENV_PATH, "utf8");
  if (text.match(/^SHOPIFY_ADMIN_TOKEN=.*/m)) {
    text = text.replace(/^SHOPIFY_ADMIN_TOKEN=.*/m, `SHOPIFY_ADMIN_TOKEN=${data.access_token}`);
  } else {
    text += `\nSHOPIFY_ADMIN_TOKEN=${data.access_token}\n`;
  }
  await writeFile(ENV_PATH, text);
  console.log(`  refreshed admin token (expires in ${data.expires_in}s)`);
  return data.access_token;
}

async function gqlAdmin(env, token, query, variables) {
  const res = await fetch(`https://${env.PUBLIC_STORE_DOMAIN}/admin/api/2025-01/graphql.json`, {
    method: "POST",
    headers: { "X-Shopify-Access-Token": token, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { ok: res.ok, status: res.status, body };
}

// Try a query, refresh token on 401, retry once
async function gqlAdminSafe(env, token, query, variables) {
  let r = await gqlAdmin(env, token, query, variables);
  if (r.ok && r.body?.errors?.[0]?.extensions?.code === "ACCESS_DENIED") {
    // Pre-emptive refresh on auth errors
    token = await refreshAdminToken(env);
    r = await gqlAdmin(env, token, query, variables);
  }
  if (r.status === 401 || r.status === 403) {
    token = await refreshAdminToken(env);
    r = await gqlAdmin(env, token, query, variables);
  }
  return { ...r, token };
}

const PRODUCT_BY_HANDLE = `
  query ProductByHandle($handle: String!) {
    productByHandle(handle: $handle) { id title }
  }
`;

const PRODUCT_SET = `
  mutation ProductSet($input: ProductSetInput!) {
    productSet(input: $input, synchronous: true) {
      product { id handle title status }
      userErrors { field message code }
    }
  }
`;

const PUBLICATIONS = `
  { publications(first: 20) { nodes { id name } } }
`;

const PUBLISH = `
  mutation Publish($id: ID!, $input: [PublicationInput!]!) {
    publishablePublish(id: $id, input: $input) {
      publishable {
        resourcePublications(first: 5) { nodes { publication { name } isPublished } }
      }
      userErrors { field message }
    }
  }
`;

// --- Catalog ---------------------------------------------------------------

const CATALOG = [
  // Cat side hero (5)
  { handle: "cat-pebble-fountain", title: "Ceramic Pebble Cat Fountain", category: "cat", price: "44.99", featured: true, onSale: false,
    description: "Filtered drinking fountain in glazed ceramic. 70oz capacity, runs quiet, dishwasher safe.",
    details: ["Cats drink more when the water moves. This fountain pumps 70oz through a triple-stage filter (carbon + foam + mesh), runs at 25dB which is quieter than your fridge, and the bowl pops off for the dishwasher.","Ceramic outer, BPA-free silicone fittings, USB-C powered. Replacement filters are $6 for a 3-pack, lasts about a month each."],
    tags: ["side:cat", "fountain", "hero"], category2: "fountain", supplier: "cj-15", supplierCost: "16" },
  { handle: "cat-donut-calming-bed", title: "Donut Calming Bed (Cream)", category: "cat", price: "34.99", featured: true, onSale: false,
    description: "Raised bolstered rim, vegan fur exterior, removable washable cover. The bed your cat will actually sleep in.",
    details: ["The bolstered rim gives cats something to rest their head against, which is the entire reason they ignore flat beds. Vegan fur exterior, polyester fill, memory foam base.","Cover unzips, machine wash cold. Comes flat-packed, expands fully in 24 hours. 20-inch diameter fits cats up to 18 lbs."],
    tags: ["side:cat", "bed", "hero"], category2: "bed", supplier: "cj-10", supplierCost: "10" },
  { handle: "cat-motion-orb", title: "Motion-Activated Cat Orb", category: "cat", price: "19.99", featured: true, onSale: false,
    description: "Self-rolling toy that wakes on motion, runs in 12-minute play sessions, sleeps the rest of the day. USB-C rechargeable.",
    details: ["The orb sits idle until your cat walks past it, then runs for 12 minutes in a random-pattern roll. After the session it sleeps until the next motion trigger. Means it actually lasts an afternoon instead of being dead by lunch.","Three textured panels (smooth, ribbed, soft), built-in LED for low-light play, 6-hour battery, USB-C. Auto-pause when stuck against a wall for more than 3 seconds."],
    tags: ["side:cat", "toy", "hero"], category2: "toy", supplier: "cj-6", supplierCost: "7" },
  { handle: "cat-window-perch", title: "Window Perch with Suction Cups", category: "cat", price: "29.99", featured: false, onSale: false,
    description: "Suction-cup window seat. Holds 40 lbs. Cats watch the world go by from chest height instead of your laptop.",
    details: ["Four industrial-grade suction cups (the same kind used to hold safety glass on construction sites) lock to any clean window. Frame is anodized aluminum, hammock is a soft microfiber that's machine washable.","Holds 40 lbs static load. The reason cats park on your keyboard is they want a high vantage point with sun. This gives them that without the keyboard."],
    tags: ["side:cat", "perch"], category2: "perch", supplier: "cj-11", supplierCost: "11" },
  { handle: "cat-custom-name-bandana", title: "Custom Name Cat Bandana", category: "cat", price: "22.99", featured: true, onSale: false,
    description: "Embroidered name bandana, your cat's name + small icon. Snap closure, breakaway-safe.",
    details: ["Embroidered (not printed) name and a small icon (paw, star, crown, fish) on a cotton-poly bandana with snap closure. Breakaway-safe so it pops off if it catches.","Ships in 5-7 business days from a print partner in Ohio. Three sizes (S, M, L) to fit collar sizes 8-16 inches. Comes flat in a paper sleeve, no plastic."],
    tags: ["side:cat", "apparel", "pod", "hero"], category2: "apparel", supplier: "printify", supplierCost: "10" },

  // Cat side secondary (10)
  { handle: "cat-feather-wand-3pack", title: "Feather Wand 3-Pack", category: "cat", price: "14.99", featured: false, onSale: false,
    description: "Three teaser wands: feather, ribbon, mouse. Replacement heads attach with a clip.",
    details: ["The cardinal sin of cat toys is the head falling off the wand. These use a metal clip instead of glue. Replacement heads are $4 for a 6-pack.","Wood handles, 24 inches long, three head styles in the box. Rotate them so your cat doesn't get bored of the same toy."],
    tags: ["side:cat", "toy"], category2: "toy", supplier: "cj-5", supplierCost: "5" },
  { handle: "cat-slow-feeder-puzzle", title: "Slow Feeder Puzzle Bowl", category: "cat", price: "17.99", featured: false, onSale: false,
    description: "Maze-bottom bowl that slows down fast eaters by 4x. Non-slip silicone base, dishwasher safe.",
    details: ["Fast eaters throw up. The maze pattern in the base of this bowl forces them to slow down by 4x, which gives the stomach time to register fullness.","Food-grade silicone, non-slip base, dishwasher safe. The maze is shallow enough that even cats with smushed faces (Persians, Himmies) can reach the kibble."],
    tags: ["side:cat", "feeder"], category2: "feeder", supplier: "cj-5", supplierCost: "5" },
  { handle: "cat-scratching-post-tall", title: "32\" Sisal Scratching Post", category: "cat", price: "39.99", featured: false, onSale: false,
    description: "32 inches tall so cats can stretch fully. Sisal rope wrap, weighted base, won't tip on a 15-lb cat.",
    details: ["Cats need a post tall enough to stretch their full body length. Most posts are 20 inches, which is why your cat goes for the couch instead.","Sisal rope, 7-inch weighted base. Tested with a 17-lb cat doing full-body claw drags, didn't tip. Replacement sisal sleeves available."],
    tags: ["side:cat", "furniture"], category2: "furniture", supplier: "cj-16", supplierCost: "16" },
  { handle: "cat-deshedding-brush", title: "Self-Cleaning Deshedding Brush", category: "cat", price: "18.99", featured: false, onSale: false,
    description: "Press the button to retract the bristles, the hair falls off in a clump. Removes ~95% of loose undercoat.",
    details: ["The shed undercoat causes hairballs. This brush has a button-retract mechanism: pull through the coat, press the button, the bristles retract and the hair falls off in one clump.","Removes about 95% of loose undercoat per session. Works on short and medium coats. Long-haired cats (Maine Coon, Persian) need a wider-tooth comb in addition."],
    tags: ["side:cat", "grooming"], category2: "grooming", supplier: "cj-6", supplierCost: "6" },
  { handle: "cat-cave-bed", title: "Felt Cave Bed (Charcoal)", category: "cat", price: "32.99", featured: false, onSale: false,
    description: "Wool felt cave for cats that want to hide. Holds shape, machine washable, 100% wool.",
    details: ["Cats are ambush predators. A cave bed gives them somewhere to retreat where they can see out but not be seen. The 100% wool felt is dense enough that the cave holds its shape under a 15-lb cat.","Machine wash cold, lay flat to dry. The wool naturally repels stains and is hypoallergenic. Charcoal grey, 17 inches across."],
    tags: ["side:cat", "bed"], category2: "bed", supplier: "cj-12", supplierCost: "12" },
  { handle: "cat-catnip-mat", title: "Organic Catnip Activity Mat", category: "cat", price: "15.99", featured: false, onSale: false,
    description: "Sisal mat woven with organic catnip leaves. Scratch, rub, lounge. Catnip refresh pouch refills the scent.",
    details: ["The catnip is woven INTO the sisal, not just sprinkled on top. Means it lasts months instead of one afternoon. Comes with a small refresh pouch that brings the scent back when it fades.","Organic catnip (Schizonepeta tenuifolia). Works on about 70% of cats — the trait is genetic. 18 x 12 inches, lays flat on the floor."],
    tags: ["side:cat", "toy"], category2: "toy", supplier: "cj-4", supplierCost: "4" },
  { handle: "cat-laser-tower", title: "Auto-Pattern Laser Tower", category: "cat", price: "26.99", featured: false, onSale: false,
    description: "Battery-powered laser tower that runs random patterns for 15 minutes then sleeps. Set it down, walk away.",
    details: ["Auto-runs for 15 minutes in random sweep patterns then sleeps for an hour. Means you can leave it running while you work and your cat exercises without you holding a pointer.","Class 3R safe laser (under 5mW). Three speed modes, USB-C charging, 8-hour active runtime per charge. Auto-pause when knocked over."],
    tags: ["side:cat", "toy"], category2: "toy", supplier: "cj-11", supplierCost: "11" },
  { handle: "cat-mesh-backpack", title: "Mesh Window Backpack Carrier", category: "cat", price: "48.99", featured: false, onSale: false,
    description: "Hard-sided cat backpack with a clear bubble window. Ventilated mesh sides, padded straps, top + side entry.",
    details: ["The clear bubble window is the version cats actually tolerate (more visual stimulation than a closed pod). Hard sides keep their shape, ventilated mesh on three sides keeps them cool.","Padded shoulder straps, sternum strap, two entry zippers (top + side). Fits cats up to 18 lbs. Airline-friendly carry-on dimensions."],
    tags: ["side:cat", "travel"], category2: "travel", supplier: "cj-21", supplierCost: "21" },
  { handle: "cat-litter-mat-honeycomb", title: "Honeycomb Litter Mat", category: "cat", price: "19.99", featured: false, onSale: true, compareAt: "26.99",
    description: "Honeycomb-pattern mat that traps litter in the cells, doesn't fling it onto the floor. Wipe clean or hose off.",
    details: ["The honeycomb cells catch the litter as the cat steps out of the box. The litter falls into the cells rather than scattering across the floor. Pick the mat up, dump it in the trash, done.","Food-grade TPE (not PVC), waterproof, non-slip backing. Wipe clean with a damp cloth or hose off outside. 24 x 16 inches."],
    tags: ["side:cat", "litter"], category2: "litter", supplier: "cj-8", supplierCost: "8" },
  { handle: "cat-side-tee-team-cat", title: "\"Team Cat\" Tee", category: "cat", price: "24.99", featured: false, onSale: false,
    description: "TallyTails-branded \"Team Cat\" t-shirt for the human. 100% cotton, soft-print, unisex sizing.",
    details: ["For wearing while the cat side is winning. Soft-print (not screen-print) on 100% combed cotton. Unisex sizing, fits true to the size chart on the photos.","Printed on demand by a US print partner. Five colors, sizes XS through 3XL. Ships in 5-7 business days."],
    tags: ["side:cat", "apparel", "pod"], category2: "apparel", supplier: "printify", supplierCost: "12" },

  // Dog side hero (5)
  { handle: "dog-ortho-memory-bed-m", title: "Orthopedic Memory Foam Bed (Medium)", category: "dog", price: "59.99", featured: true, onSale: false,
    description: "Solid memory foam core, bolstered headrest, non-slip base, removable washable cover. Sized for dogs 25-55 lbs.",
    details: ["A 3-inch solid memory foam slab (not chopped foam stuffed in a sleeve) under a bolstered headrest. The foam recovers to flat between uses, no permanent dent.","Cover unzips, machine wash cold. Non-slip rubber base. Sized for medium breeds 25-55 lbs (lab, retriever, husky build). Large and XL coming."],
    tags: ["side:dog", "bed", "hero"], category2: "bed", supplier: "cj-22", supplierCost: "22" },
  { handle: "dog-led-rechargeable-collar", title: "LED Rechargeable Collar", category: "dog", price: "19.99", featured: true, onSale: false,
    description: "USB-C rechargeable LED collar. Three brightness modes, visible at 500m, 8-hour runtime, waterproof.",
    details: ["Three modes: steady, fast flash, slow flash. Visible from 500 meters in pitch dark, which is more than you'd think you need until you're walking on an unlit road.","8-hour runtime on full brightness, USB-C, fully waterproof (swim-proof, not just rain-proof). Four sizes, fits collar circumferences 12-28 inches."],
    tags: ["side:dog", "collar", "hero"], category2: "collar", supplier: "cj-7", supplierCost: "7" },
  { handle: "dog-nopull-padded-harness", title: "No-Pull Padded Harness", category: "dog", price: "29.99", featured: true, onSale: false,
    description: "Front-clip no-pull harness with padded chest plate. Reflective stitching, four adjustment points, sizes XS through XL.",
    details: ["The front clip pulls the dog sideways when they lunge, which interrupts the pull pattern. Padded chest plate spreads the load instead of cutting into the armpits.","Four adjustment points (two on the chest, two on the belly). Reflective stitching on all straps. Top handle for crowd control or assisting older dogs into the car."],
    tags: ["side:dog", "harness", "hero"], category2: "harness", supplier: "cj-9", supplierCost: "9" },
  { handle: "dog-slow-maze-bowl", title: "Slow-Feeder Maze Bowl", category: "dog", price: "17.99", featured: false, onSale: false,
    description: "Maze-bottom bowl that slows down fast eaters by 5x. Non-slip silicone base, dishwasher safe.",
    details: ["Fast eaters swallow air, which causes bloat. The maze forces them to slow down by about 5x, which gives the stomach time to register fullness and reduces the swallowed air.","Food-grade silicone, non-slip base. Three sizes (S/M/L) calibrated to dog snout length. Dishwasher safe."],
    tags: ["side:dog", "feeder"], category2: "feeder", supplier: "cj-5", supplierCost: "5" },
  { handle: "dog-custom-portrait-mat", title: "Custom Pet Portrait Feeding Mat", category: "dog", price: "36.99", featured: true, onSale: false,
    description: "Upload a photo, we'll print a portrait mat under their food bowls. Waterproof, non-slip, 24 x 16 inches.",
    details: ["Send us a photo of your dog. We pass it through a cartoon-style portrait filter and print it onto a waterproof, non-slip feeding mat. The dog's name prints below the portrait.","Standard size 24 x 16 inches, fits two bowls. Wipe clean or hose off. Print partner in Texas, ships in 7-10 business days."],
    tags: ["side:dog", "feeder", "pod", "hero"], category2: "feeder", supplier: "printify", supplierCost: "16" },

  // Dog side secondary (10)
  { handle: "dog-tug-rope-3pack", title: "Heavy-Duty Tug Rope 3-Pack", category: "dog", price: "22.99", featured: false, onSale: false,
    description: "Three tug ropes: cotton, jute, ball-end. Reinforced knots that don't fray apart in a week.",
    details: ["The knot is the failure point on tug ropes. These use double-stitched binding under the knot so the fibers can't unravel. Reinforced for medium-to-large dogs.","Three rope types in the pack (cotton, jute, ball-end). Rotate so the dog doesn't get bored. 14-18 inches long."],
    tags: ["side:dog", "toy"], category2: "toy", supplier: "cj-7", supplierCost: "7" },
  { handle: "dog-puzzle-feeder-treat", title: "Puzzle Feeder Treat Toy", category: "dog", price: "24.99", featured: false, onSale: false,
    description: "Sliding-puzzle treat dispenser. Dogs slide tiles to release treats. Three difficulty levels.",
    details: ["Three difficulty levels (rookie, intermediate, advanced) so you can crank up the challenge as the dog figures it out. Mental stimulation = tired dog = no chewed furniture.","Dishwasher safe (top rack), BPA-free plastic. Most dogs solve level 1 in under 10 minutes, level 3 takes a week of repetition."],
    tags: ["side:dog", "toy"], category2: "toy", supplier: "cj-8", supplierCost: "8" },
  { handle: "dog-paw-cleaner-cup", title: "Silicone Paw Cleaner Cup", category: "dog", price: "19.99", featured: false, onSale: false,
    description: "Fill with water, dunk one paw at a time. Silicone bristles scrub mud out of paw pads. Quick post-walk cleanup.",
    details: ["Fill the cup with water (about 2 inches), dunk one paw at a time, twist gently. The silicone bristles agitate the water around the paw pads and lift mud out.","Three sizes (S, M, L) calibrated to paw width. Twist cap seals it for travel. Top-rack dishwasher safe."],
    tags: ["side:dog", "grooming"], category2: "grooming", supplier: "cj-6", supplierCost: "6" },
  { handle: "dog-deshedding-glove", title: "Deshedding Grooming Glove", category: "dog", price: "14.99", featured: false, onSale: false,
    description: "Silicone-bristle glove. Pet your dog, collect a glove full of loose hair. Most dogs love it because it feels like petting.",
    details: ["Most dogs flinch from grooming tools. The glove form lets you brush them while it feels like petting, which they don't object to. Silicone bristles are softer than wire brush.","Adjustable Velcro wrist strap, ambidextrous. Rinse the collected hair off under the sink. Works on short and medium coats."],
    tags: ["side:dog", "grooming"], category2: "grooming", supplier: "cj-4", supplierCost: "4" },
  { handle: "dog-cooling-mat", title: "Self-Cooling Gel Mat (Medium)", category: "dog", price: "39.99", featured: false, onSale: true, compareAt: "49.99",
    description: "Pressure-activated cooling gel mat. Stays 5-15°F cooler than ambient. No fridge, no electricity, no soaking.",
    details: ["Pressure-activated cooling gel. When the dog lies on it, the gel absorbs body heat and stays 5-15°F cooler than the ambient air. No refrigeration, no electricity, no pre-soaking.","Medium size (24 x 20 inches) fits dogs 30-65 lbs. Wipe clean. Gel recharges automatically when the dog gets off — about 15 minutes to reset to ambient."],
    tags: ["side:dog", "bed"], category2: "bed", supplier: "cj-14", supplierCost: "14" },
  { handle: "dog-snuffle-mat", title: "Snuffle Mat for Slow Eating", category: "dog", price: "24.99", featured: false, onSale: false,
    description: "Fleece snuffle mat. Hide kibble in the strips, dog uses their nose to find it. 5-10x meal duration.",
    details: ["Hide the kibble in the fleece strips. The dog uses their nose to dig it out, which is the natural foraging behavior they evolved for. 5-10x longer meals = more mental stimulation, less anxiety.","18 inches square, non-slip backing. Hand wash (the fleece strips don't survive a washing machine). Replaces the bowl entirely if you want."],
    tags: ["side:dog", "feeder"], category2: "feeder", supplier: "cj-8", supplierCost: "8" },
  { handle: "dog-collapsible-water-bowl", title: "Collapsible Travel Water Bowl", category: "dog", price: "12.99", featured: false, onSale: false,
    description: "Silicone bowl that folds flat for the leash. Carabiner clip, 16oz capacity, dishwasher safe.",
    details: ["Folds to half an inch flat, clips to a leash or belt loop with the included carabiner. Pops back to 16oz on demand for water breaks on hikes.","Food-grade silicone, dishwasher safe. Five colors. The carabiner is metal, not plastic, so it actually holds."],
    tags: ["side:dog", "travel"], category2: "travel", supplier: "cj-4", supplierCost: "4" },
  { handle: "dog-elevated-feeder", title: "Elevated Bamboo Feeder Stand", category: "dog", price: "34.99", featured: false, onSale: false,
    description: "Bamboo stand with two stainless steel bowls. Three height settings for growing dogs. Removable bowls.",
    details: ["Elevated feeding reduces neck strain on large breeds and slows the eating pace slightly. Three height settings (6\", 8\", 10\") accommodate puppies through fully grown.","Bamboo frame (not plastic), stainless steel bowls (not painted enamel that chips). Bowls remove for the dishwasher. Holds about 3 cups of kibble each."],
    tags: ["side:dog", "feeder"], category2: "feeder", supplier: "cj-14", supplierCost: "14" },
  { handle: "dog-treat-pouch-clip", title: "Training Treat Pouch", category: "dog", price: "16.99", featured: false, onSale: false,
    description: "Belt-clip treat pouch with a magnetic close. Holds 1 cup of treats, plus a poop bag dispenser on the side.",
    details: ["Magnetic close instead of zipper — flips open one-handed during training. Holds about a cup of treats. The side pocket dispenses standard poop bag rolls.","Wipe clean nylon interior. Belt clip + waistband loop, fits up to a 2-inch belt. Reflective accent on the front panel."],
    tags: ["side:dog", "training"], category2: "training", supplier: "cj-6", supplierCost: "6" },
  { handle: "dog-side-tee-team-dog", title: "\"Team Dog\" Tee", category: "dog", price: "24.99", featured: false, onSale: false,
    description: "TallyTails-branded \"Team Dog\" t-shirt for the human. 100% cotton, soft-print, unisex sizing.",
    details: ["For wearing while the dog side is winning. Soft-print on 100% combed cotton. Unisex sizing, fits true to the size chart on the photos.","Printed on demand by a US print partner. Five colors, sizes XS through 3XL. Ships in 5-7 business days."],
    tags: ["side:dog", "apparel", "pod"], category2: "apparel", supplier: "printify", supplierCost: "12" },
];

function toProductSetInput(p) {
  const descriptionHtml = `<p>${p.description}</p>` +
    (p.details?.map(para => `<p>${para}</p>`).join("") ?? "");
  const tags = [...new Set(p.tags)];
  const productOptions = [
    { name: "Title", values: [{ name: "Default Title" }] },
  ];
  const variants = [
    {
      price: p.price,
      ...(p.onSale && p.compareAt ? { compareAtPrice: p.compareAt } : {}),
      optionValues: [{ optionName: "Title", name: "Default Title" }],
      inventoryPolicy: "CONTINUE",
    },
  ];
  return {
    handle: p.handle,
    title: p.title,
    descriptionHtml,
    vendor: "TallyTails",
    productType: p.category2 ?? "",
    tags,
    status: "ACTIVE",
    productOptions,
    variants,
  };
}

async function main() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const onlyArg = args.find(a => a.startsWith("--only="));
  const only = onlyArg ? onlyArg.slice(7) : null;

  const targets = only ? CATALOG.filter(p => p.handle === only) : CATALOG;
  if (!targets.length) { console.error(`No matching handle: ${only}`); process.exit(1); }

  if (dry) {
    for (const p of targets) {
      console.log(`[dry] ${p.handle.padEnd(34)} ${p.title}  $${p.price}${p.onSale ? ` (was $${p.compareAt})` : ""}`);
    }
    return;
  }

  const env = await loadEnv();
  if (!env.SHOPIFY_ADMIN_TOKEN) throw new Error("SHOPIFY_ADMIN_TOKEN missing from .env");
  let token = env.SHOPIFY_ADMIN_TOKEN;

  // Resolve the Online Store publication id once
  const pubR = await gqlAdminSafe(env, token, PUBLICATIONS, {});
  token = pubR.token;
  const onlineStore = pubR.body?.data?.publications?.nodes?.find(n => n.name === "Online Store");
  if (!onlineStore) throw new Error("Online Store publication not found");
  console.log(`Online Store publication: ${onlineStore.id}`);

  console.log(`Seeding ${targets.length} products into ${env.PUBLIC_STORE_DOMAIN}...`);
  const created = [];
  const skipped = [];
  const failed = [];

  for (const p of targets) {
    // Check existence
    const check = await gqlAdminSafe(env, token, PRODUCT_BY_HANDLE, { handle: p.handle });
    token = check.token;
    if (!check.ok || check.body.errors) {
      console.error(`  ! lookup ${p.handle}:`, JSON.stringify(check.body).slice(0, 200));
      failed.push({ handle: p.handle, error: "lookup failed" });
      continue;
    }
    let productId = check.body.data?.productByHandle?.id;
    let wasCreated = false;
    if (productId) {
      // Already exists. Still ensure it's published.
      skipped.push(p.handle);
    } else {
      const create = await gqlAdminSafe(env, token, PRODUCT_SET, { input: toProductSetInput(p) });
      token = create.token;
      if (!create.ok || create.body.errors) {
        console.error(`  X ${p.handle}:`, JSON.stringify(create.body).slice(0, 300));
        failed.push({ handle: p.handle, error: JSON.stringify(create.body.errors ?? create.body).slice(0, 200) });
        continue;
      }
      const userErrors = create.body.data?.productSet?.userErrors ?? [];
      if (userErrors.length) {
        console.error(`  X ${p.handle}:`, JSON.stringify(userErrors).slice(0, 300));
        failed.push({ handle: p.handle, error: JSON.stringify(userErrors).slice(0, 200) });
        continue;
      }
      productId = create.body.data?.productSet?.product?.id;
      wasCreated = true;
      created.push({ handle: p.handle, id: productId });
    }

    // Publish to Online Store. The mutation returns userErrors:[] even when
    // the publish silently no-ops, so we verify via resourcePublications.
    const pub = await gqlAdminSafe(env, token, PUBLISH, {
      id: productId, input: [{ publicationId: onlineStore.id }],
    });
    token = pub.token;
    const pubErrs = pub.body?.data?.publishablePublish?.userErrors ?? [];
    const isPublished = pub.body?.data?.publishablePublish?.publishable?.resourcePublications?.nodes?.some(n => n.isPublished);
    if (pubErrs.length || !isPublished) {
      console.error(`  ! ${p.handle} created but publish failed:`, JSON.stringify(pubErrs).slice(0, 200));
    } else {
      console.log(`  ${wasCreated ? "+" : "~"} ${p.handle.padEnd(34)} ${productId}${wasCreated ? "" : " (already existed, re-published)"}`);
    }
  }

  console.log(`\nDone. ${created.length} created, ${skipped.length} skipped, ${failed.length} failed.`);
  if (failed.length) {
    console.log("Failures:");
    for (const f of failed) console.log(`  - ${f.handle}: ${f.error}`);
    process.exit(1);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
