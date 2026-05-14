# TallyTails redesign v2 — design plan

The previous storefront was a buzzed-honey clone (warm cream + rust, dark
editorial hero, Playfair Display + Inter). It doesn't communicate the
rivalry. This pass scraps the visual layer, keeps the functional surface,
and rebuilds in Tailwind v4 around the cat-vs-dog mechanic.

## The pitch in five seconds

Land. See "CAT 4,217 vs DOG 3,891" big at the top. See the cat mascot on
one side and the dog mascot on the other. Two big CTAs. Below: the
catalog. The split aesthetic IS the brand.

Direction A from `pet-store-conversion-research.md`, riffed slightly: keep
the split-screen hero, add a sticky tally bar so the score stays on every
page, and pull the Tribe Box anchor into the homepage above the catalog
for AOV lift.

## Stack changes

- Install `tailwindcss@^4.3.0` and `@tailwindcss/vite` plugin.
- Add a single global stylesheet at `app/styles/app.css` containing the
  `@import "tailwindcss"` line plus `@theme` tokens.
- Inline it in `app/root.tsx` via `?inline` + `<style>` tag. Vite v8 + the
  tailwind plugin emits compiled CSS into the JS module, which sidesteps
  the dev-mode MIME bug documented in
  `~/.claude/projects/-root-projects-tally-tails/memory/feedback_vite_css_mime_in_dev.md`.
- Delete every existing `.css` file under `app/styles/` and `app/components/`.
  Replace styling with Tailwind utility classes.

## Color system

Three palettes layered as CSS variables. The current tribe palette is
applied to `<html>` via a `data-tribe` attribute (`neutral` | `cat` | `dog`).
Cat-side and dog-side product cards always carry their own accent regardless
of the global tribe so the catalog stays legible.

```
Neutral (default, "no side picked")
  --bg            #fdfcf7   warm off-white
  --surface       #ffffff
  --ink           #1a1a1f   near-black
  --ink-soft      #4a4a55
  --line          #e7e5dc
  --accent        #1a1a1f   (use the tribe variant when one is active)

Cat palette (cool, slim, sharp)
  --cat-bg        #0f1a2a   deep navy
  --cat-surface   #1a2a40
  --cat-ink       #f3f6fb
  --cat-accent    #5b9dd9   bright steel-blue
  --cat-accent-2  #d4b95e   gold (cat eyes)

Dog palette (warm, eager, sunny)
  --dog-bg        #2a1810   coffee brown
  --dog-surface   #3d2a1d
  --dog-ink       #fdf6ec
  --dog-accent    #e8853a   rust-orange
  --dog-accent-2  #f4c969   golden retriever gold
```

Both tribe palettes have a hard contrast against the neutral page. Cat side
feels like a tech-product page (dark, blue, sharp). Dog side feels like a
ski-lodge breakfast (dark, warm, sunset).

Component-level tokens (cards, buttons, chips) read from `--accent` so they
auto-flip when `data-tribe` changes.

## Typography

Two web fonts via Google Fonts CSS-import (lazy CSS, no @font-face dance):

- **Display**: `Bricolage Grotesque` — variable, modern, geometric-but-not-cold,
  reads as a brand-coded type for a personality-heavy store. Used for hero
  numbers, H1, H2, the leaderboard counter.
- **Body**: `Inter` — keep it from the previous pass for body copy. Same
  Inter we already had loaded. Cheap, reliable, mobile-readable.

No third font. No serif. The editorial Playfair vibe goes.

```
display 700  -> hero ("CAT 4,217 vs DOG 3,891")
display 600  -> H2 ("Shop the cat side")
body 500     -> nav, buttons, eyebrows
body 400     -> paragraphs
```

## Component inventory

Each gets a Tailwind rewrite. JSX shrinks because there's no class-name
ceremony, and palette tokens carry the tribe flip.

