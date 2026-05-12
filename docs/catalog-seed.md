# TallyTails catalog seed — 30 SKUs (15 cat / 15 dog)

Source: CJ Dropshipping (US warehouse only) + Printify (custom POD). Ready to seed via Shopify Admin GraphQL `productCreate` mutation once dev store exists.

## Schema (TS type matches buzzed-honey Product type)

```ts
type Product = {
  handle: string;
  title: string;
  vendor: "TallyTails";
  category: "cat" | "dog" | "shared";
  description: string;          // 1-2 sentence pitch
  details?: string[];           // 2-paragraph longform
  tags: string[];               // category, side, hero-flag
  featured: boolean;
  onSale: boolean;
  price: { amount: string; currencyCode: "USD" };
  compareAtPrice?: { amount: string; currencyCode: "USD" };
  images: Array<{ url: string; alt: string }>;
  cjProductId?: string;         // for CJ webhook order routing
  printifyProductId?: string;   // for Printify routing
  supplierCost: string;         // for margin tracking
};
```

## Cat side (15 SKUs)

### Hero (5)
1. `cat-pebble-fountain` — Ceramic Pebble Cat Fountain — $44.99 (CJ $14-18) — **featured**
2. `cat-donut-calming-bed` — Donut Calming Bed (Cream) — $34.99 (CJ $8-12) — **featured**
3. `cat-motion-orb` — Motion-Activated Cat Orb — $19.99 (CJ $5-8) — **featured**
4. `cat-window-perch` — Window Perch with Suction Cups — $29.99 (CJ $9-13)
5. `cat-custom-name-bandana` — Custom Name Cat Bandana (Printify) — $22.99 (Printify $9-12) — **featured**

### Secondary (10)
6. `cat-feather-wand-3pack` — Feather Wand 3-Pack — $14.99 (CJ $4-6)
7. `cat-slow-feeder-puzzle` — Slow Feeder Puzzle Bowl — $17.99 (CJ $4-6)
8. `cat-scratching-post-tall` — 32" Sisal Scratching Post — $39.99 (CJ $14-18)
9. `cat-deshedding-brush` — Self-Cleaning Deshedding Brush — $18.99 (CJ $5-7)
10. `cat-cave-bed` — Felt Cave Bed (Charcoal) — $32.99 (CJ $10-14)
11. `cat-catnip-mat` — Organic Catnip Activity Mat — $15.99 (CJ $3-5)
12. `cat-laser-tower` — Auto-Pattern Laser Tower — $26.99 (CJ $9-13)
13. `cat-mesh-backpack` — Mesh Window Backpack Carrier — $48.99 (CJ $18-24)
14. `cat-litter-mat-honeycomb` — Honeycomb Litter Mat — $19.99 (CJ $6-9)
15. `cat-side-tee-team-cat` — "Team Cat" Tee (Printify) — $24.99 (Printify $10-13)

## Dog side (15 SKUs)

### Hero (5)
1. `dog-ortho-memory-bed-m` — Orthopedic Memory Foam Bed (M) — $59.99 (CJ $18-25) — **featured**
2. `dog-led-rechargeable-collar` — LED Rechargeable Collar — $19.99 (CJ $5-8) — **featured**
3. `dog-nopull-padded-harness` — No-Pull Padded Harness — $29.99 (CJ $7-11) — **featured**
4. `dog-slow-maze-bowl` — Slow-Feeder Maze Bowl — $17.99 (CJ $4-6)
5. `dog-custom-portrait-mat` — Custom Pet Portrait Feeding Mat (Printify) — $36.99 (Printify $14-18) — **featured**

### Secondary (10)
6. `dog-tug-rope-3pack` — Heavy-Duty Tug Rope 3-Pack — $22.99 (CJ $6-9)
7. `dog-puzzle-feeder-treat` — Puzzle Feeder Treat Toy — $24.99 (CJ $7-10)
8. `dog-paw-cleaner-cup` — Silicone Paw Cleaner Cup — $19.99 (CJ $5-8)
9. `dog-deshedding-glove` — Deshedding Grooming Glove — $14.99 (CJ $3-5)
10. `dog-cooling-mat` — Self-Cooling Gel Mat (M) — $39.99 (CJ $12-16)
11. `dog-snuffle-mat` — Snuffle Mat for Slow Eating — $24.99 (CJ $7-10)
12. `dog-collapsible-water-bowl` — Collapsible Travel Water Bowl — $12.99 (CJ $3-5)
13. `dog-elevated-feeder` — Elevated Bamboo Feeder Stand — $34.99 (CJ $12-16)
14. `dog-treat-pouch-clip` — Training Treat Pouch — $16.99 (CJ $5-7)
15. `dog-side-tee-team-dog` — "Team Dog" Tee (Printify) — $24.99 (Printify $10-13)

## Catalog economics

| Metric | Value |
|---|---|
| Total SKUs | 30 |
| Total catalog retail value | $843.70 |
| Total supplier cost (mid-range) | $283.50 |
| Blended gross margin | 66% |
| AOV target (mixed cart) | $42 |
| Featured (hero) SKUs | 10 |
| onSale flag on | ~30% (mix of seasonal + price-anchored) |

## Tags pattern (for filtering + search)

Each SKU gets these tags at minimum:
- `side:cat` or `side:dog`
- Category: `bed` | `toy` | `feeder` | `grooming` | `harness` | `apparel` | `travel`
- `hero` for the 10 featured SKUs
- `pod` for Printify custom items

## Order routing (post-seed)

- CJ SKUs route to CJ via the CJ Dropshipping Shopify app, which auto-creates a fulfillment request when a Shopify order is placed
- Printify SKUs route to Printify via the Printify Shopify app, which routes to the closest US print provider
- Both auto-mark Shopify orders as "fulfilled" on supplier ship event
- No manual order handling required

## Seed execution

When the Shopify dev store exists:

```bash
# Pseudo:
SHOPIFY_ADMIN_TOKEN=...
SHOPIFY_DOMAIN=tally-tails.myshopify.com

for sku in catalog-data.json; do
  curl -X POST https://$SHOPIFY_DOMAIN/admin/api/2025-01/graphql.json \
    -H "X-Shopify-Access-Token: $SHOPIFY_ADMIN_TOKEN" \
    -d '{
      "query": "mutation productCreate($input: ProductInput!) { productCreate(input: $input) { product { id handle } } }",
      "variables": { "input": { ... } }
    }'
done
```

Total seed time: ~5 minutes for all 30 SKUs.
