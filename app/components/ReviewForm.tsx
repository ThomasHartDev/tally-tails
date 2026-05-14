import { useId, useState } from "react";
import { addUserReview, type ReviewDraft } from "~/lib/user-reviews";
import type { Review } from "~/data/reviews";

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

  const inputClass =
    "w-full rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-ink)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/30";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6"
    >
      <h3 className="font-display text-lg font-semibold text-[var(--color-ink)]">
        Write a review
      </h3>

      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          Rating
        </span>
        <div
          role="radiogroup"
          aria-label="Rating"
          onMouseLeave={() => setHoverRating(null)}
          className="mt-2 flex gap-1 text-2xl"
        >
          {([1, 2, 3, 4, 5] as const).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onFocus={() => setHoverRating(n)}
              onBlur={() => setHoverRating(null)}
              className={`transition-colors ${
                ratingShown >= n
                  ? "text-[#f4b740]"
                  : "text-[var(--color-line)]"
              }`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
            Name
          </span>
          <input
            id={`${baseId}-author`}
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="First name L."
            autoComplete="name"
            required
            className={`mt-1 ${inputClass}`}
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
            Location (optional)
          </span>
          <input
            id={`${baseId}-location`}
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, ST"
            className={`mt-1 ${inputClass}`}
          />
        </label>
      </div>

      <label className="mt-3 block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          Title
        </span>
        <input
          id={`${baseId}-title`}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What stood out"
          maxLength={80}
          required
          className={`mt-1 ${inputClass}`}
        />
      </label>

      <label className="mt-3 block">
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-soft)]">
          Review
        </span>
        <textarea
          id={`${baseId}-body`}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="How did it work for you? What surprised you?"
          rows={4}
          maxLength={1200}
          required
          className={`mt-1 ${inputClass}`}
        />
      </label>

      {error && (
        <p role="alert" className="mt-3 text-sm text-[#b3261e]">
          {error}
        </p>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="btn-primary"
        >
          {status === "submitting" ? "Posting…" : "Post review"}
        </button>
        {status === "done" && (
          <span className="text-sm font-medium text-[var(--color-ink-soft)]">
            Thanks. Your review is live.
          </span>
        )}
      </div>

      <p className="mt-3 text-xs text-[var(--color-ink-mute)]">
        Reviews are saved locally on this device. Portfolio demo, no server
        moderation.
      </p>
    </form>
  );
}
