/**
 * Helpers around the Hydrogen Customer Account client. The client itself
 * is attached to the request context by createHydrogenContext, but only
 * actually works when PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID and SHOP_ID
 * are set. These helpers wrap the SDK with a "not configured" fallback so
 * the /account routes don't 500 in dev or on portfolio deployments where
 * the keys haven't been wired yet.
 */

export function isCustomerAccountConfigured(env: Env): boolean {
  return Boolean(env.PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID && env.SHOP_ID);
}

/**
 * Wraps an isLoggedIn() check so a misconfigured client (no env) reports
 * as logged-out instead of throwing.
 */
export async function safeIsLoggedIn(
  customerAccount: { isLoggedIn: () => Promise<boolean> } | undefined,
  env: Env,
): Promise<boolean> {
  if (!isCustomerAccountConfigured(env) || !customerAccount) return false;
  try {
    return await customerAccount.isLoggedIn();
  } catch {
    return false;
  }
}

/**
 * GraphQL fragment for the customer dashboard. Keep it small so the
 * Customer Account API quota doesn't get burned on a sidebar.
 */
export const CUSTOMER_DETAILS_QUERY = `#graphql
  query CustomerDetails {
    customer {
      firstName
      lastName
      emailAddress { emailAddress }
      defaultAddress { formatted }
    }
  }
` as const;

export const CUSTOMER_ORDERS_QUERY = `#graphql
  query CustomerOrders($first: Int!) {
    customer {
      orders(first: $first, sortKey: PROCESSED_AT, reverse: true) {
        nodes {
          id
          name
          processedAt
          financialStatus
          fulfillments(first: 1) {
            nodes { status trackingInformation { number url } }
          }
          totalPrice { amount currencyCode }
        }
      }
    }
  }
` as const;
