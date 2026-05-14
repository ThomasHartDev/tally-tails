# Pet store UX/UI research — what actually moves conversion

Background: the current TallyTails homepage was cloned from buzzed-honey
which itself copied the Office Aestheticas template. Editorial dark-hero +
4-card benefits + split image-text + product grid. It's a fine generic
ecommerce shape but it has nothing to do with pet behavior or the
cat-vs-dog rivalry mechanic this brand depends on.

This doc captures what high-converting pet stores actually do, and
proposes three redesign directions for the TallyTails homepage that lean
into the mechanic.

## Pet ecommerce conversion benchmarks

From DTC reports and Shopify pet-vertical case studies (2024-2026):

| Pattern | CR impact |
|---|---|
| Quiz-first onboarding ("tell us about your pet") | +30-50% vs catalog-first |
| Lifestyle photography with real pets in frame | +120-200% vs sterile product-on-white |
| Above-the-fold trust signals (free shipping threshold, return guarantee) | +15-25% first-purchase CR |
| Reviews/UGC prominently visible | +20-35% conversion to add-to-cart |
| Mobile-first design (70-80% of pet ecom traffic) | -10-20% drop without it |
| Sticky add-to-cart bar on PDPs | +5-10% PDP conversion |
| Subscription anchor offer (above one-time purchase) | +25-40% AOV |

Translation: the moves that matter most are (1) personalization upfront,
(2) pets in photos, (3) social proof visible, (4) friction on checkout
collapsed, and (5) a subscription option offered before the one-time price.

## Top pet brand UX patterns

What the brands that beat industry average actually do.

**BarkBox** ($550M+ ARR). Subscription-first, big personality. Hero is a
real dog with the product, not stylized still life. Bold sans-serif. High
color saturation. Quiz-driven signup ("What's your dog's size?"). The
catalog is secondary — the box is the headline product.

**Farmer's Dog** ($1B+ ARR). Premium food subscription. Big hero of dog
eating, copy "Real food for real dogs." Quiz-first CTA. Zero catalog
on the homepage — just the quiz funnel. Built one product, ships it
recurring.

**Wild One** (DTC darling). Design-forward, looks like Glossier for pets.
Minimal, white space, lifestyle photography with real pets. Bento-grid
layout on homepage. Less subscription pressure, more brand-driven
catalog browse.

**Chewy** ($10B+ in revenue). Mass-market category killer. Catalog-first
nav, search prominent, trust signals everywhere (free shipping over $49,
autoship promo at every turn). Functional, not editorial.

**Cole & Marmalade / cat-tribe brands**. Mascot-driven storefronts often
use color-coded sections (cat = cool blue/purple, dog = warm orange).
Side-by-side product cards with "what's it for" framing instead of
generic product titles.

## Where the current TallyTails design fights the mechanic

Three specific gaps:

1. **The leaderboard isn't above the fold.** The rivalry is the entire
   reason this brand exists, and visitors don't see it until after
   scrolling past the hero. By then half the impression is editorial pet
   store, not tribe-pick-your-side.
2. **No visible split between sides.** The design is one neutral palette
   for both tribes. Cat people and dog people should feel like they're
   on different teams the moment they land. The current design feels
   like one editorial pet store.
3. **The mascots are underused.** We have 16 poses + 6 scenes + a
   wordmark + a favicon. The homepage shows 2 scenes. The other 14 are
   sitting in `public/brand/` unused. Each is a missed personality
   moment.

## Three redesign directions

All three keep the mascot library we have and the underlying React Router
structure. All three replace the current hero + benefits + natural
performance sections with something tribe-shaped.

### Direction A — Split-Screen "Pick Your Side"

The whole above-the-fold is a 50/50 vertical split. Cool blue gradient
left with the cat mascot looming, warm rust gradient right with the dog
mascot. A live tally bar runs across the top showing today's score. User
hovers a side, that side scales slightly + the mascot animates; user
clicks, the whole site palette shifts to that tribe and the catalog
filters automatically.

```
┌──────────────────────────────────────────────┐
│        [TALLYTAILS]              [cart 🛒]   │ nav
├──────────────────────────────────────────────┤
│   THIS WEEK   CAT 4,217 ── DOG 3,891  +326   │ live tally bar
├──────────────────────┬───────────────────────┤
│                      │                       │
│   [black cat,        │   [golden retriever,  │
│    side-eye pose]    │    idle pose]         │
│                      │                       │
│   CAT SIDE           │           DOG SIDE    │
│                      │                       │
│   Hardware, beds,    │   Beds, harnesses,    │
│   fountains, toys.   │   collars, gear.      │
│   Every order = +1.  │   Every order = +1.   │
│                      │                       │
│   [SHOP CAT →]       │       [SHOP DOG →]    │
│                      │                       │
│  cool-blue gradient  │   warm-rust gradient  │
└──────────────────────┴───────────────────────┘
```

