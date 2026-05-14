import { CART_TIERS, computeTierProgress } from "~/lib/cart-tiers";

export function CartProgressBar({ subtotal }: { subtotal: number }) {
  const { fillPct, current, next, remaining } = computeTierProgress(subtotal);
  const max = CART_TIERS[CART_TIERS.length - 1]!.threshold;

  return (
    <div className="px-5 py-4 border-b border-[var(--color-line)]" aria-live="polite">
      <p className="text-xs text-[var(--color-ink-soft)] mb-2">
        {next ? (
          <>
            <strong className="text-[var(--color-ink)] font-semibold">${remaining.toFixed(2)} away</strong>{" "}
            {next.callout}
          </>
        ) : (
          <strong className="text-[var(--color-ink)] font-semibold">
            All rewards unlocked. Thanks for stacking the cart.
          </strong>
        )}
      </p>
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={Math.min(subtotal, max)}
      >
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[var(--color-accent)] transition-[width] duration-300"
          style={{ width: `${fillPct * 100}%` }}
        />
        {CART_TIERS.map((t) => {
          const left = (t.threshold / max) * 100;
          const reached = subtotal >= t.threshold;
          return (
            <span
              key={t.threshold}
              className={`absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                reached
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)]"
                  : "border-[var(--color-line)] bg-[var(--color-surface)]"
              }`}
              style={{ left: `${left}%` }}
              aria-hidden
            />
          );
        })}
      </div>
      <ul className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.1em] text-[var(--color-ink-mute)]">
        {CART_TIERS.map((t) => {
          const reached = subtotal >= t.threshold;
          const isCurrent = current?.threshold === t.threshold;
          return (
            <li
              key={t.threshold}
              className={`flex flex-col items-center ${
                reached || isCurrent ? "text-[var(--color-ink)]" : ""
              }`}
            >
              <span className="font-semibold tabular-nums">${t.threshold}</span>
              <span className="mt-0.5">{t.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
