import { Stars } from "./Stars";
import type { Review } from "~/data/reviews";
import "./ReviewList.css";

export function ReviewList({ reviews }: { reviews: Review[] }) {
  if (reviews.length === 0) {
    return (
      <p className="reviews-empty">
        No reviews yet. Be the first.
      </p>
    );
  }

  return (
    <ul className="reviews">
      {reviews.map((r) => (
        <li key={r.id} className="review">
          <header className="review-head">
            <Stars rating={r.rating} size="sm" />
            <h3 className="review-title">{r.title}</h3>
          </header>
          <p className="review-body">{r.body}</p>
          <footer className="review-meta">
            <span className="review-author">
              {r.author}
              {r.location ? <span className="review-location">{` · ${r.location}`}</span> : null}
            </span>
            <span className="review-dot" aria-hidden="true">·</span>
            <time dateTime={r.date} className="review-date">
              {new Date(r.date).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              })}
            </time>
            {r.verified && (
              <>
                <span className="review-dot" aria-hidden="true">·</span>
                <span className="review-verified">Verified buyer</span>
              </>
            )}
          </footer>
        </li>
      ))}
    </ul>
  );
}
