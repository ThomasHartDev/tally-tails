import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { listProducts } from "~/lib/shopify";
import { CATEGORY_LABELS, productTypeLabel, type Category } from "~/data/products";
import { ProductCard } from "~/components/ProductCard";
import { brand } from "~/brand";
import { useJsonLd, useSeo } from "~/lib/seo";
import "~/styles/routes/_index.css";

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
      <BenefitsBanner />
      <NaturalPerformance />
      <Catalog products={products} />
      <FinalCta />
    </>
  );
}

function Hero() {
  return (
    <section className="hero">
      <img
        className="hero-image"
        src="/brand/scenes/scene-close-race.webp"
        alt="TallyTails cat and dog mascots in a tug of war"
        fetchPriority="high"
        decoding="async"
        width="2000"
        height="1200"
      />
      <div className="hero-overlay" aria-hidden="true" />
      <div className="hero-content container">
        <h1 className="hero-title">
          Cat or dog. <em>Pick your side.</em>
        </h1>
        <p className="hero-sub">
          Every order tips a running tally between the two tribes. Cat side
          products. Dog side products. One ongoing score. The leaderboard
          updates the moment you check out.
        </p>
        <div className="hero-actions">
          <a href="#catalog" className="btn btn-primary hero-cta">
            Shop the cat side
          </a>
          <a
            href="#catalog"
            className="btn btn-outline hero-cta-secondary"
          >
            Shop the dog side
          </a>
        </div>
      </div>
    </section>
  );
}

