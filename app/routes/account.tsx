import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, NavLink, Outlet, useLoaderData } from "react-router";
import {
  CUSTOMER_DETAILS_QUERY,
  isCustomerAccountConfigured,
  safeIsLoggedIn,
} from "~/lib/customer-account";
import { brand } from "~/brand";
import "~/styles/routes/account.css";

export const meta: MetaFunction = () => [
  { title: `Your account | ${brand.name}` },
];

export async function loader({ context }: LoaderFunctionArgs) {
  const configured = isCustomerAccountConfigured(context.env);
  if (!configured) {
    return {
      configured: false as const,
      isLoggedIn: false,
      customer: null,
    };
  }

  const isLoggedIn = await safeIsLoggedIn(
    context.customerAccount,
    context.env,
  );

  if (!isLoggedIn) {
    return { configured: true as const, isLoggedIn: false, customer: null };
  }

  try {
    const result = (await context.customerAccount.query(
      CUSTOMER_DETAILS_QUERY,
    )) as {
      data?: {
        customer?: {
          firstName?: string;
          lastName?: string;
          emailAddress?: { emailAddress: string };
          defaultAddress?: { formatted: string[] };
        };
      };
    };
    return {
      configured: true as const,
      isLoggedIn: true,
      customer: result.data?.customer ?? null,
    };
  } catch {
    return { configured: true as const, isLoggedIn: false, customer: null };
  }
}

export default function AccountLayout() {
  const { configured, isLoggedIn, customer } = useLoaderData<typeof loader>();

  if (!configured) {
    return (
      <div className="account container">
        <header className="account-head">
          <span className="eyebrow">Account</span>
          <h1 className="account-title">Sign-in is on the way</h1>
        </header>
        <p className="account-body">
          Customer accounts haven't been wired up yet. Once they're enabled
          you'll be able to sign in with Google or email, track orders,
          claim member-only discount codes, and share your affiliate link
          from here.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to shop
        </Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="account container">
        <header className="account-head">
          <span className="eyebrow">Account</span>
          <h1 className="account-title">Sign in</h1>
        </header>
        <p className="account-body">
          Sign in with email or Google to see your orders, track shipping,
          collect a member discount, and grab your affiliate link. Sign-in
          is hosted by Shopify so we never see your password.
        </p>
        <Link to="/account/login" className="btn btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  const firstName = customer?.firstName ?? "there";

  return (
    <div className="account container">
      <header className="account-head">
        <span className="eyebrow">Account</span>
        <h1 className="account-title">Hey {firstName}</h1>
        <p className="account-email">
          {customer?.emailAddress?.emailAddress}
        </p>
      </header>

      <nav className="account-nav" aria-label="Account">
        <NavLink to="/account" end>
          Overview
        </NavLink>
        <NavLink to="/account/orders">Orders</NavLink>
        <NavLink to="/account/perks">Perks &amp; referral</NavLink>
        <Form method="post" action="/account/logout" className="account-logout">
          <button type="submit">Sign out</button>
        </Form>
      </nav>

      <Outlet context={{ customer }} />
    </div>
  );
}
