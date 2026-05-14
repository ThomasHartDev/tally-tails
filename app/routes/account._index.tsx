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
    <div className="grid gap-6 md:grid-cols-2">
      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          Member discount
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
          Your member code below stacks with sale prices. Apply it at
          checkout, no expiry while your account is active.
        </p>
        <div className="mt-4 rounded-lg bg-[var(--color-ink)] px-4 py-3 font-display text-lg font-bold tracking-[0.12em] text-[var(--color-bg)]">
          MEMBER15
        </div>
        <p className="mt-3 text-xs text-[var(--color-ink-mute)]">
          15% off any order over $40, capped at one use per checkout.
        </p>
      </section>

      <section className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-6">
        <h2 className="font-display text-lg font-semibold text-[var(--color-ink)]">
          Shipping address
        </h2>
        {customer?.defaultAddress?.formatted?.length ? (
          <address className="mt-3 not-italic text-sm leading-relaxed text-[var(--color-ink-soft)]">
            {customer.defaultAddress.formatted.map((line, i) => (
              <span key={i} className="block">{line}</span>
            ))}
          </address>
        ) : (
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
            No default address yet. Add one at checkout to speed up future
            orders.
          </p>
        )}
      </section>
    </div>
  );
}
