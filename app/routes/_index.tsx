import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, useSearchParams } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { listProducts } from "~/lib/shopify";
import { type Category } from "~/data/products";
import { ProductCard } from "~/components/ProductCard";
import { brand } from "~/brand";
import { useJsonLd, useSeo } from "~/lib/seo";

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

type FilterKey = "all" | Category;

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
    logo: `${brand.baseUrl}/brand/favicon.webp`,
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
  });

  return <CatalogPage products={products} />;
}

function CatalogPage({ products }: { products: Awaited<ReturnType<typeof listProducts>> }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sideParam = searchParams.get("side");
  const initial: FilterKey =
    sideParam === "cat" || sideParam === "dog" || sideParam === "bundles"
      ? (sideParam as Category)
      : "all";
  const [filter, setFilter] = useState<FilterKey>(initial);

  // Sync URL → state when the param changes (hero CTAs from elsewhere on
  // the site still set ?side=).
  useEffect(() => {
    if (sideParam === "cat" || sideParam === "dog" || sideParam === "bundles") {
      setFilter(sideParam as Category);
    }
  }, [sideParam]);

  const visible = useMemo(() => {
    if (filter === "all") return products;
    return products.filter((p) => p.category === filter);
  }, [products, filter]);

  const setAndSync = (next: FilterKey) => {
    setFilter(next);
    if (next === "all") {
      // Clear the side param but keep any other params.
      const params = new URLSearchParams(searchParams);
      params.delete("side");
      setSearchParams(params, { replace: true, preventScrollReset: true });
    } else {
      const params = new URLSearchParams(searchParams);
      params.set("side", next);
      setSearchParams(params, { replace: true, preventScrollReset: true });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 pb-24 md:px-8 md:pt-12 md:pb-32">
      <header className="mb-6 md:mb-10">
        <h1 className="font-display text-3xl font-bold leading-tight tracking-[-0.04em] text-[var(--color-ink)] md:text-4xl lg:text-5xl">
          The good stuff for cats and dogs.
        </h1>
      </header>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-[var(--color-line)] pb-4 md:mb-10">
        <div className="flex flex-wrap items-center gap-2">
          <FilterChip
            label="All"
            active={filter === "all"}
            onClick={() => setAndSync("all")}
            tone="ink"
          />
          <FilterChip
            label="Cat"
            active={filter === "cat"}
            onClick={() => setAndSync("cat")}
            tone="cat"
          />
          <FilterChip
            label="Dog"
            active={filter === "dog"}
            onClick={() => setAndSync("dog")}
            tone="dog"
          />
          <FilterChip
            label="Bundles"
            active={filter === "bundles"}
            onClick={() => setAndSync("bundles")}
            tone="ink"
          />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-mute)]">
          {visible.length} {visible.length === 1 ? "item" : "items"}
        </span>
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-sm text-[var(--color-ink-soft)]">
          Nothing in this side yet.{" "}
          <button
            type="button"
            onClick={() => setAndSync("all")}
            className="font-semibold underline-offset-2 hover:underline"
          >
            Show all
          </button>
          .
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4 lg:gap-5">
          {visible.map((p, i) => (
            <li key={p.handle}>
              <ProductCard product={p} priority={i < 4} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone: "ink" | "cat" | "dog";
}) {
  // The active state inverts: dark pill on the page bg. Inactive is an
  // outlined chip. Cat / Dog tones tint the active state subtly.
  const activeBg =
    tone === "cat"
      ? "bg-[#1f4a7a] text-[#e1ecf5]"
      : tone === "dog"
        ? "bg-[#a3531f] text-[#f7ddc5]"
        : "bg-[var(--color-ink)] text-[var(--color-bg)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? `inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition ${activeBg}`
          : "inline-flex items-center rounded-full border border-[var(--color-line)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--color-ink)] transition hover:border-[var(--color-ink)]"
      }
    >
      {label}
    </button>
  );
}
