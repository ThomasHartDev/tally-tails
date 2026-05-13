# TallyTails

Cat-vs-dog rivalry pet storefront. One Hydrogen site, two tribes, an ongoing
score that every order tips. Cat side products. Dog side products. The
popup, the palette, and the homepage face-off all adapt based on who's
winning that week.

Read `HANDOFF.md` first if you're picking up work on this repo. Catalog
schema, ad scripts, and mascot prompts live in `docs/`.

## Stack

- **Hydrogen v2** (React Router 7.14)
- **Shopify** Storefront API + Admin API
- **Shopify Oxygen** hosting (free with the Basic plan, bound to `tallytails.com`)
- **CJ Dropshipping** + **Printify** for fulfillment
- **Klaviyo** for email
- **Meta + TikTok Pixel + Conversions API**, env-gated

## Dev

```bash
npm install
npm run dev -- --port 4126
```

`npm run typecheck` and `npm run build` should both pass before pushing.
The Storefront API falls back to a small placeholder catalog when
`PUBLIC_STORE_DOMAIN` is empty or set to `mock.shop`, so the dev server
runs without Shopify credentials.

## Layout

- `app/routes/`: Hydrogen routes (homepage, PDP, cart, account, blog, about)
- `app/components/`: Header, Footer, ProductCard, CartDrawer, EmailDiscountPopup, ReviewList
- `app/data/`: Static catalog + reviews fallback. Real catalog comes from Shopify
- `app/lib/`: Shopify client, cart context, analytics, SEO helpers, session
- `app/styles/`: Design tokens, global styles, per-route stylesheets
- `app/brand.ts`: Single source of brand strings (name, baseUrl, contact)
- `docs/`: Mascot prompts, catalog seed, ad scripts (pre-staged research)

## Custom by

[HARTECHO](https://hartecho.com).
