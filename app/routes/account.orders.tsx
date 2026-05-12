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
      <section className="account-card">
        <h2 className="account-card-title">No orders yet</h2>
        <p className="account-card-body">
          Once you place an order it'll show up here with shipping status
          and tracking. Your member discount stacks with sale pricing.
        </p>
      </section>
    );
  }

  return (
    <section className="account-orders">
      <h2 className="account-card-title">Recent orders</h2>
      <ul className="account-orders-list">
        {orders.map((o) => {
          const fulfillment = o.fulfillments?.nodes?.[0];
          const tracking = fulfillment?.trackingInformation?.[0];
          return (
            <li key={o.id} className="account-order">
              <header className="account-order-head">
                <span className="account-order-name">{o.name}</span>
                <time className="account-order-date" dateTime={o.processedAt}>
                  {new Date(o.processedAt).toLocaleDateString(undefined, {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </time>
              </header>
              <div className="account-order-body">
                <span className={`account-order-status status-${o.financialStatus.toLowerCase()}`}>
                  {o.financialStatus.replace(/_/g, " ").toLowerCase()}
                </span>
                {fulfillment && (
                  <span className="account-order-shipping">
                    Shipping: {fulfillment.status.toLowerCase()}
                  </span>
                )}
                <span className="account-order-total">
                  ${Number(o.totalPrice.amount).toFixed(2)}
                </span>
              </div>
              {tracking?.url && (
                <a
                  className="account-order-track"
                  href={tracking.url}
                  target="_blank"
                  rel="noopener"
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
