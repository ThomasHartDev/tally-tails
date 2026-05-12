import type { Review } from "~/data/reviews";

/**
 * Client-side review store. Persists user-submitted reviews in localStorage,
 * keyed by product handle. Designed as a single-surface helper so swapping
 * to a real backend later is a one-file change.
 */

const STORAGE_KEY = "bh:user-reviews:v1";

type Store = Record<string, Review[]>;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function loadAll(): Store {
  if (!isBrowser()) return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Store;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(store: Store): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // Quota exceeded or storage disabled. Swallow. The review just won't
    // persist on this device, which is the same fail-soft a real backend
    // outage would land at.
  }
}

export function loadUserReviews(handle: string): Review[] {
  return loadAll()[handle] ?? [];
}

export type ReviewDraft = {
  author: string;
  location?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title: string;
  body: string;
};

export function addUserReview(handle: string, draft: ReviewDraft): Review {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? `usr-${crypto.randomUUID()}`
      : `usr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const review: Review = {
    id,
    author: draft.author.trim(),
    location: draft.location?.trim() || undefined,
    rating: draft.rating,
    date: new Date().toISOString().slice(0, 10),
    title: draft.title.trim(),
    body: draft.body.trim(),
    verified: false,
  };
  const store = loadAll();
  store[handle] = [review, ...(store[handle] ?? [])];
  saveAll(store);
  return review;
}
