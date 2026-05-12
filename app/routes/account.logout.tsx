import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";
import { isCustomerAccountConfigured } from "~/lib/customer-account";

export async function action({ context }: ActionFunctionArgs) {
  if (!isCustomerAccountConfigured(context.env)) return redirect("/account");
  return context.customerAccount.logout();
}

// Hitting /account/logout directly (GET) just sends you home.
export async function loader(_: LoaderFunctionArgs) {
  return redirect("/account");
}
