import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { listProducts } from "~/lib/shopify";
import { CATEGORY_LABELS, productTypeLabel, type Category } from "~/data/products";
import { ProductCard } from "~/components/ProductCard";
import { brand } from "~/brand";
import { useJsonLd, useSeo } from "~/lib/seo";
import { TALLY, tallyDelta } from "~/lib/tally";

export async function loader({ context }: LoaderFunctionArgs) {
  const products = await listProducts(
    context.storefront,
    context.env.PUBLIC_STORE_DOMAIN,
  );
  return { products };
}

export const meta: MetaFunction = () => {
  const title = brand.tagline;
  const url = `${brand.baseUrl}/`;
  const image = `${brand.baseUrl}${brand.ogImage}`;
  return [
    { title },
    { name: "description", content: brand.description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title },
    { property: "og:description", content: brand.description },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:image", content: image },
    { property: "og:site_name", content: brand.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: brand.description },
    { name: "twitter:image", content: image },
  ];
};

export default function HomePage() {
  const { products } = useLoaderData<typeof loader>();

  useSeo({
    title: brand.tagline,
    description: brand.description,
    path: "/",
    type: "website",
    absoluteTitle: false,
  });

  useJsonLd("organization", {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    legalName: brand.legalName,
    url: brand.baseUrl,
    logo: `${brand.baseUrl}/brand/logo.svg`,
    description: brand.description,
    contactPoint: {
      "@type": "ContactPoint",
      email: brand.contactEmail,
      contactType: "customer support",
    },
  });

  useJsonLd("website", {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: brand.name,
    url: brand.baseUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${brand.baseUrl}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  });

  return (
    <>
      <Hero />
      <TrustBar />
      <Catalog products={products} />
      <TribeBoxAnchor />
      <HowItWorks />
    </>
  );
}

function Hero() {
  const delta = tallyDelta(TALLY);
  // Clicking a side sets the tribe palette on <html> for the rest of the
  // session. The catalog still filters via the URL so ?side=cat works
  // independently from the hover state.
  const setTribe = (tribe: "cat" | "dog") => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("data-tribe", tribe);
  };

  return (
    <section className="relative isolate overflow-hidden">
      {/* Tally headline strip */}
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 text-center md:px-8 md:pt-16">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
          The weekly tally
        </span>
        <div className="mt-3 flex flex-wrap items-baseline justify-center gap-3 font-display text-4xl font-bold tabular-nums leading-none tracking-[-0.04em] md:gap-6 md:text-6xl lg:text-7xl">
          <span className="text-[var(--color-cat)]">CAT {TALLY.cat.toLocaleString()}</span>
          <span className="text-[var(--color-ink-mute)] text-2xl md:text-4xl">vs</span>
          <span className="text-[var(--color-dog)]">DOG {TALLY.dog.toLocaleString()}</span>
        </div>
        {delta.leader !== "tie" && (
          <p className="mt-3 text-sm text-[var(--color-ink-soft)]">
            <span className="font-semibold text-[var(--color-ink)]">
              {delta.leader === "cat" ? "Cats" : "Dogs"} up {delta.diff.toLocaleString()}
            </span>{" "}
            this week. Score resets Sunday midnight.
          </p>
        )}
      </div>

      {/* Split panels: cat on the left, dog on the right. Mobile stacks. */}
      <div className="mx-auto grid max-w-7xl gap-3 px-4 pb-12 md:grid-cols-2 md:px-8 md:pb-20">
        <a
          href="/?side=cat#catalog"
          onClick={() => setTribe("cat")}
          className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--color-cat-bg)] p-6 text-[var(--color-cat-ink)] md:aspect-[3/4] md:p-8"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-cat-gold)]">
              Cat side
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] md:text-5xl">
              Sharp.
              <br />
              Quiet.
              <br />
              Winning.
            </h2>
            <p className="mt-3 max-w-xs text-sm text-[var(--color-cat-ink)]/80">
              The cat tribe is ahead this week. Beds, fountains, perches,
              motion toys. Tap a product to lock in a vote.
            </p>
          </div>
          <img
            src="/brand/mascots/cat-victory-throne.webp"
            alt="TallyTails cat mascot on a throne"
            width="600"
            height="600"
            fetchPriority="high"
            decoding="async"
            className="pointer-events-none absolute -right-6 -bottom-6 h-[60%] w-auto object-contain transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105"
          />
          <span className="relative z-10 mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-cat)] px-5 py-3 text-sm font-semibold text-[var(--color-cat-bg)] transition-transform group-hover:translate-x-1">
            Shop cat side
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>

        <a
          href="/?side=dog#catalog"
          onClick={() => setTribe("dog")}
          className="group relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl bg-[var(--color-dog-bg)] p-6 text-[var(--color-dog-ink)] md:aspect-[3/4] md:p-8"
        >
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-dog-gold)]">
              Dog side
            </span>
            <h2 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-[-0.04em] md:text-5xl">
              Eager.
              <br />
              Loud.
              <br />
              Catching up.
            </h2>
            <p className="mt-3 max-w-xs text-sm text-[var(--color-dog-ink)]/80">
              The dog tribe is {delta.leader === "dog" ? "ahead" : "326 behind"}. Memory beds,
              padded harnesses, LED collars, treat puzzles. Push the score.
            </p>
          </div>
          <img
            src="/brand/mascots/dog-dance.webp"
            alt="TallyTails dog mascot dancing"
            width="600"
            height="600"
            fetchPriority="high"
            decoding="async"
            className="pointer-events-none absolute -right-6 -bottom-6 h-[60%] w-auto object-contain transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-105"
          />
          <span className="relative z-10 mt-4 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--color-dog)] px-5 py-3 text-sm font-semibold text-[var(--color-dog-bg)] transition-transform group-hover:translate-x-1">
            Shop dog side
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </a>
      </div>
    </section>
  );
}

