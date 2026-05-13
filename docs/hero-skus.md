# Hero SKU shortlist — what to actually inventory

The current 30-SKU catalog is all dropship. That's wrong for the 5-10 SKUs
customers see first because the leaderboard mechanic depends on a fast
feedback loop (buy → score ticks → product lands → reorder). With 7-21 day
CJ shipping, half the dopamine is gone before the package arrives.

Inventory these 5 hero SKUs in real US warehouses (or a 3PL) so first-time
buyers experience the brand at full velocity. Everything else stays
dropship as long-tail backstop.

## The 5

| Handle | Price | COGS @ MOQ | Margin | Why inventory |
|---|---|---|---|---|
| `cat-pebble-fountain` | $44.99 | $12-14 | 70% | The single most-recommended cat hardware in 2024-2026. High AOV. The brand-defining cat-side SKU. |
| `cat-donut-calming-bed` | $34.99 | $7-9 | 75% | Cheap to produce, ships small, near-zero return rate. Easy hero. |
| `dog-ortho-memory-bed-m` | $59.99 | $18-22 | 65% | Highest single-item AOV on the dog side. The dog-side flagship. |
| `dog-nopull-padded-harness` | $29.99 | $6-8 | 75% | Practical "I need this" purchase. Repeat purchases when dogs grow or wear out. |
| `dog-led-rechargeable-collar` | $19.99 | $5-7 | 70% | High-margin add-on. Often bought with the harness or bed. Bundles well. |

Cat side: 2 SKUs (fountain + bed). Dog side: 3 SKUs (bed + harness + collar).
Slightly dog-heavy on intentional purchase mechanics because dog gear has
higher cross-sell potential (harness + collar + bed go together).

## Capital outlay

To stock 100 units of each at the MOQ COGS:

| SKU | Units | Unit cost | Total |
|---|---|---|---|
| Cat pebble fountain | 100 | $13 | $1,300 |
| Cat donut calming bed | 100 | $8 | $800 |
| Dog ortho memory bed | 100 | $20 | $2,000 |
| Dog no-pull harness | 100 | $7 | $700 |
| Dog LED collar | 100 | $6 | $600 |
| | | **Total** | **$5,400** |

Sells through in ~3 months at 100 orders/mo with normal SKU mix.
Capital recovery at $44.99 × 100 (just one SKU) = $4,499 by month one.

If $5k upfront is too steep: half-stock at 50 units each = $2,700. Less
cushion against stockouts but same payback timeline.

## Sourcing options for the hero SKUs

Two paths to get inventory:

**Option A: Alibaba direct + customs.** Search "pet fountain manufacturer"
on Alibaba, find a factory with the right product (ceramic, 70oz, USB-C),
request samples ($30-100 each), pick the winner, place a 100-unit order
with custom TallyTails packaging. Lead time 30-45 days. Custom packaging
costs ~$0.50-2/unit extra. Best margin, slowest start.

**Option B: US-domestic wholesale.** Faire (faire.com) and Inventory Source
both have pet-product wholesalers with US warehouses. Higher COGS (~30%
more than Alibaba) but no customs hassle, no 45-day lead time, no MOQs
above 10 units. Faster start, lower margin.

**Recommendation:** start with Faire/Inventory Source for the first 50
units of each SKU to validate they sell at $44.99 / $34.99 / etc. Once
sell-through proves, switch to Alibaba direct for the next 200-unit
restock at better margin.

## US 3PL options

Three to evaluate:

| 3PL | Setup | Per-order | Best for |
|---|---|---|---|
| **ShipBob** | $0 | $3-5 fulfillment + storage | Best Shopify integration, subscription-friendly |
| **ShipStation Fulfillment** | $0 | $3.50-5 + storage | Cheapest at low volume |
| **Easyship** | $0 | Marketplace model | Multi-warehouse for fast nationwide shipping |

For 100-500 orders/mo, ShipBob is the safe call. Their API hooks straight
into Shopify so orders auto-route. Storage is ~$40/pallet/mo (one pallet
holds all 5 hero SKUs at 100 units each).

Roughly $200-400/mo for storage + ~$4/order for fulfillment. Bakes a flat
$5-6/order into the catalog cost which is fine on $30+ SKUs but tight on
$14.99 long-tail items. Hence: 3PL only for the heroes, keep CJ for the
long tail.

## What to NOT inventory (yet)

- Apparel / Printify items — Printify handles fulfillment, no point taking inventory risk
- Custom portrait mats — Printify already does these well
- Long-tail under $25 — margin gets eaten by fulfillment overhead
- Anything seasonal — too easy to be left with dead stock

## Action sequence

1. Pick supplier path for each of the 5 SKUs (Alibaba sample request vs Faire order). 1 week.
2. Order 50 units of each via Faire while Alibaba samples are in transit. 5-7 day delivery to 3PL.
3. Open ShipBob account, ship the 50-unit boxes there. ~2 days.
4. Wire ShipBob's Shopify integration so new orders auto-route. ~1 hour of config.
5. Switch the 5 hero SKUs in Shopify from CJ-fulfillment to ShipBob-fulfillment. ~30 min.
6. Run a 10-order smoke test (place real orders on each hero, watch fulfillment fire). Catch routing bugs.
7. After 2 weeks of clean fulfillment, place the bigger Alibaba order for restock.
