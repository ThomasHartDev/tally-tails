import type { ActionFunctionArgs } from "react-router";
import { createShopifyCart } from "~/lib/shopify";
import { readReferralFromRequest } from "~/lib/referral";
import { discountCodesForSubtotal } from "~/lib/cart-tiers";

type CheckoutLine = { variantId: string; quantity: number };

type CheckoutBody = {
  lines: CheckoutLine[];
  /** Client-computed subtotal in USD. Used to pick tiered discount codes. */
  subtotal?: number;
};

// API-only route. GET returns 405 instead of react-router's default
// "no loader" error so curl/probes get a clean response.
export function loader() {
  return new Response("Method not allowed", { status: 405 });
}

export async function action({ request, context }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = (await request.json()) as CheckoutBody;
  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return Response.json({ error: "Empty cart" }, { status: 400 });
  }

  // Reject if any line is missing a variantId (static fallback case).
  if (body.lines.some((l) => !l.variantId)) {
    return Response.json(
      {
        error:
          "Checkout is not yet configured. Please try again once Shopify is connected.",
      },
      { status: 400 },
    );
  }

  // Pull the referral cookie off the inbound request and pass it through
  // to Shopify as a discount code. Real attribution / cap rules live on
  // the Shopify discount object. Unknown codes are silently ignored by
  // Shopify so this never breaks checkout.
  const referralCode = readReferralFromRequest(request);

  // Subtotal-tier discount codes. Each tier the cart crosses gets its
  // matching Shopify discount code attached. Codes that don't exist in
  // admin are ignored gracefully so the cart still creates.
  const subtotal = typeof body.subtotal === "number" ? body.subtotal : 0;
  const tierCodes = discountCodesForSubtotal(subtotal);

  const discountCodes = [...tierCodes, ...(referralCode ? [referralCode] : [])];

  const result = await createShopifyCart(context.storefront, {
    lines: body.lines.map((l) => ({
      merchandiseId: l.variantId,
      quantity: l.quantity,
    })),
    ...(discountCodes.length ? { discountCodes } : {}),
  });

  if (!result.cart || result.userErrors.length > 0) {
    return Response.json(
      { error: result.userErrors[0]?.message ?? "Could not create cart" },
      { status: 502 },
    );
  }

  return Response.json({ checkoutUrl: result.cart.checkoutUrl });
}
