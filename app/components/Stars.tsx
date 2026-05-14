/**
 * Compact star rating display. Filled stars + half-star precision.
 * Pure CSS, no SVG round-trip per star (fast in product grids).
 */
export function Stars({
  rating,
  size = "md",
  showValue = false,
  ariaLabel,
}: {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
  ariaLabel?: string;
}) {
  const pct = Math.max(0, Math.min(5, rating)) / 5;
  const label = ariaLabel ?? `${rating.toFixed(1)} out of 5 stars`;
  const sizeClass =
    size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-base";

  return (
    <span
      role="img"
      aria-label={label}
      className={`stars-row inline-flex items-center ${sizeClass}`}
    >
      <span className="stars-base">★★★★★</span>
      <span className="stars-fill" style={{ width: `${pct * 100}%` }}>
        ★★★★★
      </span>
      {showValue && (
        <span className="ml-2 text-[var(--color-ink-soft)] text-sm" aria-hidden>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
