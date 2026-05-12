import type { LoaderFunctionArgs } from "react-router";
import { redirect } from "react-router";

// The cart now lives in a global slide-out drawer. The /cart URL still
// exists for backwards compatibility but bounces to / where users can
// open the drawer from the header cart icon.
export async function loader(_args: LoaderFunctionArgs) {
  throw redirect("/");
}
