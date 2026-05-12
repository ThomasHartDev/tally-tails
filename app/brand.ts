/**
 * Brand config. Single place to change when forking this storefront for a
 * different client. Together with src/styles/tokens.css (palette + typography),
 * src/data/products.ts (catalog), and src/data/reviews.ts, this file should be
 * the only thing you need to edit to make a new store look and feel like a
 * different brand.
 */
export const brand = {
  name: "TallyTails",
  shortName: "TallyTails",
  legalName: "TallyTails, LLC",
  tagline: "The cat-vs-dog storefront where your purchases pick a side.",
  description:
    "Cat side or dog side. Every order tips the score. Pet products built for one tribe at a time, with a running tally so you can see who's winning.",
  baseUrl: "https://tallytails.com",
  contactEmail: "support@tallytails.com",
  currency: "USD",
  countryCode: "US",
  // Default OG image. Used when a route doesn't supply its own.
  ogImage: "/products/cat-side-throne-bed.webp",
  social: {
    twitter: "",
    instagram: "",
  },
  // Cat / dog accent colors. Used for tribe-tagged UI. Full dual palette
  // wiring is a follow-up; for now these are the two anchor hexes.
  catColor: "#5b7c99",   // cool slate-blue
  dogColor: "#b7572d",   // warm rust
  // Used in the Organization JSON-LD on the home page.
  founders: ["TallyTails Co."],
} as const;

export type Brand = typeof brand;
