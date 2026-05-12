import { createHydrogenContext } from "@shopify/hydrogen";
import { AppSession } from "~/lib/session";

// Slot for any extra clients (CMS, reviews, analytics, etc.) we
// want exposed on every loader's context. Empty for now.
const additionalContext = {} as const;

/**
 * Build the per-request Hydrogen context. Includes the storefront client,
 * cart helpers, and session. No customer-account stuff for now, the
 * leaderboard reads from KV not from logged-in customer state.
 */
export async function createHydrogenRouterContext(
  request: Request,
  env: Env,
  executionContext: ExecutionContext,
) {
  if (!env?.SESSION_SECRET) {
    throw new Error("SESSION_SECRET environment variable is not set");
  }

  const waitUntil = executionContext.waitUntil.bind(executionContext);
  const [cache, session] = await Promise.all([
    caches.open("hydrogen"),
    AppSession.init(request, [env.SESSION_SECRET]),
  ]);

  const hydrogenContext = createHydrogenContext(
    {
      env,
      request,
      cache,
      waitUntil,
      session,
      i18n: { language: "EN", country: "US" },
    },
    additionalContext,
  );

  return hydrogenContext;
}
