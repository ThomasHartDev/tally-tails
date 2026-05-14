import { Link } from "react-router";
import type { Product } from "~/data/products";
import { getReviewSummary } from "~/data/reviews";
import { useCart } from "~/lib/cart-context";
import { metaPixel, klaviyoEvents } from "~/lib/analytics";
import { Stars } from "./Stars";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  /** First-in-viewport card sets this so the LCP image fetches eagerly. */
  priority?: boolean;
}) {
  const img = product.images[0];
  const summary = getReviewSummary(product.handle);
  const { addItem } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, 1);
    metaPixel.addToCart(product, 1);
    klaviyoEvents.addedToCart(product, 1);
  };

  const tribeClass =
    product.category === "cat"
      ? "tribe-cat"
      : product.category === "dog"
        ? "tribe-dog"
        : "";

  const tribeLabel =
    product.category === "cat"
      ? "Cat side"
      : product.category === "dog"
        ? "Dog side"
        : "Bundle";

  const tribeStripeColor =
    product.category === "cat"
      ? "bg-[var(--color-cat)]"
      : product.category === "dog"
        ? "bg-[var(--color-dog)]"
        : "bg-[var(--color-ink)]";

  return (
    <Link
      to={`/shop/${product.handle}`}
      className={`group block ${tribeClass}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[var(--color-surface)] border border-[var(--color-line)] aspect-square">
        {img && (
          <img
            src={img.url}
            alt={img.alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            width="800"
            height="800"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {/* Tribe stripe + label, top-left */}
        <span className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[var(--color-bg)]/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]`}>
          <span className={`h-2 w-2 rounded-full ${tribeStripeColor}`} aria-hidden />
          {tribeLabel}
        </span>
        {product.onSale && (
          <span className="absolute right-3 top-3 rounded-full bg-[var(--color-ink)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-bg)]">
            Sale
          </span>
        )}
        <button
          type="button"
          onClick={handleQuickAdd}
          aria-label={`Add ${product.title} to cart`}
          className="absolute bottom-3 left-3 right-3 inline-flex translate-y-2 items-center justify-center gap-2 rounded-full bg-[var(--color-accent)] px-4 py-2.5 text-sm font-semibold text-[var(--color-accent-ink)] opacity-0 shadow-lg transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          Add {product.category !== "bundles" ? `+1 ${product.category} side` : "to cart"}
        </button>
      </div>
      <div className="mt-3 px-1">
        <h3 className="font-display text-base font-semibold leading-snug text-[var(--color-ink)] line-clamp-2">
          {product.title}
        </h3>
        {summary.count > 0 && (
          <div className="mt-1 flex items-center gap-2">
            <Stars rating={summary.avg} size="sm" />
            <span className="text-xs text-[var(--color-ink-mute)]">
              ({summary.count})
            </span>
          </div>
        )}
        <p className="mt-1.5 flex items-baseline gap-2 text-sm font-semibold tabular-nums text-[var(--color-ink)]">
          {product.compareAtPrice && (
            <span className="text-xs font-normal text-[var(--color-ink-mute)] line-through">
              ${Number(product.compareAtPrice.amount).toFixed(2)}
            </span>
          )}
          <span>${Number(product.price.amount).toFixed(2)}</span>
        </p>
      </div>
    </Link>
  );
}
