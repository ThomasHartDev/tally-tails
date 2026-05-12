import { useOutletContext } from "react-router";
import { brand } from "~/brand";

type Ctx = {
  customer: {
    firstName?: string;
    lastName?: string;
  } | null;
};

/**
 * Affiliate + perks page. The referral code is derived from the
 * customer's first name + last initial so each customer gets a stable
 * short code. Real attribution belongs in Shopify (Discounts → Affiliate
 * or a third-party app); this page just surfaces the link and copy.
 */
function referralCode(c: Ctx["customer"]): string {
  if (!c?.firstName) return "BEEFRIEND";
  const first = c.firstName.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 6);
  const lastInitial = (c.lastName ?? "").trim().charAt(0).toUpperCase();
  return `${first}${lastInitial || "X"}10`;
}

export default function AccountPerks() {
  const { customer } = useOutletContext<Ctx>();
  const code = referralCode(customer);
  const link = `${brand.baseUrl}/?ref=${code}`;

  return (
    <div className="account-overview">
      <section className="account-card">
        <h2 className="account-card-title">Your referral link</h2>
        <p className="account-card-body">
          Share this link. Friends save 10% on their first order, and you
          earn a $10 credit toward your next jar for every order placed
          through it.
        </p>
        <div className="account-discount-code">{code}</div>
        <p className="account-card-note">
          Direct link:{" "}
          <a href={link} className="account-affiliate-link">
            {link}
          </a>
        </p>
      </section>

      <section className="account-card">
        <h2 className="account-card-title">Member discount</h2>
        <p className="account-card-body">
          MEMBER15 stacks with sale pricing for 15% off any order over
          $40. One use per checkout.
        </p>
        <div className="account-discount-code">MEMBER15</div>
      </section>

      <section className="account-card">
        <h2 className="account-card-title">How affiliate payouts work</h2>
        <ul className="account-card-list">
          <li>Credits accrue automatically when a friend checks out.</li>
          <li>Apply credit to any future order, or cash out at $50.</li>
          <li>Payouts ship through your Shopify customer balance.</li>
        </ul>
      </section>
    </div>
  );
}
