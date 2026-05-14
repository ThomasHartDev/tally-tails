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

  return (
    <Link to={`/shop/${product.handle}`} className="product-card">
      <div className="product-card-image">
        {img && (
          <img
            src={img.url}
            alt={img.alt}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            width="800"
            height="1000"
          />
        )}
        {product.onSale && <span className="product-card-tag">Sale</span>}
        <button
          type="button"
          className="product-card-quickadd"
          onClick={handleQuickAdd}
          aria-label={`Add ${product.title} to cart`}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          <span>Add</span>
        </button>
      </div>
      <div className="product-card-body">
        <h3 className="product-card-title">{product.title}</h3>
        {summary.count > 0 && (
          <div className="product-card-rating">
            <Stars rating={summary.avg} size="sm" />
            <span className="product-card-rating-count">({summary.count})</span>
          </div>
        )}
        <p className="product-card-price">
          {product.compareAtPrice && (
            <span className="product-card-compare">
              ${Number(product.compareAtPrice.amount).toFixed(2)}
            </span>
          )}
          <span>${Number(product.price.amount).toFixed(2)}</span>
        </p>
      </div>
    </Link>
  );
}