const BENEFITS = [
  {
    title: "Products we'd buy for our own pets",
    body: "Every SKU is sourced or tested against what we'd put in our own home. No drop-ship junk, no white-label rebrands of broken AliExpress goods.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 6l2.6 5.2 5.7.8-4.1 4 1 5.7L16 19l-5.2 2.7 1-5.7-4.1-4 5.7-.8L16 6z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Live tally on every page",
    body: "Cat side vs dog side. The score updates on every purchase and resets weekly. The popup, palette, and homepage all bend toward whoever is winning.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M4 26V10M12 26V4M20 26v-9M28 26V14"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Pick a side, no in-between",
    body: "There is no cat-and-dog combo product. The tribes are separate by design. The bundles exist so you can buy for the household without splitting the score.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M16 4v24M4 16h24"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    title: "Free returns, simple flat shipping",
    body: "$5 flat shipping. Free over $50. 30-day no-questions returns. We pay the return label.",
    icon: (
      <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M5 11l11-6 11 6v10l-11 6-11-6V11z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        <path
          d="M5 11l11 6 11-6M16 17v10"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

function BenefitsBanner() {
  return (
    <section className="benefits" aria-labelledby="benefits-heading">
      <div className="container">
        <h2 id="benefits-heading" className="sr-only">
          Why TallyTails
        </h2>
        <ul className="benefits-grid">
          {BENEFITS.map((b) => (
            <li className="benefit" key={b.title}>
              <span className="benefit-icon" aria-hidden="true">
                {b.icon}
              </span>
              <h3 className="benefit-title">{b.title}</h3>
              <p className="benefit-body">{b.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function NaturalPerformance() {
  return (
    <section className="natural">
      <div className="natural-grid container">
        <div className="natural-image-wrap">
          <img
            src="/brand/scenes/scene-stalemate.webp"
            alt="TallyTails cat and dog mascots sharing popcorn"
            className="natural-image"
            loading="lazy"
            decoding="async"
            width="800"
            height="1000"
          />
        </div>
        <div className="natural-copy">
          <span className="eyebrow">How the tally works</span>
          <h2 className="natural-title">
            One storefront, two tribes, an ongoing score.
          </h2>
          <p className="natural-prose">
            Every order ticks the counter on the side you bought from. Cat
            purchases push the cat score up. Dog purchases push the dog score
            up. The site reads the score every page load. The popup, the
            palette, and the homepage all lean toward whoever is winning that
            week.
          </p>
          <p className="natural-prose">
            The score resets every Sunday at midnight. The leaderboard week is
            a fresh fight every week. Buy what you actually need for your
            pet, but know that the order is also a vote.
          </p>
          <a href="#catalog" className="btn btn-primary natural-cta">
            Browse all products
          </a>
        </div>
      </div>
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

const CATEGORY_FILTERS: Array<{ value: "all" | Category; label: string }> = [
  { value: "all", label: "All products" },
  { value: "cat", label: CATEGORY_LABELS.cat },
  { value: "dog", label: CATEGORY_LABELS.dog },
  { value: "bundles", label: CATEGORY_LABELS.bundles },
];

function Catalog({ products }: { products: Awaited<ReturnType<typeof listProducts>> }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [category, setCategory] = useState<"all" | Category>("all");
  const [productType, setProductType] = useState<string>("");
  const [onSaleOnly, setOnSaleOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>("featured");

  // Build the grouped dropdown options from the live catalog. Each leaf option
  // encodes "<category>:<productType>" so a single selection sets both filters.
  // When the supplier-bulk import grows the catalog from 30 to 1000+ SKUs the
  // optgroup list rebuilds automatically.
  const typeOptions = useMemo(() => {
    const byCategory: Record<Category, Set<string>> = {
      cat: new Set(),
      dog: new Set(),
      bundles: new Set(),
    };
    for (const p of products) {
      if (p.productType) byCategory[p.category].add(p.productType);
    }
    return (Object.keys(byCategory) as Category[]).map((cat) => ({
      category: cat,
      categoryLabel: CATEGORY_LABELS[cat],
      types: [...byCategory[cat]].sort(),
    }));
  }, [products]);

  const visible = useMemo(() => {
    let out = products.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (productType && p.productType !== productType) return false;
      if (onSaleOnly && !p.onSale) return false;
      return true;
    });
    if (sort === "price-asc") {
      out = [...out].sort(
        (a, b) => Number(a.price.amount) - Number(b.price.amount)
      );
    } else if (sort === "price-desc") {
      out = [...out].sort(
        (a, b) => Number(b.price.amount) - Number(a.price.amount)
      );
    } else if (sort === "name") {
      out = [...out].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      out = [...out].sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return out;
  }, [products, category, productType, onSaleOnly, sort]);

  const activeFilterCount =
    (category !== "all" ? 1 : 0) +
    (productType ? 1 : 0) +
    (onSaleOnly ? 1 : 0) +
    (sort !== "featured" ? 1 : 0);

  const reset = () => {
    setCategory("all");
    setProductType("");
    setOnSaleOnly(false);
    setSort("featured");
  };

  // The dropdown value encodes both axes: "all" | "<category>" | "<category>:<type>".
  const dropdownValue =
    category === "all"
      ? "all"
      : productType
        ? `${category}:${productType}`
        : category;

  const onDropdownChange = (value: string) => {
    if (value === "all") {
      setCategory("all");
      setProductType("");
      return;
    }
    const [cat, type] = value.split(":");
    setCategory(cat as Category);
    setProductType(type ?? "");
  };

  return (
    <section id="catalog" className="catalog" aria-labelledby="catalog-heading">
      <div className="container">
        <header className="catalog-head">
          <div className="catalog-headings">
            <span className="eyebrow">The full catalog</span>
            <h2 id="catalog-heading" className="catalog-title">
              Shop the catalog.
            </h2>
            <p className="catalog-sub">
              Cat side, dog side, bundles. {products.length} products total. Use the
              filters to narrow it down.
            </p>
          </div>
          <div className="catalog-controls">
            <label className="catalog-quickpick">
              <span className="sr-only">Browse category</span>
              <select
                className="catalog-quickpick-select"
                value={dropdownValue}
                onChange={(e) => {
                  onDropdownChange(e.target.value);
                  const el = document.getElementById("catalog");
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                aria-label="Browse by category"
              >
                <option value="all">Browse all categories</option>
                {typeOptions
                  .filter((g) => g.types.length > 0)
                  .map((g) => (
                    <optgroup key={g.category} label={g.categoryLabel}>
                      <option value={g.category}>All {g.categoryLabel.toLowerCase()}</option>
                      {g.types.map((t) => (
                        <option key={t} value={`${g.category}:${t}`}>
                          {productTypeLabel(t)}
                        </option>
                      ))}
                    </optgroup>
                  ))}
              </select>
            </label>
            <button
              type="button"
              className="btn btn-outline catalog-filter-btn"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-controls="filter-drawer"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3 6h18M6 12h12M10 18h4"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="catalog-filter-count" aria-hidden="true">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <span className="catalog-result-count" aria-live="polite">
              Showing {visible.length} of {products.length}
            </span>
          </div>
        </header>

        {activeFilterCount > 0 && (
          <ActiveFilters
            category={category}
            productType={productType}
            onSaleOnly={onSaleOnly}
            sort={sort}
            onClear={reset}
            onClearCategory={() => setCategory("all")}
            onClearProductType={() => setProductType("")}
            onClearSale={() => setOnSaleOnly(false)}
            onClearSort={() => setSort("featured")}
          />
        )}

        {visible.length === 0 ? (
          <p className="catalog-empty">
            No products match those filters.{" "}
            <button type="button" className="catalog-empty-reset" onClick={reset}>
              Reset
            </button>
            .
          </p>
        ) : (
          <ul className="product-grid catalog-grid">
            {visible.map((p, i) => (
              <li key={p.handle}>
                <ProductCard product={p} priority={i === 0} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <FilterDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        category={category}
        setCategory={setCategory}
        onSaleOnly={onSaleOnly}
        setOnSaleOnly={setOnSaleOnly}
        sort={sort}
        setSort={setSort}
        resultCount={visible.length}
        onReset={reset}
      />
    </section>
  );
}

function ActiveFilters({
  category,
  productType,
  onSaleOnly,
  sort,
  onClear,
  onClearCategory,
  onClearProductType,
  onClearSale,
  onClearSort,
}: {
  category: "all" | Category;
  productType: string;
  onSaleOnly: boolean;
  sort: SortKey;
  onClear: () => void;
  onClearCategory: () => void;
  onClearProductType: () => void;
  onClearSale: () => void;
  onClearSort: () => void;
}) {
  return (
    <div className="active-filters" role="list" aria-label="Active filters">
      {category !== "all" && (
        <ActiveFilterChip
          label={CATEGORY_LABELS[category]}
          onRemove={onClearCategory}
        />
      )}
      {productType && (
        <ActiveFilterChip
          label={productTypeLabel(productType)}
          onRemove={onClearProductType}
        />
      )}
      {onSaleOnly && (
        <ActiveFilterChip label="On sale only" onRemove={onClearSale} />
      )}
      {sort !== "featured" && (
        <ActiveFilterChip label={SORT_LABELS[sort]} onRemove={onClearSort} />
      )}
      <button
        type="button"
        className="active-filters-clear"
        onClick={onClear}
      >
        Clear all
      </button>
    </div>
  );
}

function ActiveFilterChip({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <span className="active-filter-chip" role="listitem">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
      >
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path
            d="M3 3l6 6M9 3l-6 6"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </span>
  );
}

function FilterDrawer({
  open,
  onClose,
  category,
  setCategory,
  onSaleOnly,
  setOnSaleOnly,
  sort,
  setSort,
  resultCount,
  onReset,
}: {
  open: boolean;
  onClose: () => void;
  category: "all" | Category;
  setCategory: (c: "all" | Category) => void;
  onSaleOnly: boolean;
  setOnSaleOnly: (v: boolean) => void;
  sort: SortKey;
  setSort: (s: SortKey) => void;
  resultCount: number;
  onReset: () => void;
}) {
  // Lock body scroll while open + close on Escape.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <>
      <div
        className={`filter-backdrop ${open ? "is-open" : ""}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="filter-drawer"
        className={`filter-drawer ${open ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Catalog filters"
        {...(!open ? { inert: "" } : {})}
      >
        <header className="filter-drawer-head">
          <span className="eyebrow">Filters</span>
          <button
            type="button"
            className="filter-drawer-close"
            onClick={onClose}
            aria-label="Close filters"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <div className="filter-drawer-body">
          <fieldset className="filter-group">
            <legend className="filter-group-title">Category</legend>
            <div className="filter-options">
              {CATEGORY_FILTERS.map((opt) => (
                <label key={opt.value} className="filter-radio">
                  <input
                    type="radio"
                    name="category"
                    value={opt.value}
                    checked={category === opt.value}
                    onChange={() => setCategory(opt.value)}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group">
            <legend className="filter-group-title">Show</legend>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={onSaleOnly}
                onChange={(e) => setOnSaleOnly(e.target.checked)}
              />
              <span>On sale only</span>
            </label>
          </fieldset>

          <fieldset className="filter-group">
            <legend className="filter-group-title">Sort by</legend>
            <div className="filter-options">
              {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
                <label key={key} className="filter-radio">
                  <input
                    type="radio"
                    name="sort"
                    value={key}
                    checked={sort === key}
                    onChange={() => setSort(key)}
                  />
                  <span>{SORT_LABELS[key]}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <footer className="filter-drawer-foot">
          <button
            type="button"
            className="filter-reset-link"
            onClick={onReset}
          >
            Reset
          </button>
          <button
            type="button"
            className="btn btn-primary filter-apply-btn"
            onClick={onClose}
          >
            Show {resultCount} {resultCount === 1 ? "result" : "results"}
          </button>
        </footer>
      </aside>
    </>
  );
}

function FinalCta() {
  return (
    <section className="final-cta">
      <div className="container">
        <span className="eyebrow">Pick a side</span>
        <h2 className="final-cta-title">
          The score updates the moment your order goes through.
        </h2>
        <p className="final-cta-sub">
          Pet products that actually work, on a leaderboard that actually
          matters. Cat side or dog side. Start wherever your household stands.
        </p>
        <Link to="/#catalog" className="btn btn-primary final-cta-btn">
          Shop the catalog
        </Link>
      </div>
    </section>
  );
}
