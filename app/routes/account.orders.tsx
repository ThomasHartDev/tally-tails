import type { LoaderFunctionArgs } from "react-router";
import { redirect, useLoaderData } from "react-router";
import { CUSTOMER_ORDERS_QUERY } from "~/lib/customer-account";

type OrderNode = {
  id: string;
  name: string;
  processedAt: string;
  financialStatus: string;
  fulfillments?: {
    nodes: Array<{
      status: string;
      trackingInformation?: Array<{ number?: string; url?: string }>;
    }>;
  };
  totalPrice: { amount: string; currencyCode: string };
};

export async function loader({ context }: LoaderFunctionArgs) {
  try {
    const result = (await context.customerAccount.query(CUSTOMER_ORDERS_QUERY, {
      variables: { first: 20 },
    })) as {
      data?: { customer?: { orders?: { nodes?: OrderNode[] } } };
    };
    return { orders: result.data?.customer?.orders?.nodes ?? [] };
  } catch {
    return redirect("/account");
  }
}

type LoaderData = { orders: OrderNode[] };

export default function AccountOrders() {
  const data = useLoaderData() as LoaderData;
  const orders = data.orders ?? [];

  if (orders.length === 0) {
    return (
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          No orders yet
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Once you place an order it'll show up here with shipping status and
          tracking. Your member discount stacks with sale pricing.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
        Recent orders
      </h2>
      <ul className="mt-4 space-y-3">
        {orders.map((o) => {
          const fulfillment = o.fulfillments?.nodes?.[0];
          const tracking = fulfillment?.trackingInformation?.[0];
          return (
            <li
              key={o.id}
              className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5"
            >
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-display text-base font-semibold text-[var(--color-ink)]">
                  {o.name}
                </span>
                <time
                  dateTime={o.processedAt}
                  className="text-xs text-[var(--color-ink-mute)]"
                >
                  {new Date(o.processedAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </header>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                  {o.financialStatus.replace(/_/g, " ").toLowerCase()}
                </span>
                {fulfillment && (
                  <span className="text-xs text-[var(--color-ink-soft)]">
                    Shipping: {fulfillment.status.toLowerCase()}
                  </span>
                )}
                <span className="ml-auto font-display text-base font-semibold tabular-nums text-[var(--color-ink)]">
                  ${Number(o.totalPrice.amount).toFixed(2)}
                </span>
              </div>
              {tracking?.url && (
                <a
                  href={tracking.url}
                  target="_blank"
                  rel="noopener"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)] hover:underline"
                >
                  Track {tracking.number ?? "package"} →
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
