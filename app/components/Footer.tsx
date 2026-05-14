import { Link } from "react-router";
import { TALLY } from "~/lib/tally";

export function Footer() {
  return (
    <footer className="mt-24 bg-[#0f1015] text-[#d9d9df]">
      <div className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <span className="font-display text-xl font-bold tracking-tight text-white">
              TALLYTAILS
            </span>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-[#8e8e98]">
              Cat side or dog side. Every order tips the score. One storefront,
              two tribes, an ongoing tally between them.
            </p>
            <div className="mt-4 inline-flex items-center gap-1 rounded-full bg-white/5 px-3 py-1.5 font-display text-xs font-semibold tabular-nums">
              <span className="text-[var(--color-cat)]">CAT {TALLY.cat.toLocaleString()}</span>
              <span className="text-[#5a5a64]">·</span>
              <span className="text-[var(--color-dog)]">DOG {TALLY.dog.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Shop
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><a className="hover:text-white" href="/#catalog">All products</a></li>
              <li><a className="hover:text-white" href="/?side=cat#catalog">Cat side</a></li>
              <li><a className="hover:text-white" href="/?side=dog#catalog">Dog side</a></li>
              <li><a className="hover:text-white" href="/#catalog">Bundles</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
              Brand
            </h2>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link className="hover:text-white" to="/about">About</Link></li>
              <li><Link className="hover:text-white" to="/blog">Journal</Link></li>
              <li><a className="hover:text-white" href="mailto:support@tallytails.com">Contact</a></li>
            </ul>
          </div>

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-white">
              The weekly tally
            </h2>
            <p className="mt-4 text-sm text-[#8e8e98]">
              One email a week. Who's winning, what's new, no spam.
            </p>
            <form
              className="mt-3 flex flex-col gap-2 sm:flex-row"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                aria-label="Email"
                placeholder="you@yourbrand.com"
                className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-[#5a5a64] focus:border-white/30 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-[#0f1015] transition hover:bg-[#e8e8ec]"
              >
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-[#5a5a64] sm:flex-row sm:items-center">
          <span>&copy; TallyTails {new Date().getFullYear()}</span>
          <span>Custom-built by HARTECHO.</span>
        </div>
      </div>
    </footer>
  );
}
