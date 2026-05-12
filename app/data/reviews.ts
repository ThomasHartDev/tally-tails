/**
 * Placeholder reviews. Real reviews are generated in the catalog-seed pass
 * (action #7 in HANDOFF.md). Empty for now so the PDP rating block hides
 * cleanly via the count > 0 check.
 */

export type Review = {
  id: string;
  author: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  date: string;
  title: string;
  body: string;
  verified: boolean;
};

export const REVIEWS: Record<string, Review[]> = {};

export function getReviews(handle: string): Review[] {
  return REVIEWS[handle] ?? [];
}

export function getReviewSummary(handle: string): { avg: number; count: number } {
  const list = getReviews(handle);
  if (list.length === 0) return { avg: 0, count: 0 };
  const total = list.reduce((sum, r) => sum + r.rating, 0);
  return { avg: total / list.length, count: list.length };
}