const TRUST_ITEMS = [
  { icon: "🚚", label: "$5 flat shipping" },
  { icon: "✦", label: "Free over $50" },
  { icon: "↺", label: "30-day returns" },
  { icon: "🇺🇸", label: "US warehouses" },
];

function TrustBar() {
  return (
    <section className="border-y border-[var(--color-line)] bg-[var(--color-surface-2)]">
      <ul className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4 py-4 text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-ink-soft)] md:gap-x-12 md:px-8 md:text-sm">
        {TRUST_ITEMS.map((t) => (
          <li key={t.label} className="flex items-center gap-2">
            <span aria-hidden className="text-base text-[var(--color-ink)]">{t.icon}</span>
            {t.label}
          </li>
        ))}
      </ul>
    </section>
  );
}

type SortKey = "featured" | "price-asc" | "price-desc" | "name";

const SORT_LABELS: Record<SortKey, string> = {
  featured: "Featured",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  name: "Name (A → Z)",
};

const SIDE_FILTERS: Array<{ value: "all" | Category; label: string }> = [
  { value: "all", label: "All" },
  { value: "cat", label: CATEGORY_LABELS.cat },
  { value: "dog", label: CATEGORY_LABELS.dog },
  { value: "bundles", label: CATEGORY_LABELS.bundles },
];

