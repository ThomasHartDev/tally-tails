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
  // Shopify CDN URLs are already absolute. Only prefix the brand origin for
  // the static fallback paths.
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
  // Load user-submitted reviews after hydration. Doing this in an effect
  // keeps SSR output stable (no hydration mismatch from localStorage).
  useEffect(() => {
    setUserReviews(loadUserReviews(product.handle));
  }, [product.handle]);
  // Fire view-product analytics once per PDP.
  useEffect(() => {
    metaPixel.viewContent(product);
    klaviyoEvents.viewedProduct(product);
  }, [product]);
  const reviews = useMemo(
    () => [...userReviews, ...staticReviews],
    [userReviews, staticReviews],
  );
  const summary = useMemo(() => {
    if (reviews.length === 0) return { avg: 0, count: 0 };
    const sum = reviews.reduce((s, r) => s + r.rating, 0);
    return { avg: sum / reviews.length, count: reviews.length };
  }, [reviews]);
  // JSON-LD uses static reviews only. Including localStorage entries would
  // poison schema.org aggregateRating with unverified data.
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
    ])
  );

  // Shopify-sourced products don't carry the static spec schema. Only show
  // the dimensions table for static products that explicitly include it.
  // Same idea for the long-form prose paragraphs.
  const specs = product.specs;
  const detailsParagraphs = product.details ?? [product.description];
  const priceLabel = Number(product.price.amount).toFixed(2);
  const compareLabel = product.compareAtPrice
    ? Number(product.compareAtPrice.amount).toFixed(2)
    : null;

  return (
    <div className="pdp container">
      <div className="pdp-grid">
        <div className="pdp-image">
          {img && (
            <img
              src={img.url}
              alt={img.alt}
              fetchPriority="high"
              decoding="async"
              width="1200"
              height="1500"
            />
          )}
        </div>

        <div className="pdp-info">
          <span className="eyebrow">{product.vendor}</span>
          <h1 className="pdp-title">{product.title}</h1>
          {summary.count > 0 && (
            <a href="#reviews" className="pdp-rating">
              <Stars rating={summary.avg} size="sm" />
              <span className="pdp-rating-text">
                {summary.avg.toFixed(1)} · {summary.count} reviews
              </span>
            </a>
          )}
          <p className="pdp-price">
            ${priceLabel}
            {compareLabel && (
              <span className="pdp-price-compare">${compareLabel}</span>
            )}
          </p>
          <p className="pdp-description">{product.description}</p>
          <div className="pdp-qty">
            <button
              type="button"
              onClick={() => setQty(Math.max(1, qty - 1))}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span aria-label={`Quantity ${qty}`}>{qty}</span>
            <button
              type="button"
              onClick={() => setQty(qty + 1)}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <div className="pdp-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                addItem(product, qty);
                metaPixel.addToCart(product, qty);
                klaviyoEvents.addedToCart(product, qty);
              }}
            >
              Add to cart
            </button>
            <Link to="/#catalog" className="btn btn-outline">
              Back to catalog
            </Link>
          </div>
          <p className="pdp-disclaimer">
            Portfolio demo. Add-to-cart and checkout flow are real, no live
            payment is captured.
          </p>
        </div>
      </div>

      <div className="pdp-detail-grid">
        <section
          className="pdp-detail pdp-detail-description"
          aria-labelledby="pdp-description-heading"
        >
          <h2 id="pdp-description-heading" className="pdp-detail-heading">
            Description
          </h2>
          <div className="pdp-detail-body">
            {detailsParagraphs.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </section>

        {specs && (
          <section
            className="pdp-detail pdp-detail-specs"
            aria-labelledby="pdp-specs-heading"
          >
            <h2 id="pdp-specs-heading" className="pdp-detail-heading">
              Dimensions &amp; specs
            </h2>
            <dl className="pdp-specs-list">
              <div className="pdp-spec-row">
                <dt>Dimensions</dt>
                <dd>{specs.dimensions}</dd>
              </div>
              <div className="pdp-spec-row">
                <dt>Weight</dt>
                <dd>{specs.weight}</dd>
              </div>
              <div className="pdp-spec-row pdp-spec-row-wide">
                <dt>Materials</dt>
                <dd>{specs.materials}</dd>
              </div>
              <div className="pdp-spec-row pdp-spec-row-wide">
                <dt>Intended for</dt>
                <dd>{specs.intendedFor}</dd>
              </div>
              <div className="pdp-spec-row pdp-spec-row-wide">
                <dt>Features</dt>
                <dd>{specs.features}</dd>
              </div>
              <div className="pdp-spec-row pdp-spec-row-wide">
                <dt>Origin</dt>
                <dd>{specs.origin}</dd>
              </div>
            </dl>
          </section>
        )}
      </div>

      <section id="reviews" className="pdp-reviews">
        <header className="pdp-reviews-head">
          <span className="eyebrow">What buyers said</span>
          {summary.count > 0 ? (
            <>
              <h2 className="pdp-reviews-title">
                {summary.avg.toFixed(1)}
                <span className="pdp-reviews-out-of"> out of 5</span>
              </h2>
              <Stars rating={summary.avg} size="lg" />
              <p className="pdp-reviews-count">
                Based on {summary.count}{" "}
                {summary.count === 1 ? "review" : "reviews"}
              </p>
            </>
          ) : (
            <>
              <h2 className="pdp-reviews-title">
                No reviews
                <span className="pdp-reviews-out-of"> yet</span>
              </h2>
              <p className="pdp-reviews-count">
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
