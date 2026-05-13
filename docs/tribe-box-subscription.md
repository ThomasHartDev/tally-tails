# Tribe Box subscription — concept

The leaderboard is a great first-visit hook but a bad retention engine.
Pet beds, fountains, harnesses get bought once every 1-3 years; cat people
aren't coming back to TallyTails monthly to buy hardware. The Tribe Box is
the recurring-revenue layer that makes the community-and-revenue math
actually work, plus it gives the rivalry a fresh tally injection every
month.

## The product

**Cat Tribe Box** or **Dog Tribe Box**, $19.99/mo, ships once a month.

Every shipment contains:

- One consumable item (catnip refill / treat sampler / dental chews — rotates monthly so customers don't get bored)
- One small toy or accessory (~$3-5 wholesale cost — rotates seasonally)
- One side-themed sticker drop (low cost, high collectibility)
- A printed "Standings Card" showing the current cat-vs-dog tally and the subscriber's contribution rank within their side
- A 10% discount code on any catalog SKU, single-use, expires in 14 days (drives a second purchase before the next box ships)

Total per-box COGS target: **$7-9**. Shipping target: **$3-4** via USPS
Ground Advantage. Net margin per box: **$8-10**. At 500 subscribers that's
**$4-5k/mo of recurring contribution** with predictable monthly cash flow.

## Why this works mechanically

- **Monthly tally injection.** Each Tribe Box ship counts as a +1 for that side, so the rivalry stays live between hardware purchases. A subscriber on the dog side is contributing every 30 days even without buying hardware.
- **Tribal identity reinforced physically.** A cat person opens a cat-side box. The packaging, the sticker, the standings card all reinforce which tribe they're in. This is what the cat-vs-dog narrative needs to be more than a leaderboard counter on a webpage.
- **UGC engine.** Sticker drops + standings cards are inherently shareable on TikTok and Instagram. "October Cat Side member" is a flex. The boxes become their own content.
- **Loss-aversion lever.** If the dog side is losing the weekly tally, the next dog Tribe Box ships with messaging like "You're behind by 47 points this month. Here's a code for 20% off any catalog SKU to claw it back." Sub gets the box AND the buyer's-remorse trigger to top up.

## Shopify implementation

Two paths:

1. **Shopify Subscriptions app** (first-party, free). Handles the recurring billing and customer portal. Lower customization, faster to ship.
2. **Recharge** ($60/mo + 1% of sub revenue). More flexible, supports cancel-flow flows, gifting, skip-a-month. Worth it past 200 active subscribers.

Start with Shopify Subscriptions. Migrate to Recharge if churn exit-flow control matters.

## Klaviyo flows

Three flows triggered by Tribe Box state:

1. **Pre-ship reveal.** Day before shipment, email with "Here's what's in your October Cat Box →" teaser. Builds anticipation. CTAs to share-your-cat content.
2. **Win celebration / loss recovery.** End of each leaderboard week, segmented by which side won. Winners get bragging-rights asset (downloadable wallpaper, shareable graphic). Losers get loss-aversion CTA (20% off any catalog SKU).
3. **Churn rescue.** Triggered when sub cancels. "Your cat will be marked inactive on the standings." Frames cancellation as letting the tribe down, not just stopping a subscription.

## Pricing / capacity math

At $19.99/mo with $8 contribution per box:

| Subs | Monthly recurring | Annual run-rate |
|---|---|---|
| 100 | $1,999 | ~$24k |
| 500 | $9,995 | ~$120k |
| 1,000 | $19,990 | ~$240k |

500 subscribers is the threshold where Tribe Box revenue covers the
Shopify plan + Klaviyo paid tier + 3PL minimums and starts contributing
real margin. 1,000 subscribers makes the whole brand sustainable from
sub revenue alone before counting any catalog one-time sales.

## Risks / unknowns

- **Pet subscriptions are competitive.** BarkBox, KitNipBox, MeowBox, Pet Pack all exist. TallyTails differentiator is the rivalry mechanic, not the box contents themselves. Need to lean into the tribal narrative aggressively in marketing or it reads as "another pet sub box."
- **Catnip / treat sourcing.** Quality matters. Cheap CJ-sourced catnip is a fast way to destroy trust. Source from a US treat manufacturer, even at higher COGS. Maybe Vital Essentials, Stella & Chewy's, or a small-batch US co-packer.
- **Fulfillment complexity.** 500 boxes shipping once a month is 25-50 boxes/day. Either a 3PL handles it (ShipBob does subscriptions) or it becomes Thomas's weekend job for the first 100 subs.
- **Cat / dog imbalance.** If the cat side gets 800 subs and the dog side gets 200, the leaderboard becomes a rout, not a rivalry. Need a soft balance lever — maybe early-bird pricing for whichever side is behind on subs, or a "switch sides" option after 3 months.

## Action sequence to ship

1. Pick the first 3 monthly themes for each side (cat-Jan / cat-Feb / cat-Mar + dog-Jan / dog-Feb / dog-Mar). Defines what's in the first three boxes.
2. Source the consumable + toy + sticker for box 1 (costs $400-800 in bulk for first 100 boxes).
3. Wire Shopify Subscriptions on the cat-pebble-fountain + dog-ortho-memory-bed product pages as an upsell ("Add the Cat Tribe Box, first month $9.99").
4. Build a `/subscribe` landing page that explains the box concept + leaderboard mechanic.
5. Soft launch to the first 50 customers via Klaviyo before any paid ads. Validates fulfillment + product-market fit at low cost before scaling.