function Catalog({ products }: { products: Awaited<ReturnType<typeof listProducts>> }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSide = searchParams.get("side");
  const initialCategory: "all" | Category =
    urlSide === "cat" || urlSide === "dog" || urlSide === "bundles"
      ? (urlSide as Category)
      : "all";

  const [category, setCategory] = useState<"all" | Category>(initialCategory);
  const [productType, setProductType] = useState<string>("");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  // Reflect ?side= changes from external navigation (e.g. footer links).
  useEffect(() => {
    const next = searchParams.get("side");
    if (next === "cat" || next === "dog" || next === "bundles") {
      setCategory(next);
    } else if (!next) {
      // Don't force-reset when the user clears the URL; only sync explicit values.
    }
    // We intentionally don't depend on `category` so this only mirrors URL-in.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // When the user picks a side via chips, also write it to the URL so the
  // state survives reload and is shareable.
  const onPickCategory = (next: "all" | Category) => {
    setCategory(next);
    setProductType("");
    const sp = new URLSearchParams(searchParams);
    if (next === "all") sp.delete("side");
    else sp.set("side", next);
    setSearchParams(sp, { replace: true, preventScrollReset: true });

    // Flip the page tribe palette to match the active side.
    if (typeof document !== "undefined") {
      const tribe = next === "cat" || next === "dog" ? next : "neutral";
      document.documentElement.setAttribute("data-tribe", tribe);
    }
  };

  const typeOptions = useMemo(() => {
    if (category === "all") return [] as string[];
    const set = new Set<string>();
    for (const p of products) {
      if (p.category === category && p.productType) set.add(p.productType);
    }
    return [...set].sort();
  }, [products, category]);

  const visible = useMemo(() => {
    let out = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (productType && p.productType !== productType) return false;
      if (onSaleOnly && !p.onSale) return false;
      return true;
    });
    if (sort === "price-asc") {
      out = [...out].sort(
        (a, b) => Number(a.price.amount) - Number(b.price.amount),
      );
    } else if (sort === "price-desc") {
      out = [...out].sort(
        (a, b) => Number(b.price.amount) - Number(a.price.amount),
      );
    } else if (sort === "name") {
      out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      out = [...out].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return out;
  }, [products, category, productType, onSaleOnly, sort]);

  return (
    <section
      id="catalog"
      aria-labelledby="catalog-heading"
      className="mx-auto max-w-7xl px-4 py-16 md:px-8 md:py-24 scroll-mt-20"
    >
      <header className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
            Pick your tribe
          </span>
          <h2
            id="catalog-heading"
            className="mt-1 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)] md:text-4xl"
          >
            Then pick your products.
          </h2>
          <p className="mt-2 max-w-prose text-sm text-[var(--color-ink-soft)]">
            {products.length} SKUs total. Cat side, dog side, bundles for the
            mixed household.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-[var(--color-ink-soft)]">
            Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="ml-2 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 text-sm font-medium text-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/40"
            >
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <option key={k} value={k}>{SORT_LABELS[k]}</option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {/* Side filter chips */}
      <div className="mb-4 flex flex-wrap gap-2">
        {SIDE_FILTERS.map((opt) => {
          const active = category === opt.value;
          const dotColor =
            opt.value === "cat"
              ? "bg-[var(--color-cat)]"
              : opt.value === "dog"
                ? "bg-[var(--color-dog)]"
                : opt.value === "bundles"
                  ? "bg-[var(--color-ink)]"
                  : "bg-transparent border border-[var(--color-line)]";
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onPickCategory(opt.value)}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                active
                  ? "border-[var(--color-ink)] bg-[var(--color-ink)] text-[var(--color-bg)]"
                  : "border-[var(--color-line)] bg-[var(--color-surface)] text-[var(--color-ink)] hover:border-[var(--color-ink)]"
              }`}
            >
              <span className={`h-2 w-2 rounded-full ${dotColor}`} aria-hidden />
              {opt.label}
            </button>
          );
        })}
        <label className="ml-auto inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)]">
          <input
            type="checkbox"
            checked={onSaleOnly}
            onChange={(e) => setOnSaleOnly(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--color-line)] text-[var(--color-accent)]"
          />
          On sale only
        </label>
      </div>

      {/* Optional product-type sub-chips when a side is active */}
      {typeOptions.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setProductType("")}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              !productType
                ? "bg-[var(--color-surface-2)] text-[var(--color-ink)]"
                : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            }`}
          >
            All types
          </button>
          {typeOptions.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setProductType(productType === t ? "" : t)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                productType === t
                  ? "bg-[var(--color-surface-2)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`}
            >
              {productTypeLabel(t)}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      <p className="mb-4 text-xs text-[var(--color-ink-mute)]" aria-live="polite">
        Showing {visible.length} of {products.length}
      </p>

      {visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-[var(--color-line)] p-10 text-center text-sm text-[var(--color-ink-soft)]">
          No products match those filters.{" "}
          <button
            type="button"
            onClick={() => {
              onPickCategory("all");
              setOnSaleOnly(false);
              setSort("featured");
            }}
            className="font-semibold text-[var(--color-ink)] underline-offset-2 hover:underline"
          >
            Reset
          </button>
          .
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {visible.map((p, i) => (
            <li key={p.handle}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TribeBoxAnchor() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 md:px-8 md:pb-24">
      <div className="overflow-hidden rounded-3xl bg-[var(--color-ink)] text-[var(--color-bg)] md:grid md:grid-cols-2">
        <div className="p-8 md:p-12">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-dog-gold)]">
            Subscribe · $19.99/mo
          </span>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] md:text-5xl">
            The Tribe Box.
          </h2>
          <p className="mt-3 max-w-md text-sm text-[var(--color-bg)]/75 md:text-base">
            One treat. One toy. One sticker. One standings card. Auto-tally
            every month, so your subscription keeps voting even when you
            forget to.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/?side=cat#catalog"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-cat)] px-5 py-3 text-sm font-semibold text-[var(--color-cat-bg)] hover:opacity-90"
            >
              Cat Tribe Box
            </a>
            <a
              href="/?side=dog#catalog"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-dog)] px-5 py-3 text-sm font-semibold text-[var(--color-dog-bg)] hover:opacity-90"
            >
              Dog Tribe Box
            </a>
          </div>
          <p className="mt-4 text-xs text-[var(--color-bg)]/50">
            Cancel any time. Counts as one vote per month for your side.
          </p>
        </div>
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-surface-2)] md:aspect-auto">
          <img
            src="/brand/scenes/scene-close-race.webp"
            alt="Cat and dog mascots running neck and neck"
            width="900"
            height="900"
            decoding="async"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}

const STEPS: Array<{ mascot: string; title: string; body: string }> = [
  {
    mascot: "/brand/mascots/cat-plotting.webp",
    title: "1. Pick a side",
    body: "Cat side or dog side. The chip filter at the top of the catalog locks the score to whichever tribe you're shopping.",
  },
  {
    mascot: "/brand/mascots/dog-stretched.webp",
    title: "2. Order ships",
    body: "Most orders ship inside 48 hours from a US warehouse. The tally bumps the moment Shopify marks the order paid.",
  },
  {
    mascot: "/brand/mascots/cat-dance.webp",
    title: "3. The score updates",
    body: "Cat tribe vs dog tribe, live on every page. The score resets every Sunday at midnight Pacific so the fight stays fresh.",
  },
];

function HowItWorks() {
  return (
    <section className="bg-[var(--color-surface-2)] py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="max-w-2xl">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
            How the tally works
          </span>
          <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)] md:text-4xl">
            One storefront, two tribes, one ongoing score.
          </h2>
        </div>
        <ol className="mt-10 grid gap-6 md:grid-cols-3">
          {STEPS.map((s) => (
            <li
              key={s.title}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
            >
              <img
                src={s.mascot}
                alt=""
                width="120"
                height="120"
                loading="lazy"
                decoding="async"
                className="h-24 w-24 object-contain"
              />
              <h3 className="mt-4 font-display text-lg font-semibold text-[var(--color-ink)]">
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
