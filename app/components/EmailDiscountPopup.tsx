import { useEffect, useState } from "react";
import {
  klaviyoEvents,
  klaviyoSubscribe,
  metaPixel,
} from "~/lib/analytics";
import "./EmailDiscountPopup.css";

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

  return (
    <div
      className="discount-popup-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="discount-popup-title"
    >
      <div className="discount-popup">
        <button
          type="button"
          className="discount-popup-close"
          onClick={() => close("dismissed")}
          aria-label="Dismiss"
        >
          ×
        </button>

        {stage === "success" ? (
          <>
            <span className="discount-popup-eyebrow">You're in</span>
            <h2 id="discount-popup-title" className="discount-popup-title">
              10% off your first order
            </h2>
            <p className="discount-popup-copy">
              Use the code below at checkout. It's also in your inbox.
            </p>
            <div className="discount-popup-code">{DISCOUNT_CODE}</div>
            <button
              type="button"
              className="btn btn-primary discount-popup-cta"
              onClick={() => close("submitted")}
            >
              Start shopping
            </button>
          </>
        ) : (
          <>
            <span className="discount-popup-eyebrow">First-time visitor</span>
            <h2 id="discount-popup-title" className="discount-popup-title">
              Get 10% off your first order
            </h2>
            <p className="discount-popup-copy">
              Drop your email and we'll send the code plus the weekly tally
              update on which side is winning. No spam, easy to unsubscribe.
            </p>
            <form className="discount-popup-form" onSubmit={handleSubmit}>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@yourbrand.com"
                aria-label="Email"
                autoComplete="email"
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                disabled={stage === "submitting"}
              >
                {stage === "submitting" ? "Sending…" : "Send me 10% off"}
              </button>
            </form>
            {error && (
              <p className="discount-popup-error" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              className="discount-popup-skip"
              onClick={() => close("dismissed")}
            >
              No thanks
            </button>
          </>
        )}
      </div>
    </div>
  );
}
