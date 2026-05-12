import type { LoaderFunctionArgs } from "react-router";
import { isCustomerAccountConfigured } from "~/lib/customer-account";

export async function loader({ context }: LoaderFunctionArgs) {
  if (!isCustomerAccountConfigured(context.env)) {
    // No customer-account credentials wired. Bounce to the account
    // landing so the user sees the "coming soon" placeholder instead of
    // a 500.
    return new Response(null, {
      status: 302,
      headers: { Location: "/account" },
    });
  }
  // Redirect to the Shopify-hosted login. Sign-in with Google appears
  // automatically when the merchant enables Google SSO under Shopify
  // admin > Settings > Customer accounts.
  return context.customerAccount.login();
}
