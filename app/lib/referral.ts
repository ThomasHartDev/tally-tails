/**
 * Client-side referral capture. Reads `?ref=CODE` from the URL on first
 * paint and persists it as a 60-day cookie so the cart create endpoint
 * can apply it as a Shopify discount code at checkout.
 */

const COOKIE = "bh_ref";
const COOKIE_DAYS = 60;
const MAX_LEN = 32;

function sanitize(code: string): string | null {
  const cleaned = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
  if (!cleaned) return null;
  return cleaned.slice(0, MAX_LEN);
}

export function captureReferralFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("ref");
  if (!raw) return null;
  const code = sanitize(raw);
  if (!code) return null;
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  document.cookie = `${COOKIE}=${code}; max-age=${maxAge}; path=/; samesite=lax`;
  return code;
}

export function readReferralCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  return sanitize(match.slice(COOKIE.length + 1));
}

/**
 * Server-side equivalent. Read the cookie off the Request.
 */
export function readReferralFromRequest(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return null;
  const match = cookieHeader
    .split("; ")
    .find((c) => c.startsWith(`${COOKIE}=`));
  if (!match) return null;
  return sanitize(match.slice(COOKIE.length + 1));
}
