import { useEffect, useRef } from "react";
import { useFetcher } from "react-router";
import { useCart } from "~/lib/cart-context";
import { metaPixel } from "~/lib/analytics";
import { CartProgressBar } from "./CartProgressBar";

export function CartDrawer() {
  const cart = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (cart.isOpen) closeRef.current?.focus();
  }, [cart.isOpen]);

  return (
    <>
      <div
        onClick={cart.close}
        aria-hidden={!cart.isOpen}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity ${
          cart.isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Cart"
        {...(!cart.isOpen ? { inert: "" } : {})}
        className={`fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-md flex-col bg-[var(--color-bg)] shadow-2xl transition-transform duration-300 ${
          cart.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-[var(--color-line)] px-5 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-soft)]">
            Cart
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={cart.close}
            aria-label="Close cart"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
        <img
          src="/brand/mascots/cat-sulking.webp"
          alt=""
          width="160"
          height="160"
          className="mb-6 h-40 w-40 opacity-90"
        />
        <p className="font-display text-xl font-semibold text-[var(--color-ink)]">
          Nothing in the cart yet.
        </p>
        <p className="mt-2 max-w-xs text-sm text-[var(--color-ink-soft)]">
          Pick a side. Cat or dog. Either way the tally tips a notch.
        </p>
      </div>
    );
  }
  return (
    <>
      <CartProgressBar subtotal={cart.subtotal} />
      <ul className="flex-1 divide-y divide-[var(--color-line)] overflow-y-auto px-5">
        {cart.lines.map((line) => (
          <li key={line.handle} className="flex gap-4 py-4">
            <div className="h-20 w-20 flex-none overflow-hidden rounded-md bg-[var(--color-surface-2)]">
              {line.image && (
                <img
                  src={line.image.url}
                  alt={line.image.alt}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-mute)]">
                {line.vendor}
              </span>
              <span className="truncate font-display text-sm font-semibold text-[var(--color-ink)]">
                {line.title}
              </span>
              <div className="mt-2 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-line)] px-1 py-0.5">
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => cart.setQuantity(line.handle, line.quantity - 1)}
                    aria-label={`Decrease ${line.title} quantity`}
                  >
                    −
                  </button>
                  <span aria-label={`Quantity ${line.quantity}`} className="min-w-[20px] text-center text-sm tabular-nums">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    className="cart-qty-btn"
                    onClick={() => cart.setQuantity(line.handle, line.quantity + 1)}
                    aria-label={`Increase ${line.title} quantity`}
                  >
                    +
                  </button>
                </div>
                <span className="font-display text-sm font-semibold tabular-nums text-[var(--color-ink)]">
                  ${(line.unitPrice * line.quantity).toFixed(2)}
                </span>
              </div>
              <button
                type="button"
                onClick={() => cart.removeItem(line.handle)}
                className="mt-1.5 self-start text-xs text-[var(--color-ink-mute)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline"
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
      <footer className="border-t border-[var(--color-line)] px-5 py-5">
        <div className="flex items-baseline justify-between font-display text-lg font-semibold text-[var(--color-ink)]">
          <span>Subtotal</span>
          <span className="tabular-nums">${cart.subtotal.toFixed(2)}</span>
        </div>
        <p className="mt-1 text-xs text-[var(--color-ink-mute)]">
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

  const missingVariant = cart.lines.some((l) => !l.variantId);
  const empty = cart.lines.length === 0;
  const submitting = fetcher.state === "submitting" || fetcher.state === "loading";
  const disabled = empty || missingVariant || submitting;

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
        onClick={onClick}
        disabled={disabled}
        className="btn-primary mt-3 w-full"
      >
        {submitting ? "Preparing checkout…" : "Checkout"}
      </button>
      {missingVariant && !submitting && !fetcher.data?.error && (
        <p className="mt-2 text-xs text-[var(--color-ink-mute)]">
          Checkout is not yet configured.
        </p>
      )}
      {fetcher.data?.error && (
        <p className="mt-2 text-xs text-[#b3261e]">{fetcher.data.error}</p>
      )}
    </>
  );
}
