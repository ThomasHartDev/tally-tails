/**
 * Live cat-vs-dog leaderboard score.
 *
 * Hard-coded for now. Action #8 in HANDOFF.md is to build the real
 * backend (Shopify metafield or Upstash KV, with a Shopify webhook on
 * orders/paid bumping the counter). Once that lands the homepage and
 * Header loaders will fetch and pass it through to these helpers
 * instead of the static constant below.
 *
 * Don't import this in client-only paths; keep the SSR loader as the
 * source of truth eventually.
 */

export type Tally = {
  cat: number;
  dog: number;
};

// Placeholder weekly snapshot. Replace with the real loader value when
// the leaderboard backend ships.
export const TALLY: Tally = {
  cat: 4217,
  dog: 3891,
};

export function tallyDelta(t: Tally): { leader: "cat" | "dog" | "tie"; diff: number } {
  if (t.cat > t.dog) return { leader: "cat", diff: t.cat - t.dog };
  if (t.dog > t.cat) return { leader: "dog", diff: t.dog - t.cat };
  return { leader: "tie", diff: 0 };
}

export function tallyTotal(t: Tally): number {
  return t.cat + t.dog;
}
