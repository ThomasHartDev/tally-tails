import "./Stars.css";

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
  return (
    <span className={`stars stars-${size}`} role="img" aria-label={label}>
      <span className="stars-track" aria-hidden="true">★★★★★</span>
      <span
        className="stars-fill"
        aria-hidden="true"
        style={{ width: `${pct * 100}%` }}
      >
        ★★★★★
      </span>
      {showValue && (
        <span className="stars-value" aria-hidden="true">
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  );
}
