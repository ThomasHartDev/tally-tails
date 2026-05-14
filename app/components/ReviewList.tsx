import { Stars } from "./Stars";
import type { Review } from "~/data/reviews";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-[var(--color-line)] p-8 text-center text-sm text-[var(--color-ink-soft)]">
        No reviews yet. Be the first.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--color-line)]">
      {reviews.map((r) => (
        <li key={r.id} className="py-6 first:pt-0">
          <header className="flex items-center gap-3">
            <Stars rating={r.rating} size="sm" />
            <h3 className="font-display text-base font-semibold text-[var(--color-ink)]">
              {r.title}
            </h3>
          </header>
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            {r.body}
          </p>
          <footer className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-ink-mute)]">
            <span className="font-semibold text-[var(--color-ink)]">{r.author}</span>
            {r.location && <span>· {r.location}</span>}
            <span aria-hidden>·</span>
            <time dateTime={r.date}>
              {new Date(r.date).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </time>
            {r.verified && (
              <>
                <span aria-hidden>·</span>
                <span className="rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                  Verified buyer
                </span>
              </>
            )}
          </footer>
        </li>
      ))}
    </ul>
  );
}
