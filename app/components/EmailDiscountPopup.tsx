import { useEffect, useState } from "react";
import {
  klaviyoEvents,
  klaviyoSubscribe,
  metaPixel,
} from "~/lib/analytics";

const COOKIE = "bh_email_popup";
const COOKIE_DAYS = 30;
const DISCOUNT_CODE = "WELCOME10";
const SHOW_DELAY_MS = 2400;

function hasCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) => c.startsWith(`${COOKIE}=`));
}

function setCookie(value: string): void {
  if (typeof document === "undefined") return;
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE}=${value}; max-age=${maxAge}; path=/; samesite=lax`;
}

export function EmailDiscountPopup({
  klaviyoPublicKey,
  klaviyoListId,
}: {
  klaviyoPublicKey?: string;
  klaviyoListId?: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [side, setSide] = useState<"cat" | "dog" | null>(null);
  const [stage, setStage] = useState<"form" | "success" | "submitting">(
    "form",
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasCookie()) return;
    const id = window.setTimeout(() => setOpen(true), SHOW_DELAY_MS);
    return () => window.clearTimeout(id);
  }, []);

  if (!open) return null;

  const close = (reason: "submitted" | "dismissed") => {
    setCookie(reason);
    setOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const value = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value)) {
      setError("That email doesn't look right.");
      return;
    }
    setStage("submitting");
    const result = await klaviyoSubscribe(value, klaviyoPublicKey, klaviyoListId);
    if (!result.ok) {
      setStage("form");
      setError("Couldn't sign you up. Try again in a minute.");
      return;
    }
    klaviyoEvents.identify(value);
    metaPixel.subscribe(value);
    setStage("success");
  };

  const mascot = side === "dog"
    ? "/brand/mascots/dog-dance.webp"
    : "/brand/mascots/cat-plotting.webp";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="discount-popup-title"
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4 sm:items-center"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-[var(--color-bg)] shadow-2xl">
        {/* Mascot peeking from the top */}
        <img
          src={mascot}
          alt=""
          width="200"
          height="200"
          className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 object-contain"
        />

        <button
          type="button"
          onClick={() => close("dismissed")}
          aria-label="Dismiss"
          className="absolute right-3 top-3 z-10 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-surface-2)] text-[var(--color-ink)] hover:bg-[var(--color-line)]"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="px-6 pb-6 pt-10 sm:px-8 sm:pb-8 sm:pt-12">
          {stage === "success" ? (
            <>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
                You're in
              </span>
              <h2
                id="discount-popup-title"
                className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-[var(--color-ink)] sm:text-3xl"
              >
                10% off your first order
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                Use the code below at checkout. It's also in your inbox.
              </p>
              <div className="mt-4 rounded-lg bg-[var(--color-ink)] px-4 py-3 text-center font-display text-xl font-bold tracking-[0.14em] text-[var(--color-bg)]">
                {DISCOUNT_CODE}
              </div>
              <button
                type="button"
                onClick={() => close("submitted")}
                className="btn-primary mt-5 w-full"
              >
                Start shopping
              </button>
            </>
          ) : (
            <>
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
                First-time visitor
              </span>
              <h2
                id="discount-popup-title"
                className="mt-2 font-display text-2xl font-bold tracking-[-0.04em] text-[var(--color-ink)] sm:text-3xl"
              >
                Get 10% off your first order
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                Drop your email and we'll send the code plus the weekly tally
                update on which side is winning. No spam, easy to unsubscribe.
              </p>

              {/* Side-picker chips */}
              <div className="mt-4">
                <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-mute)]">
                  Pick a side (optional)
                </span>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSide(side === "cat" ? null : "cat")}
                    className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                      side === "cat"
                        ? "border-[var(--color-cat)] bg-[var(--color-cat)] text-[var(--color-cat-bg)]"
                        : "border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-cat)]"
                    }`}
                  >
                    Cat side
                  </button>
                  <button
                    type="button"
                    onClick={() => setSide(side === "dog" ? null : "dog")}
                    className={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition ${
                      side === "dog"
                        ? "border-[var(--color-dog)] bg-[var(--color-dog)] text-[var(--color-dog-bg)]"
                        : "border-[var(--color-line)] text-[var(--color-ink)] hover:border-[var(--color-dog)]"
                    }`}
                  >
                    Dog side
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@yourbrand.com"
                  aria-label="Email"
                  autoComplete="email"
                  required
                  className="w-full rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-mute)] focus:border-[var(--color-ink)] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={stage === "submitting"}
                  className="btn-primary w-full"
                >
                  {stage === "submitting" ? "Sending…" : "Send me 10% off"}
                </button>
              </form>
              {error && (
                <p role="alert" className="mt-3 text-xs text-[#b3261e]">
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={() => close("dismissed")}
                className="mt-3 w-full text-xs text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
              >
                No thanks
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