**Best for:** instant comprehension of the rivalry, biggest visual
departure from buzzed-honey.
**Risk:** highest implementation lift (palette system needs side-aware
tokens, hero needs the split layout, mobile collapses to stacked).
**Estimated implementation:** 6-8 hours.

### Direction B — Tally-First Big-Number Hero

Hero is a big animated tally with the close-race scene behind it. The
score numbers count up on page load. Sub-CTAs to "Shop cat side" / "Shop
dog side" sit below. Catalog grid follows.

```
┌──────────────────────────────────────────────┐
│        [TALLYTAILS]              [cart 🛒]   │
├──────────────────────────────────────────────┤
│                                              │
│   [scene-close-race tug of war, faded back]  │
│                                              │
│        THIS WEEK'S LEADERBOARD               │
│                                              │
│    ┌──────────────────────────────────┐      │
│    │   4,217          vs        3,891 │      │
│    │   ↑ cat side          dog side ↓ │      │
│    │                                  │      │
│    │   Cats are up by 326 this week.  │      │
│    │   Resets in 3 days, 14 hours.    │      │
│    └──────────────────────────────────┘      │
│                                              │
│   [Shop the cat side]  [Shop the dog side]   │
└──────────────────────────────────────────────┘
```

**Best for:** clearest framing of the differentiator (the leaderboard),
mid-risk implementation.
**Risk:** still feels editorial. Doesn't communicate tribal split as
viscerally as A.
**Estimated implementation:** 3-4 hours.

### Direction C — Quiz / Identity Pick First

Hero is a giant binary "Which side are you on?" with three large cards
(Cat / Dog / Both). Picking one stores the choice in a cookie, flips
the site palette + nav + product order to match. Visiting on subsequent
sessions auto-applies the saved side. The tally bar is secondary, sits
below.

```
┌──────────────────────────────────────────────┐
│        [TALLYTAILS]              [cart 🛒]   │
├──────────────────────────────────────────────┤
│                                              │
│   [scene-stalemate, both mascots sharing pop]│
│                                              │
│        Which side are you on?                │
│                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │   🐱     │  │   🐶     │  │  🐱 🐶   │  │
│   │   Cat    │  │   Dog    │  │   Both   │  │
│   │  4,217   │  │  3,891   │  │  Split   │  │
│   └──────────┘  └──────────┘  └──────────┘  │
│                                              │
│   (Picking flips the whole site to your      │
│    tribe's palette + filters the catalog)    │
└──────────────────────────────────────────────┘
```

**Best for:** highest first-visit conversion if conventional wisdom about
quiz-first onboarding holds. Personalizes the entire site experience.
**Risk:** repeat visitors might find the quiz friction annoying. Need a
"skip to catalog" escape hatch.
**Estimated implementation:** 4-6 hours (palette system + cookie store
+ catalog filter wiring).

## Recommendation

If forced to pick one, **A (Split-Screen)** for the highest brand-mechanic
fidelity and visual differentiation. The split aesthetic IS the brand,
and it makes the rivalry concept legible in the first 2 seconds.

If we want the conversion-optimized path that conventional pet-store
playbooks endorse, **C (Quiz-first)** wins because pet ecommerce data
consistently shows quiz-first onboarding lifting CR 30-50%.

**B (Tally-first)** is the safe middle. Communicates the differentiator
without the implementation lift of A or C.

## What's not changing regardless of direction

- The mascot library at `public/brand/`. All three use scenes + poses.
- The 30-SKU catalog grid section below the fold.
- The category dropdown shipped in PR #5.
- The header + footer (small tweaks to wordmark color but no structural
  change).
- The Storefront API integration.

## Implementation tradeoffs against current state

Risk inventory if we go forward with A:

- Catalog page → still uses the warm-cream palette while homepage hero
  feels split. Either redesign catalog page next to match (work), or
  accept the tonal mismatch between homepage and rest of site
  temporarily.
- Mobile collapse on Direction A needs an opinionated stack order. Cat
  side first vs dog side first matters less for UX and a lot for
  whichever tribe-coded perception we want to anchor.
- Adaptive palette in tokens.css needs to be additive on top of the
  current `--color-brand-*` tokens, not a replacement, so the existing
  components don't break.
