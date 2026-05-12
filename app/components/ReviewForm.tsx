import { useId, useState } from "react";
import { addUserReview, type ReviewDraft } from "~/lib/user-reviews";
import type { Review } from "~/data/reviews";
import "./ReviewForm.css";

export function ReviewForm({
  handle,
  onSubmitted,
}: {
  handle: string;
  onSubmitted: (review: Review) => void;
}) {
  const baseId = useId();
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [author, setAuthor] = useState("");
  const [location, setLocation] = useState("");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setRating(5);
    setAuthor("");
    setLocation("");
    setTitle("");
    setBody("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const draft: ReviewDraft = {
      author: author.trim(),
      location: location.trim() || undefined,
      rating,
      title: title.trim(),
      body: body.trim(),
    };

    if (!draft.author || !draft.title || !draft.body) {
      setError("Name, title, and review body are required.");
      return;
    }
    if (draft.body.length < 20) {
      setError("Reviews need at least 20 characters of detail.");
      return;
    }

    setStatus("submitting");
    try {
      const saved = addUserReview(handle, draft);
      onSubmitted(saved);
      reset();
      setStatus("done");
      window.setTimeout(() => setStatus("idle"), 2400);
    } catch {
      setStatus("idle");
      setError("Couldn't save the review. Try again.");
    }
  };

  const ratingShown = hoverRating ?? rating;

  return (
    <form className="review-form" onSubmit={handleSubmit} noValidate>
      <h3 className="review-form-title">Write a review</h3>

      <div className="review-form-field">
        <span className="review-form-label">Rating</span>
        <div
          className="review-form-rating"
          role="radiogroup"
          aria-label="Rating"
          onMouseLeave={() => setHoverRating(null)}
        >
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
              className={`review-form-star ${ratingShown >= n ? "is-filled" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onFocus={() => setHoverRating(n)}
              onBlur={() => setHoverRating(null)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="review-form-row">
        <label className="review-form-field">
          <span className="review-form-label">Name</span>
          <input
            id={`${baseId}-author`}
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="First name L."
            autoComplete="name"
            required
          />
        </label>
        <label className="review-form-field">
          <span className="review-form-label">Location (optional)</span>
          <input
            id={`${baseId}-location`}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, ST"
          />
        </label>
      </div>

      <label className="review-form-field">
        <span className="review-form-label">Title</span>
        <input
          id={`${baseId}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What stood out"
          maxLength={80}
          required
        />
      </label>

      <label className="review-form-field">
        <span className="review-form-label">Review</span>
        <textarea
          id={`${baseId}-body`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How did it work for you? What surprised you?"
          rows={4}
          maxLength={1200}
          required
        />
      </label>

      {error && <p className="review-form-error" role="alert">{error}</p>}

      <div className="review-form-actions">
        <button
          type="submit"
          className="btn btn-primary"
          disabled={status === "submitting"}
        >
          {status === "submitting" ? "Posting…" : "Post review"}
        </button>
        {status === "done" && (
          <span className="review-form-success">Thanks. Your review is live.</span>
        )}
      </div>

      <p className="review-form-note">
        Reviews are saved locally on this device. Portfolio demo, no server
        moderation.
      </p>
    </form>
  );
}
