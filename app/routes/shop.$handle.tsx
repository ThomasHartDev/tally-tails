import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { getProduct } from "~/lib/shopify";
import { getReviews, type Review } from "~/data/reviews";
import { loadUserReviews } from "~/lib/user-reviews";
import { metaPixel, klaviyoEvents } from "~/lib/analytics";
import { Stars } from "~/components/Stars";
import { ReviewList } from "~/components/ReviewList";
import { ReviewForm } from "~/components/ReviewForm";
import { useCart } from "~/lib/cart-context";
import { brand } from "~/brand";
import { breadcrumbList, useJsonLd, useSeo } from "~/lib/seo";

export async function loader({ context, params }: LoaderFunctionArgs) {
  const product = await getProduct(
    context.storefront,
    context.env.PUBLIC_STORE_DOMAIN,
    params.handle!,
  );
  if (!product) throw new Response("Not Found", { status: 404 });
  return { product };
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.product) return [{ title: `Not Found | ${brand.name}` }];
  const { product } = data;
  const title = `${product.title} | ${brand.name}`;
  const description = product.description.slice(0, 160);
  const url = `${brand.baseUrl}/shop/${product.handle}`;
  const img = product.images[0];
  const imgUrl = img?.url ?? brand.ogImage;
  const image = /^https?:\/\//i.test(imgUrl) ? imgUrl : `${brand.baseUrl}${imgUrl}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: "product" },
    { property: "og:image", content: image },
    { property: "og:site_name", content: brand.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export default function ProductPage() {
  const { product } = useLoaderData<typeof loader>();
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  const img = product.images[0];
  const staticReviews = getReviews(product.handle);
  const [userReviews, setUserReviews] = useState<Review[]>([]);
  useEffect(() => {
    setUserReviews(loadUserReviews(product.handle));
  }, [product.handle]);
  useEffect(() => {
    metaPixel.viewContent(product);
    klaviyoEvents.viewedProduct(product);
  }, [product]);

  // Flip the page palette to the product's tribe while the PDP is open.
  useEffect(() => {
    if (typeof document === "undefined") return;
    const tribe =
      product.category === "cat" || product.category === "dog"
        ? product.category
        : "neutral";
    document.documentElement.setAttribute("data-tribe", tribe);
    return () => {
      document.documentElement.setAttribute("data-tribe", "neutral");
    };
  }, [product.category]);

  const reviews = useMemo(
    () => [...userReviews, ...staticReviews],
    [userReviews, staticReviews],
  );
  const summary = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / reviews.length, count: reviews.length };
  }, [reviews]);
  const staticSummary = useMemo(() => {
    if (staticReviews.length === 0) return { avg: 0, count: 0 };
    const sum = staticReviews.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / staticReviews.length, count: staticReviews.length };
  }, [staticReviews]);

  useSeo({
    title: product.title,
    description: product.description.slice(0, 160),
    path: `/shop/${product.handle}`,
    type: "product",
    image: img?.url,
  });

  useJsonLd("product", {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    sku: product.handle,
    brand: { "@type": "Brand", name: product.vendor },
    image: img
      ? /^https?:\/\//i.test(img.url)
        ? img.url
        : `${brand.baseUrl}${img.url}`
      : undefined,
    offers: {
      "@type": "Offer",
      price: product.price.amount,
      priceCurrency: product.price.currencyCode,
      availability: "https://schema.org/InStock",
      url: `${brand.baseUrl}/shop/${product.handle}`,
    },
    ...(staticSummary.count > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: staticSummary.avg.toFixed(1),
        reviewCount: staticSummary.count,
      },
      review: staticReviews.slice(0, 5).map((r) => ({
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: r.rating },
        author: { "@type": "Person", name: r.author },
        datePublished: r.date,
        name: r.title,
        reviewBody: r.body,
      })),
    }),
  });

  useJsonLd(
    "breadcrumbs",
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Catalog", path: "/#catalog" },
      { name: product.title, path: `/shop/${product.handle}` },
    ]),
  );

  const tribeLabel =
    product.category === "cat"
      ? "Cat side"
      : product.category === "dog"
        ? "Dog side"
        : "Bundle";
  const tribeAccent =
    product.category === "cat"
      ? "text-[var(--color-cat)]"
      : product.category === "dog"
        ? "text-[var(--color-dog)]"
        : "text-[var(--color-ink)]";

  const specs = product.specs;
  const detailsParagraphs = product.details ?? [product.description];
  const priceLabel = Number(product.price.amount).toFixed(2);
  const compareLabel = product.compareAtPrice
    ? Number(product.compareAtPrice.amount).toFixed(2)
    : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8 md:py-12">
      {/* Breadcrumb */}
      <nav className="mb-6 text-xs text-[var(--color-ink-mute)]" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link to="/" className="hover:text-[var(--color-ink)]">Home</Link>
          </li>
          <li aria-hidden>›</li>
          <li>
            <Link
              to={
                product.category === "cat" || product.category === "dog"
                  ? `/?side=${product.category}#catalog`
                  : "/#catalog"
              }
              className="hover:text-[var(--color-ink)]"
            >
              {tribeLabel}
            </Link>
          </li>
          <li aria-hidden>›</li>
          <li className="truncate text-[var(--color-ink)]">{product.title}</li>
        </ol>
      </nav>

      <div className="grid gap-8 md:grid-cols-2 md:gap-12">
        <div className="overflow-hidden rounded-3xl bg-[var(--color-surface-2)]">
          {img && (
            <img
              src={img.url}
              alt={img.alt}
              fetchPriority="high"
              decoding="async"
              width="1200"
              height="1200"
              className="h-full w-full object-cover"
            />
          )}
        </div>

        <div className="flex flex-col">
          <span
            className={`text-xs font-semibold uppercase tracking-[0.18em] ${tribeAccent}`}
          >
            {tribeLabel} · {product.vendor}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)] md:text-4xl">
            {product.title}
          </h1>

          {summary.count > 0 && (
            <a
              href="#reviews"
              className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
            >
              <Stars rating={summary.avg} size="sm" />
              <span>
                {summary.avg.toFixed(1)} · {summary.count}{" "}
                {summary.count === 1 ? "review" : "reviews"}
              </span>
            </a>
          )}

          <p className="mt-4 flex items-baseline gap-3 font-display text-3xl font-bold tabular-nums text-[var(--color-ink)]">
            ${priceLabel}
            {compareLabel && (
              <span className="text-base font-normal text-[var(--color-ink-mute)] line-through">
                ${compareLabel}
              </span>
            )}
          </p>

          <p className="mt-4 max-w-prose text-base leading-relaxed text-[var(--color-ink-soft)]">
            {product.description}
          </p>

          <div className="mt-6 flex items-center gap-3">
            <div className="inline-flex items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] p-1">
              <button
                type="button"
                className="cart-qty-btn"
                onClick={() => setQty(Math.max(1, qty - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span aria-label={`Quantity ${qty}`} className="min-w-[28px] text-center text-sm font-semibold tabular-nums">
                {qty}
              </span>
              <button
                type="button"
                className="cart-qty-btn"
                onClick={() => setQty(qty + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                addItem(product, qty);
                metaPixel.addToCart(product, qty);
                klaviyoEvents.addedToCart(product, qty);
              }}
              className="btn-primary flex-1"
            >
              Add to cart
              {product.category !== "bundles" && (
                <span className="opacity-80">
                  · +{qty} {product.category} side
                </span>
              )}
            </button>
          </div>

          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-[var(--color-ink-soft)]">
            <li>Ships in 48 hours</li>
            <li>Free returns over $50</li>
            <li>US warehouse</li>
          </ul>

          <p className="mt-6 text-xs text-[var(--color-ink-mute)]">
            Portfolio demo. Add-to-cart and checkout work end to end, no live
            payment is captured.
          </p>
        </div>
      </div>

      <div className="mt-16 grid gap-10 md:grid-cols-3">
        <section
          aria-labelledby="pdp-description-heading"
          className="md:col-span-2"
        >
          <h2
            id="pdp-description-heading"
            className="font-display text-xl font-semibold text-[var(--color-ink)]"
          >
            Description
          </h2>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            {detailsParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {specs && (
          <section
            aria-labelledby="pdp-specs-heading"
            className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
          >
            <h2
              id="pdp-specs-heading"
              className="font-display text-base font-semibold text-[var(--color-ink)]"
            >
              Dimensions &amp; specs
            </h2>
            <dl className="mt-3 space-y-3 text-sm">
              {(
                [
                  ["Dimensions", specs.dimensions],
                  ["Weight", specs.weight],
                  ["Materials", specs.materials],
                  ["Intended for", specs.intendedFor],
                  ["Features", specs.features],
                  ["Origin", specs.origin],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-mute)]">
                    {k}
                  </dt>
                  <dd className="text-[var(--color-ink)]">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}
      </div>

      <section id="reviews" className="mt-20 scroll-mt-20">
        <header className="mb-8 max-w-prose">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
            What buyers said
          </span>
          {summary.count > 0 ? (
            <>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)]">
                {summary.avg.toFixed(1)}
                <span className="text-base font-normal text-[var(--color-ink-mute)]"> out of 5</span>
              </h2>
              <div className="mt-2"><Stars rating={summary.avg} size="lg" /></div>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Based on {summary.count}{" "}
                {summary.count === 1 ? "review" : "reviews"}.
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-1 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)]">
                No reviews yet
              </h2>
              <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
                Be the first to share how this one worked for you.
              </p>
            </>
          )}
        </header>
        <div>
          <ReviewList reviews={reviews} />
          <ReviewForm
            handle={product.handle}
            onSubmitted={(r) => setUserReviews((prev) => [r, ...prev])}
          />
        </div>
      </section>
    </div>
  );
}
