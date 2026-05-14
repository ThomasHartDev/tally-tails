import { useOutletContext } from "react-router";
import { brand } from "~/brand";

type Ctx = {
  customer: {
    firstName?: string;
    lastName?: string;
  } | null;
};

/**
 * Affiliate + perks page. Referral code derived from name so each
 * customer gets a stable short code. Real attribution belongs in Shopify
 * (Discounts → Affiliate or a third-party app); this page just surfaces
 * the link and copy.
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
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6 md:col-span-2">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          Your referral link
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Share this link. Friends save 10% on their first order, and you earn
          a $10 credit toward your next jar for every order placed through
          it.
        </p>
        <div className="mt-4 rounded-lg bg-[var(--color-ink)] px-4 py-3 font-display text-lg font-bold tracking-[0.12em] text-[var(--color-bg)]">
          {code}
        </div>
        <p className="mt-3 text-xs text-[var(--color-ink-mute)]">
          Direct link:{" "}
          <a
            href={link}
            className="text-[var(--color-ink-soft)] underline-offset-2 hover:text-[var(--color-ink)] hover:underline"
          >
            {link}
          </a>
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          Member discount
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          MEMBER15 stacks with sale pricing for 15% off any order over $40.
          One use per checkout.
        </p>
        <div className="mt-4 rounded-lg bg-[var(--color-ink)] px-4 py-3 font-display text-lg font-bold tracking-[0.12em] text-[var(--color-bg)]">
          MEMBER15
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          How affiliate payouts work
        </h2>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          <li>Credits accrue automatically when a friend checks out.</li>
          <li>Apply credit to any future order, or cash out at $50.</li>
          <li>Payouts ship through your Shopify customer balance.</li>
        </ul>
      </section>
    </div>
  );
}
