/**
 * Static product catalog. Used as the fallback when Shopify env vars are
 * absent. Shape matches a normalized Shopify Storefront product so the UI
 * doesn't care which source is live. Real catalog comes from Shopify
 * Admin once the store is seeded (see docs/catalog-seed.md).
 */
export type Money = { amount: string; currencyCode: "USD" };

export type Category = "cat" | "dog" | "bundles";

export const CATEGORY_LABELS: Record<Category, string> = {
  cat: "Cat side",
  dog: "Dog side",
  bundles: "Bundles",
};

export type ProductSpecs = {
  dimensions: string;     // e.g. "32 x 24 x 9 inches"
  weight: string;         // e.g. "4.2 lbs"
  materials: string;      // e.g. "Memory foam core, washable cover"
  intendedFor: string;    // e.g. "Small to medium dogs (10-40 lbs)"
  features: string;       // e.g. "Non-slip base, machine washable"
  origin: string;         // e.g. "Designed in Utah, made in Vietnam"
};

export type Product = {
  handle: string;
  title: string;
  vendor: string;
  category: Category;
  description: string;
  details?: string[];
  specs?: ProductSpecs;
  tags: string[];
  featured: boolean;
  onSale: boolean;
  price: Money;
  compareAtPrice?: Money;
  images: Array<{ url: string; alt: string }>;
  variantId?: string;
};

// Placeholder catalog. Real SKUs land via Shopify Admin in the catalog-seed
// pass. These exist only so the dev server renders something coherent.
export const PRODUCTS: Product[] = [
  {
    handle: "cloud-donut-bed",
    title: "Cloud Donut Bed",
    vendor: "TallyTails",
    category: "cat",
    description: "The orthopedic donut bed your cat will actually sleep in. Raised bolstered rim, vegan fur exterior, removable washable cover.",
    tags: ["cat", "bed"],
    featured: true,
    onSale: false,
    price: { amount: "44.99", currencyCode: "USD" },
    images: [
      { url: "/products/cloud-donut-bed.webp", alt: "Cloud Donut Bed" },
    ],
  },
  {
    handle: "ceramic-pebble-fountain",
    title: "Ceramic Pebble Fountain",
    vendor: "TallyTails",
    category: "cat",
    description: "Filtered drinking fountain in glazed ceramic. Holds 70oz, runs quiet, dishwasher safe.",
    tags: ["cat", "fountain"],
    featured: true,
    onSale: false,
    price: { amount: "58.00", currencyCode: "USD" },
    images: [
      { url: "/products/ceramic-pebble-fountain.webp", alt: "Ceramic Pebble Fountain" },
    ],
  },
  {
    handle: "motion-activated-orb",
    title: "Motion-Activated Orb",
    vendor: "TallyTails",
    category: "cat",
    description: "Self-rolling toy that wakes on motion, runs in 12-minute play sessions, sleeps the rest of the day. USB-C rechargeable.",
    tags: ["cat", "toy"],
    featured: false,
    onSale: true,
    price: { amount: "32.00", currencyCode: "USD" },
    compareAtPrice: { amount: "40.00", currencyCode: "USD" },
    images: [
      { url: "/products/motion-activated-orb.webp", alt: "Motion-Activated Orb" },
    ],
  },
  {
    handle: "orthopedic-memory-bed",
    title: "Orthopedic Memory Bed",
    vendor: "TallyTails",
    category: "dog",
    description: "Memory foam core sized for medium to large breeds. Bolstered headrest, non-slip base, washable cover.",
    tags: ["dog", "bed"],
    featured: true,
    onSale: false,
    price: { amount: "89.00", currencyCode: "USD" },
    images: [
      { url: "/products/orthopedic-memory-bed.webp", alt: "Orthopedic Memory Bed" },
    ],
  },
  {
    handle: "led-rechargeable-collar",
    title: "LED Rechargeable Collar",
    vendor: "TallyTails",
    category: "dog",
    description: "Rechargeable LED collar with three brightness modes. Visible at 500m. Waterproof, USB-C charging, eight-hour runtime.",
    tags: ["dog", "collar"],
    featured: true,
    onSale: false,
    price: { amount: "28.00", currencyCode: "USD" },
    images: [
      { url: "/products/led-rechargeable-collar.webp", alt: "LED Rechargeable Collar" },
    ],
  },
  {
    handle: "no-pull-padded-harness",
    title: "No-Pull Padded Harness",
    vendor: "TallyTails",
    category: "dog",
    description: "Front-clip no-pull harness with padded chest plate. Reflective stitching, four adjustment points, sizes XS through XL.",
    tags: ["dog", "harness"],
    featured: false,
    onSale: true,
    price: { amount: "36.00", currencyCode: "USD" },
    compareAtPrice: { amount: "44.00", currencyCode: "USD" },
    images: [
      { url: "/products/no-pull-padded-harness.webp", alt: "No-Pull Padded Harness" },
    ],
  },
  {
    handle: "tally-starter-bundle",
    title: "Tally Starter Bundle",
    vendor: "TallyTails",
    category: "bundles",
    description: "One cat-side hero, one dog-side hero. The cheapest way to put both tribes on the board.",
    tags: ["bundle"],
    featured: true,
    onSale: true,
    price: { amount: "78.00", currencyCode: "USD" },
    compareAtPrice: { amount: "104.00", currencyCode: "USD" },
    images: [
      { url: "/products/tally-starter-bundle.webp", alt: "Tally Starter Bundle" },
    ],
  },
];

export function findProduct(handle: string): Product | undefined {
  return PRODUCTS.find((p) => p.handle === handle);
}

export function listProductsByCategory(): Record<Category, Product[]> {
  const out: Record<Category, Product[]> = {
    cat: [],
    dog: [],
    bundles: [],
  };
  for (const p of PRODUCTS) out[p.category].push(p);
  return out;
}
