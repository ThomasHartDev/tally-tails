import { Link } from "react-router";
import type { Product } from "~/data/products";
import { getReviewSummary } from "~/data/reviews";
import { useCart } from "~/lib/cart-context";
import { metaPixel, klaviyoEvents } from "~/lib/analytics";
import { Stars } from "./Stars";

/** Trim a long product description down to its first sentence for the
 * card view. Keeps the same brand voice we already wrote in the catalog
 * seed without needing a separate tagline field on the Product type. */
function shortTagline(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();
  const stop = trimmed.search(/[.!?](\s|$)/);
  if (stop === -1) return trimmed.length > 80 ? trimmed.slice(0, 80).trim() + "…" : trimmed;
  return trimmed.slice(0, stop + 1);
}

const TYPE_LABELS: Record<string, string> = {
  bed: "BED",
  toy: "TOY",
  fountain: "FOUNTAIN",
  feeder: "FEEDER",
  harness: "HARNESS",
  collar: "COLLAR",
  grooming: "GROOMING",
  travel: "TRAVEL",
  apparel: "APPAREL",
  litter: "LITTER",
  perch: "PERCH",
  furniture: "FURNITURE",
  training: "TRAINING",
};

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  /** First-in-viewport card eager-loads its image. */
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

  // Tinted backdrop on the image area — pale blue for cat, peach for dog,
  // neutral for bundles. The tint is what makes the catalog feel tribal at
  // a glance without dominating the page.
  const tintBg =
    product.category === "cat"
      ? "bg-[var(--color-cat-tint)]"
      : product.category === "dog"
        ? "bg-[var(--color-dog-tint)]"
        : "bg-[var(--color-surface-2)]";

  const tribeBadgeLabel =
    product.category === "cat"
      ? "CAT"
      : product.category === "dog"
        ? "DOG"
        : "BOTH";

  // Optional top-left accent badge. Lovable used "+1 CAT SIDE" and "BEST
  // SELLER" / "STAFF PICK" style chips. Featured products get the +1
  // call-out so the rivalry mechanic shows up at the card level too.
  const accentBadge = product.featured
    ? product.category === "cat"
      ? "+1 CAT SIDE"
      : product.category === "dog"
        ? "+1 DOG SIDE"
        : "STAFF PICK"
    : product.onSale
      ? "SALE"
      : null;

  const typeLabel = TYPE_LABELS[product.productType] ?? product.productType?.toUpperCase() ?? "";

  const tagline = shortTagline(product.description);

  return (
    <Link
      to={`/shop/${product.handle}`}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ink)] rounded-2xl"
    >
      <div className={`relative aspect-square overflow-hidden rounded-2xl ${tintBg}`}>
        {img ? (
          <img
            src={img.url}
            alt={img.alt || product.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            width="800"
            height="800"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-ink-mute)]">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 11.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 11.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM7 16.5c0-2 2.5-3 5-3s5 1 5 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}

        {accentBadge && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-[var(--color-bg)]/95 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-ink)]">
            {accentBadge}
          </span>
        )}

        <span className="absolute right-3 top-3 inline-flex items-center rounded-full bg-[var(--color-ink)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--color-bg)]">
          {tribeBadgeLabel}
        </span>
      </div>

      <div className="mt-3 px-1">
        {typeLabel && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-mute)]">
            {typeLabel}
          </span>
        )}
        <h3 className="mt-0.5 font-display text-[15px] font-bold leading-snug text-[var(--color-ink)] line-clamp-2 md:text-base">
          {product.title}
        </h3>
        {tagline && (
          <p className="mt-1 text-xs leading-snug text-[var(--color-ink-soft)] line-clamp-2">
            {tagline}
          </p>
        )}
        {summary.count > 0 && (
          <div className="mt-1.5 flex items-center gap-1.5">
            <Stars rating={summary.avg} size="sm" />
            <span className="text-[10px] text-[var(--color-ink-mute)]">
              ({summary.count})
            </span>
          </div>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="flex items-baseline gap-1.5 text-sm font-semibold tabular-nums text-[var(--color-ink)]">
            {product.compareAtPrice && (
              <span className="text-[11px] font-normal text-[var(--color-ink-mute)] line-through">
                ${Number(product.compareAtPrice.amount).toFixed(2)}
              </span>
            )}
            <span>${Number(product.price.amount).toFixed(2)}</span>
          </span>
          <button
            type="button"
            onClick={handleQuickAdd}
            aria-label={`Add ${product.title} to cart`}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--color-ink)] px-3 py-1.5 text-xs font-semibold text-[var(--color-bg)] transition hover:bg-[var(--color-ink-soft)]"
          >
            Add
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
}