| Component | New shape |
|---|---|
| `Header` | Sticky, with mini-tally `CAT 4,217 — DOG 3,891` chip on desktop. Mobile collapses tally into a single "+326 cat" delta pill. Logo + nav + cart icon. Background frosted when scrolled. |
| `Footer` | Three columns (Shop, Brand, Weekly tally newsletter), dark surface. |
| `ProductCard` | Square image (1:1), tribe-side stripe on top-left, title + price + tribe-coded "Add" button. On hover, a "+1 cat side" / "+1 dog side" badge slides up. |
| `CartDrawer` | Cleaner mobile-first slide-in. Removes the buzzed-honey tier-progress visual cruft (CartProgressBar component is kept but restyled). |
| `EmailDiscountPopup` | Centered card, mascot peeking from one corner, "Get 10% off your first order" + email + side-picker chips. |
| `Hero` (homepage) | Full-width split, see ASCII below. Mobile stacks (cat above dog). |
| `Catalog` (homepage) | Tribe filter chips at the top (All / Cat / Dog / Bundles), then a 2-col grid on mobile and a 3-4 col grid on desktop. `useSearchParams` reads `?side=cat` / `?side=dog` and pre-applies the filter (this is the brief's hard requirement). |
| `PDP` | Image gallery left (or stacked on mobile), info panel right. Sticky add-to-cart bar appears on scroll for mobile. Reviews below. |
| `Blog` index | Card grid, two real posts + two upcoming, dark accent on the card hover. |
| `About` | Simpler, narrower body, mascot photo at the top instead of an inline image. |
| `Account` | Restyle in the same shop card style. |

## Homepage layout sketch

```
┌──────────────────────────────────────────────────────────┐
│  Sticky header                                            │
│  [TT logo]  Shop  About  Journal      CAT 4217 | DOG 3891 [cart]
├──────────────────────────────────────────────────────────┤
│  HERO — split, full-bleed                                 │
│  ┌─────────────────┬───────────────────┐                  │
│  │  CAT 4,217      │       DOG 3,891   │                  │
│  │  ↑ cats up 326  │                   │                  │
│  │  [cat mascot]   │     [dog mascot]  │                  │
│  │  CAT SIDE       │       DOG SIDE    │                  │
│  │  [Shop cat →]   │     [Shop dog →]  │                  │
│  └─────────────────┴───────────────────┘                  │
├──────────────────────────────────────────────────────────┤
│  Trust bar (one row, four icons + text)                   │
│  $5 flat shipping · Free over $50 · 30-day returns ·      │
│  US warehouses                                            │
├──────────────────────────────────────────────────────────┤
│  "Pick your tribe. Then pick your products."              │
│  [filter: All / Cat / Dog / Bundles]                      │
│  Catalog grid (2/3/4 cols by breakpoint)                  │
├──────────────────────────────────────────────────────────┤
│  TRIBE BOX subscription anchor                            │
│  ┌────────────────────────────────────────────────┐       │
│  │  $19.99/mo  Tribe Box                          │       │
│  │  One treat. One toy. One sticker. One standings│       │
│  │  card. Auto-tally every month.                 │       │
│  │  [Cat Tribe Box]   [Dog Tribe Box]             │       │
│  └────────────────────────────────────────────────┘       │
├──────────────────────────────────────────────────────────┤
│  How the tally works (3 steps, mascots illustrate each)   │
├──────────────────────────────────────────────────────────┤
│  Footer                                                   │
└──────────────────────────────────────────────────────────┘
```

Mobile (390px): hero collapses to stacked panels (cat on top), tally bar
spans the full width above. CTAs are full-width pills. Catalog is 2-col.

## PDP sketch

```
┌──────────────────────────────────────────────────────────┐
│  Header                                                   │
├──────────────────────────────────────────────────────────┤
│  Breadcrumb: Home / Cat side / Pebble Fountain            │
│  ┌──────────────────────┬────────────────────────┐        │
│  │  [main image]        │  [eyebrow] Cat side    │        │
│  │  [thumbs]            │  Ceramic Pebble        │        │
│  │                      │  Fountain              │        │
│  │                      │  ★★★★☆ 4.6 · 38        │        │
│  │                      │  $44.99                │        │
│  │                      │  "Filtered drinking…"  │        │
│  │                      │  [qty -][1][+]         │        │
│  │                      │  [Add to cart]         │        │
│  │                      │  [+1 cat side toggle]  │        │
│  │                      │  Ships in 48h · Free   │        │
│  │                      │  returns               │        │
│  └──────────────────────┴────────────────────────┘        │
├──────────────────────────────────────────────────────────┤
│  Description / specs (two columns desktop, stacked mobile)│
├──────────────────────────────────────────────────────────┤
│  Reviews (rating distribution bar + list + write-review)  │
├──────────────────────────────────────────────────────────┤
│  "Other cat-side picks" — 4 cards from the same tribe     │
├──────────────────────────────────────────────────────────┤
│  Footer                                                   │
└──────────────────────────────────────────────────────────┘
```

Mobile: stacked image / info, sticky add-to-cart bar pinned to the bottom
edge once the user scrolls past the info panel.

## Cart drawer sketch

```
┌─────────────────────┐
│  Your cart    [×]   │
├─────────────────────┤
│  $5 to free shipping│
│  ▓▓▓▓░░░░░░         │
├─────────────────────┤
│  [img] Pebble Fount │
│        $44.99       │
│        [-][1][+] ×  │
│                     │
│  [img] LED Collar   │
│        $19.99       │
│        [-][1][+] ×  │
├─────────────────────┤
│  Subtotal   $64.98  │
│  Shipping calc next │
│  [Check out →]      │
└─────────────────────┘
```

## Tally state

Per the brief's #6: the live leaderboard backend isn't built. Hard-code
`{ cat: 4217, dog: 3891 }` in `app/lib/tally.ts` with a TODO comment that
the loader will replace it with a real call once the metafield / Upstash
KV layer ships. The Header reads it via a static import. Cleaner than
threading mock data through the route loaders.

## What I'm explicitly NOT doing

- No mid-stream feedback round trip with Thomas.
- No subscription wiring (Tribe Box is an aspirational card link, not a
  Shopify product).
- No fancy adaptive palette where the page flips on scroll. The
  `data-tribe` switch on hover/click of the hero panels is enough for v2.
  Full adaptive palette is action #9 in HANDOFF.md.
- No new images. Only the WebPs already in `public/brand/`.
- No new fonts beyond Bricolage Grotesque and Inter.

## Implementation order

1. Install Tailwind v4, set up `app.css` with `@theme` tokens. Wire into
   `root.tsx` via `?inline`. Add `data-tribe` attribute.
2. Replace `Header` and `Footer` (used everywhere).
3. Replace homepage `Hero`, `Catalog`, add `TribeBoxAnchor` and `HowItWorks`.
4. Replace `ProductCard`, `Stars`, `CartDrawer`, `CartProgressBar`.
5. Replace `PDP` route.
6. Replace `Blog` index, `About`, `Account` styling.
7. Restyle `EmailDiscountPopup`.
8. Delete every old CSS file. Run typecheck + build.
9. Commit on `thomas/feat/ux-rebuild-v2`.

Estimated time: 4-6 commits across a focused session. Some components may
ship "good-enough first pass" rather than polished. Polish PRs follow.
