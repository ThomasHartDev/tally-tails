// TODO(phase-2): rewire env access through Hydrogen loader context
// (`context.env`) instead of process.env. This shim keeps the surface
// identical for the port and unblocks compile.
const env = () => ({
  PUBLIC_KLAVIYO_PUBLIC_KEY: process.env.PUBLIC_KLAVIYO_PUBLIC_KEY,
  PUBLIC_KLAVIYO_WAITLIST_LIST_ID: process.env.PUBLIC_KLAVIYO_WAITLIST_LIST_ID,
  KLAVIYO_PRIVATE_KEY: process.env.KLAVIYO_PRIVATE_KEY,
});
const integrations = () => ({
  klaviyo: Boolean(process.env.PUBLIC_KLAVIYO_PUBLIC_KEY),
  klaviyoServer: Boolean(process.env.KLAVIYO_PRIVATE_KEY),
});

/**
 * Klaviyo: client-side track + server-side list subscribe. With the public
 * key absent, both functions are no-ops.
 */

export function trackEvent(eventName: string, properties: Record<string, unknown> = {}): void {
  if (typeof window === "undefined") return;
  if (!integrations().klaviyo) return;
  const klaviyo = (window as any).klaviyo;
  if (!klaviyo || typeof klaviyo.push !== "function") return;
  klaviyo.push(["track", eventName, properties]);
}

export type SubscribeResult = { status: "ok" } | { status: "not-configured" } | { status: "error"; message: string };

export async function subscribeToWaitlist(email: string): Promise<SubscribeResult> {
  if (!integrations().klaviyoServer) return { status: "not-configured" };
  const e = env();
  const listId = e.PUBLIC_KLAVIYO_WAITLIST_LIST_ID;
  if (!listId) return { status: "error", message: "Missing PUBLIC_KLAVIYO_WAITLIST_LIST_ID" };

  try {
    const res = await fetch(`https://a.klaviyo.com/api/profile-subscription-bulk-create-jobs/`, {
      method: "POST",
      headers: {
        Authorization: `Klaviyo-API-Key ${e.KLAVIYO_PRIVATE_KEY}`,
        "Content-Type": "application/json",
        revision: "2024-10-15",
      },
      body: JSON.stringify({
        data: {
          type: "profile-subscription-bulk-create-job",
          attributes: {
            profiles: { data: [{ type: "profile", attributes: { email } }] },
          },
          relationships: { list: { data: { type: "list", id: listId } } },
        },
      }),
    });
    if (!res.ok) {
      return { status: "error", message: `Klaviyo ${res.status}` };
    }
    return { status: "ok" };
  } catch (err) {
    return { status: "error", message: err instanceof Error ? err.message : "Klaviyo error" };
  }
}
