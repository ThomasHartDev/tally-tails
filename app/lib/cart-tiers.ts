/**
 * Subtotal-based upsell tiers. Drives the progress bar at the top of the
 * cart drawer. Each tier unlocks when subtotal >= threshold. Order matters
 * List ascending so the bar tracks across them in order.
 */

export type CartTier = {
  /** Subtotal in USD at which this tier unlocks. */
  threshold: number;
  /** Short label rendered in the unlocked-state pill (e.g. "Free shipping"). */
  label: string;
  /** Sentence shown when this is the next tier (e.g. "for free shipping"). */
  callout: string;
  /**
   * Shopify discount code applied automatically when this tier hits. Must
   * exist (or be created via admin) and not be expired. The cart create
   * action attaches the highest-threshold unlocked tier's code so tiers
   * stack in order, not concurrently.
   */
  code: string;
};

export const CART_TIERS: readonly CartTier[] = [
  {
    threshold: 45,
    label: "Free shipping",
    callout: "for free shipping",
    code: "Free Shipping",
  },
  {
    threshold: 75,
    label: "10% off",
    callout: "to unlock 10% off",
    code: "TIER10",
  },
  {
    threshold: 110,
    label: "15% off",
    callout: "to unlock 15% off",
    code: "TIER15",
  },
] as const;

/**
 * Free Shipping plus the single highest % tier the cart has crossed.
 * TIER10 and TIER15 are both Order-class discounts in Shopify, so they
 * don't stack with each other; sending both would just have Shopify
 * silently drop the lower one. Free Shipping is Shipping-class and
 * combines with whichever % tier applies.
 */
export function discountCodesForSubtotal(subtotal: number): string[] {
  const codes: string[] = [];
  const shipping = CART_TIERS[0]!;
  if (subtotal >= shipping.threshold) codes.push(shipping.code);

  const percentTiers = CART_TIERS.slice(1);
  let bestPercent: CartTier | null = null;
  for (const t of percentTiers) {
    if (subtotal >= t.threshold) bestPercent = t;
  }
  if (bestPercent) codes.push(bestPercent.code);

  return codes;
}

export type TierProgress = {
  /** 0-1, where the head of the bar should sit overall. */
  fillPct: number;
  /** Tier the user is currently in (already unlocked). null if none. */
  current: CartTier | null;
  /** Tier the user is working toward. null if all unlocked. */
  next: CartTier | null;
  /** Dollar amount remaining until the next tier. 0 if all unlocked. */
  remaining: number;
};

export function computeTierProgress(subtotal: number): TierProgress {
  const max = CART_TIERS[CART_TIERS.length - 1]!.threshold;
  const fillPct = Math.min(1, subtotal / max);

  let current: CartTier | null = null;
  for (const t of CART_TIERS) {
    if (subtotal >= t.threshold) current = t;
  }

  const next = CART_TIERS.find((t) => subtotal < t.threshold) ?? null;
  const remaining = next ? Math.max(0, next.threshold - subtotal) : 0;

  return { fillPct, current, next, remaining };
}
