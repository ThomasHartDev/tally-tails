import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { isCustomerAccountConfigured } from "~/lib/customer-account";

export async function loader({ context }: LoaderFunctionArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect("/account");
  // Shopify redirects back to this URI with ?code + ?state after login.
  // The Hydrogen client validates the state, swaps the code for tokens,
  // persists them in the session, and redirects to the original page.
  return context.customerAccount.authorize();
}
