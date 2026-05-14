import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Form, Link, NavLink, Outlet, useLoaderData } from "react-router";
import {
  CUSTOMER_DETAILS_QUERY,
  isCustomerAccountConfigured,
  safeIsLoggedIn,
} from "~/lib/customer-account";
import { brand } from "~/brand";

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
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
          Account
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)] md:text-4xl">
          Sign-in is on the way
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
          Customer accounts haven't been wired up yet. Once they're enabled
          you'll be able to sign in with Google or email, track orders, claim
          member-only discount codes, and share your affiliate link from
          here.
        </p>
        <Link to="/" className="btn-primary mt-6 inline-flex">
          Back to shop
        </Link>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 md:px-8 md:py-24">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
          Account
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)] md:text-4xl">
          Sign in
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
          Sign in with email or Google to see your orders, track shipping,
          collect a member discount, and grab your affiliate link. Sign-in is
          hosted by Shopify so we never see your password.
        </p>
        <Link to="/account/login" className="btn-primary mt-6 inline-flex">
          Sign in
        </Link>
      </div>
    );
  }

  const firstName = customer?.firstName ?? "there";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-8 md:py-16">
      <header>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
          Account
        </span>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)] md:text-4xl">
          Hey {firstName}
        </h1>
        {customer?.emailAddress?.emailAddress && (
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            {customer.emailAddress.emailAddress}
          </p>
        )}
      </header>

      <nav
        aria-label="Account"
        className="mt-8 flex flex-wrap items-center gap-1 border-b border-[var(--color-line)]"
      >
        {[
          { to: "/account", end: true, label: "Overview" },
          { to: "/account/orders", label: "Orders" },
          { to: "/account/perks", label: "Perks & referral" },
        ].map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `relative px-4 py-3 text-sm font-medium ${
                isActive
                  ? "text-[var(--color-ink)] after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:bg-[var(--color-ink)]"
                  : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
              }`
            }
          >
            {l.label}
          </NavLink>
        ))}
        <Form
          method="post"
          action="/account/logout"
          className="ml-auto"
        >
          <button
            type="submit"
            className="px-4 py-3 text-sm font-medium text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
          >
            Sign out
          </button>
        </Form>
      </nav>

      <div className="mt-8">
        <Outlet context={{ customer }} />
      </div>
    </div>
  );
}
