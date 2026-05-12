// TODO(phase-2): rewire env access through Hydrogen loader context
// (`context.env`) instead of process.env.
const env = () => ({
  PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
});
const integrations = () => ({
  stripe: Boolean(process.env.PUBLIC_STRIPE_PUBLISHABLE_KEY && process.env.STRIPE_SECRET_KEY),
});

/**
 * Server-only Stripe wrapper. Returns a "not configured" sentinel when
 * keys are absent, instead of throwing. UI shows a friendly disabled
 * state. Always intended for TEST mode in this repo.
 */

export type CheckoutLineItem = {
  productHandle: string;
  quantity: number;
};

export type CheckoutResult =
  | { status: "ok"; url: string; sessionId: string }
  | { status: "not-configured" }
  | { status: "error"; message: string };

export async function createCheckoutSession(
  items: CheckoutLineItem[],
  successUrl: string,
  cancelUrl: string
): Promise<CheckoutResult> {
  if (!integrations().stripe) return { status: "not-configured" };
  const e = env();
  if (!e.STRIPE_SECRET_KEY!.startsWith("sk_test_")) {
    // Hard refuse in this repo. Never wire to a live secret.
    return { status: "error", message: "Refusing to use a non-test Stripe key" };
  }

  // Hit Stripe REST directly to avoid pulling the full SDK at build time.
  const body = new URLSearchParams();
  body.append("mode", "payment");
  body.append("success_url", successUrl);
  body.append("cancel_url", cancelUrl);
  items.forEach((item, i) => {
    body.append(`line_items[${i}][quantity]`, String(item.quantity));
    // In a real wiring this would map productHandle to a Stripe Price ID. For
    // the test scaffold we use a placeholder price. The Stripe dashboard
    // will resolve it during the actual checkout flow.
    body.append(`line_items[${i}][price]`, `price_test_${item.productHandle}`);
  });

  try {
    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${e.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const json = (await res.json()) as { id?: string; url?: string; error?: { message: string } };
    if (json.error) return { status: "error", message: json.error.message };
    if (!json.id || !json.url) return { status: "error", message: "Bad Stripe response" };
    return { status: "ok", url: json.url, sessionId: json.id };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Stripe error" };
  }
}
