import { useOutletContext } from "react-router";

type Ctx = {
  customer: {
    firstName?: string;
    lastName?: string;
    defaultAddress?: { formatted: string[] };
  } | null;
};

export default function AccountOverview() {
  const { customer } = useOutletContext<Ctx>();

  return (
    <div className="account-overview">
      <section className="account-card">
        <h2 className="account-card-title">Member discount</h2>
        <p className="account-card-body">
          Your member code below stacks with sale prices. Apply it at
          checkout, no expiry while your account is active.
        </p>
        <div className="account-discount-code">MEMBER15</div>
        <p className="account-card-note">
          15% off any order over $40, capped at one use per checkout.
        </p>
      </section>

      <section className="account-card">
        <h2 className="account-card-title">Shipping address</h2>
        {customer?.defaultAddress?.formatted?.length ? (
          <address className="account-address">
            {customer.defaultAddress.formatted.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </address>
        ) : (
          <p className="account-card-body">
            No default address yet. Add one at checkout to speed up future
            orders.
          </p>
        )}
      </section>
    </div>
  );
}
