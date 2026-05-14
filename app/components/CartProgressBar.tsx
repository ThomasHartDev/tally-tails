import { CART_TIERS, computeTierProgress } from "~/lib/cart-tiers";

export function CartProgressBar({ subtotal }: { subtotal: number }) {
  const { fillPct, current, next, remaining } = computeTierProgress(subtotal);
  const max = CART_TIERS[CART_TIERS.length - 1]!.threshold;

  return (
    <div className="cart-progress" aria-live="polite">
      <p className="cart-progress-callout">
        {next ? (
          <>
            <strong>${remaining.toFixed(2)} away</strong> {next.callout}
          </>
        ) : (
          <strong>All rewards unlocked. Thanks for stacking the cart.</strong>
        )}
      </p>
      <div
        className="cart-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(subtotal, max)}
      >
        <div
          className="cart-progress-fill"
          style={{ width: `${fillPct * 100}%` }}
        />
        {CART_TIERS.map((t) => {
          const left = (t.threshold / max) * 100;
          const reached = subtotal >= t.threshold;
          return (
            <span
              key={t.threshold}
              className={`cart-progress-tick ${reached ? "is-reached" : ""}`}
              style={{ left: `${left}%` }}
              aria-hidden
            />
          );
        })}
      </div>
      <ul className="cart-progress-tiers">
        {CART_TIERS.map((t) => {
          const reached = subtotal >= t.threshold;
          const isCurrent = current?.threshold === t.threshold;
          return (
            <li
              key={t.threshold}
              className={`cart-progress-tier ${reached ? "is-reached" : ""} ${
                isCurrent ? "is-current" : ""
              }`}
            >
              <span className="cart-progress-tier-amount">${t.threshold}</span>
              <span className="cart-progress-tier-label">{t.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
