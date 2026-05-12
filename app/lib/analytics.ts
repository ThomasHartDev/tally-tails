/**
 * Marketing analytics surface. Two third-parties wired in:
 *
 * - Meta Pixel (fbq): pageview + product view + add-to-cart + initiate
 *   checkout events. Loaded only when PUBLIC_META_PIXEL_ID is set.
 * - Klaviyo: pageview + viewed-product + added-to-cart + identify. Loaded
 *   only when PUBLIC_KLAVIYO_PUBLIC_KEY is set. Newsletter / waitlist
 *   submissions go through the public API.
 *
 * Every helper here is a safe no-op when the underlying SDK hasn't loaded
 * yet (env var missing, slow network, ad-blocker), so consumers never need
 * to guard their call sites.
 */

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _learnq?: any[];
  }
}

type Money = { amount: string; currencyCode: string };

type ProductLike = {
  handle: string;
  title: string;
  vendor?: string;
  price: Money;
  variantId?: string;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

// ---------- Meta Pixel ------------------------------------------------------

function fbq(...args: any[]): void {
  if (!isBrowser() || typeof window.fbq !== "function") return;
  window.fbq(...args);
}

export const metaPixel = {
  pageView() {
    fbq("track", "PageView");
  },
  viewContent(product: ProductLike) {
    fbq("track", "ViewContent", {
      content_ids: [product.variantId ?? product.handle],
      content_name: product.title,
      content_type: "product",
      value: Number(product.price.amount),
      currency: product.price.currencyCode,
    });
  },
  addToCart(product: ProductLike, quantity: number) {
    fbq("track", "AddToCart", {
      content_ids: [product.variantId ?? product.handle],
      content_name: product.title,
      content_type: "product",
      value: Number(product.price.amount) * quantity,
      currency: product.price.currencyCode,
      contents: [
        {
          id: product.variantId ?? product.handle,
          quantity,
          item_price: Number(product.price.amount),
        },
      ],
    });
  },
  initiateCheckout(subtotal: number, currency: string, items: number) {
    fbq("track", "InitiateCheckout", {
      value: subtotal,
      currency,
      num_items: items,
    });
  },
  subscribe(email: string) {
    fbq("track", "Subscribe", { email });
  },
};

// ---------- Klaviyo ---------------------------------------------------------

function klaviyo(...args: any[]): void {
  if (!isBrowser()) return;
  window._learnq = window._learnq || [];
  window._learnq.push(args);
}

export const klaviyoEvents = {
  identify(email: string) {
    klaviyo("identify", { $email: email });
  },
  viewedProduct(product: ProductLike) {
    klaviyo("track", "Viewed Product", {
      Name: product.title,
      ProductID: product.variantId ?? product.handle,
      Brand: product.vendor,
      Price: Number(product.price.amount),
      URL:
        isBrowser() && typeof window.location !== "undefined"
          ? window.location.href
          : undefined,
    });
  },
  addedToCart(product: ProductLike, quantity: number) {
    klaviyo("track", "Added to Cart", {
      Name: product.title,
      ProductID: product.variantId ?? product.handle,
      Quantity: quantity,
      Value: Number(product.price.amount) * quantity,
    });
  },
};

/**
 * Subscribe an email to the configured Klaviyo list. Calls the public
 * client-side endpoint. No-ops when the public key or list id isn't
 * configured. Useful in dev and as a graceful degradation.
 */
export async function klaviyoSubscribe(
  email: string,
  publicKey: string | undefined,
  listId: string | undefined,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isBrowser()) return { ok: false, reason: "non-browser" };
  if (!email) return { ok: false, reason: "missing-email" };
  if (!publicKey || !listId) {
    // Forget env vars for now: succeed silently so the UX still shows the
    // discount code. Swap to a real call once keys are populated.
    return { ok: true, reason: "no-key-stub" };
  }
  try {
    const body = new URLSearchParams({
      g: listId,
      email,
      $fields: "$consent",
      $consent: "email",
    });
    const res = await fetch(
      `https://manage.kmail-lists.com/ajax/subscriptions/subscribe?company_id=${publicKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      },
    );
    return { ok: res.ok };
  } catch (e) {
    return { ok: false, reason: (e as Error).message };
  }
}
