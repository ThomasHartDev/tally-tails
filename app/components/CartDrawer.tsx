import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { useCart } from "~/lib/cart-context";
import { metaPixel } from "~/lib/analytics";
import { CartProgressBar } from "./CartProgressBar";
import "./CartDrawer.css";

export function CartDrawer() {
  const cart = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (cart.isOpen) closeRef.current?.focus();
  }, [cart.isOpen]);

  return (
    <>
      <div
        className={`cart-backdrop ${cart.isOpen ? "is-open" : ""}`}
        onClick={cart.close}
        aria-hidden={!cart.isOpen}
      />
      <aside
        className={`cart-drawer ${cart.isOpen ? "is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        {...(!cart.isOpen ? { inert: "" } : {})}
      >
        <header className="cart-drawer-head">
          <span className="cart-drawer-eyebrow">Cart</span>
          <button
            ref={closeRef}
            type="button"
            className="cart-drawer-close"
            onClick={cart.close}
            aria-label="Close cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        <CartView />
      </aside>
    </>
  );
}

function CartView() {
  const cart = useCart();
  if (cart.lines.length === 0) {
    return (
      <div className="cart-drawer-body cart-empty">
        <p className="cart-empty-headline">Nothing in the cart yet.</p>
        <p className="cart-empty-sub">
          Add a jar from the shop and it'll show up here.
        </p>
      </div>
    );
  }
  return (
    <>
      <CartProgressBar subtotal={cart.subtotal} />
      <ul className="cart-lines">
        {cart.lines.map((line) => (
          <li key={line.handle} className="cart-line">
            <div className="cart-line-image">
              {line.image && <img src={line.image.url} alt={line.image.alt} />}
            </div>
            <div className="cart-line-body">
              <span className="cart-line-vendor">{line.vendor}</span>
              <span className="cart-line-title">{line.title}</span>
              <div className="cart-line-row">
                <div className="cart-qty">
                  <button
                    type="button"
                    onClick={() =>
                      cart.setQuantity(line.handle, line.quantity - 1)
                    }
                    aria-label={`Decrease ${line.title} quantity`}
                  >
                    −
                  </button>
                  <span aria-label={`Quantity ${line.quantity}`}>
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      cart.setQuantity(line.handle, line.quantity + 1)
                    }
                    aria-label={`Increase ${line.title} quantity`}
                  >
                    +
                  </button>
                </div>
                <span className="cart-line-price">
                  ${(line.unitPrice * line.quantity).toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                className="cart-line-remove"
                onClick={() => cart.removeItem(line.handle)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <footer className="cart-drawer-foot">
        <div className="cart-totals">
          <span>Subtotal</span>
          <span>${cart.subtotal.toFixed(2)}</span>
        </div>
        <p className="cart-shipping-note">
          Shipping and taxes calculated at checkout.
        </p>
        <CheckoutButton />
      </footer>
    </>
  );
}

function CheckoutButton() {
  const cart = useCart();
  const fetcher = useFetcher<{ checkoutUrl?: string; error?: string }>();

  // Any line missing a variantId means we're in static-fallback mode and
  // the Shopify cart create will be rejected by the action.
  const missingVariant = cart.lines.some((l) => !l.variantId);
  const empty = cart.lines.length === 0;
  const submitting = fetcher.state === "submitting" || fetcher.state === "loading";
  const disabled = empty || missingVariant || submitting;

  // Redirect to Shopify hosted checkout once the action returns the URL.
  useEffect(() => {
    if (fetcher.data?.checkoutUrl && typeof window !== "undefined") {
      window.location.href = fetcher.data.checkoutUrl;
    }
  }, [fetcher.data]);

  const onClick = () => {
    if (disabled) return;
    metaPixel.initiateCheckout(
      cart.subtotal,
      "USD",
      cart.lines.reduce((n, l) => n + l.quantity, 0),
    );
    // The disabled gate above already excludes lines without a variantId,
    // but TS still sees CartLine.variantId as optional. Filter + cast to
    // give the action a clean payload.
    const lines = cart.lines
      .filter((l): l is typeof l & { variantId: string } => Boolean(l.variantId))
      .map((l) => ({ variantId: l.variantId, quantity: l.quantity }));
    fetcher.submit(
      { lines, subtotal: cart.subtotal },
      {
        method: "post",
        action: "/api/checkout",
        encType: "application/json",
      },
    );
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-primary cart-checkout-btn"
        onClick={onClick}
        disabled={disabled}
      >
        {submitting ? "Preparing checkout…" : "Checkout"}
      </button>
      {missingVariant && !submitting && !fetcher.data?.error && (
        <p className="cart-demo-note">Checkout is not yet configured.</p>
      )}
      {fetcher.data?.error && (
        <p className="cart-demo-note" style={{ color: "#b3261e" }}>
          {fetcher.data.error}
        </p>
      )}
    </>
  );
}
