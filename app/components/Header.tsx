import { Link, NavLink, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { useCart } from "~/lib/cart-context";
import { TALLY, tallyDelta } from "~/lib/tally";

const NAV_LINKS: Array<{ to: string; label: string; end?: boolean }> = [
  { to: "/", label: "Home", end: true },
  { to: "/#catalog", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/blog", label: "Journal" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { open: openCart, itemCount } = useCart();
  const delta = tallyDelta(TALLY);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const headerBg = scrolled || menuOpen
    ? "bg-[color-mix(in_oklab,var(--color-bg)_88%,transparent)] backdrop-blur-md border-[var(--color-line)]"
    : "bg-transparent border-transparent";

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-colors duration-200 ${headerBg}`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8 md:py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-[var(--color-ink)] font-display text-base font-bold tracking-tight"
          aria-label="TallyTails home"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-bg)]">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden>
              <path
                d="M4 17c0-4 3-7 8-7s8 3 8 7"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M7 10c0-2 1.5-3.5 3-3.5S13 8 13 10M11 10c0-2 1.5-3.5 3-3.5S17 8 17 10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </span>
          <span className="hidden tracking-[0.02em] sm:inline">TALLYTAILS</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[var(--color-ink)] bg-[var(--color-surface-2)]"
                    : "text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <TallyChip />
          <Link
            to="/account"
            aria-label="Account"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
              <path
                d="M4 21c0-4 4-7 8-7s8 3 8 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </Link>
          <button
            type="button"
            onClick={openCart}
            aria-label={`Cart, ${itemCount} item${itemCount === 1 ? "" : "s"}`}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6h15l-1.5 9h-12L5 3H2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <circle cx="9" cy="20" r="1.5" fill="currentColor" />
              <circle cx="18" cy="20" r="1.5" fill="currentColor" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-accent)] px-1 text-[10px] font-semibold text-[var(--color-accent-ink)]">
                {itemCount}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] md:hidden"
          >
            {menuOpen ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Primary mobile"
          className="flex flex-col gap-1 border-t border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 md:hidden"
        >
          {NAV_LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `rounded-md px-3 py-3 text-base font-medium ${
                  isActive
                    ? "text-[var(--color-ink)] bg-[var(--color-surface-2)]"
                    : "text-[var(--color-ink-soft)]"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center justify-between rounded-md bg-[var(--color-surface-2)] px-3 py-2 text-sm">
            <span className="font-display tabular-nums font-semibold text-[var(--color-cat)]">
              CAT {TALLY.cat.toLocaleString()}
            </span>
            <span className="text-[var(--color-ink-mute)]">vs</span>
            <span className="font-display tabular-nums font-semibold text-[var(--color-dog)]">
              DOG {TALLY.dog.toLocaleString()}
            </span>
          </div>
          {delta.leader !== "tie" && (
            <p className="px-3 pt-1 text-xs text-[var(--color-ink-mute)]">
              {delta.leader === "cat" ? "Cats" : "Dogs"} up {delta.diff.toLocaleString()} this week
            </p>
          )}
        </nav>
      )}
    </header>
  );
}

function TallyChip() {
  const delta = tallyDelta(TALLY);
  const leaderColor =
    delta.leader === "cat"
      ? "text-[var(--color-cat)]"
      : delta.leader === "dog"
        ? "text-[var(--color-dog)]"
        : "text-[var(--color-ink)]";

  return (
    <>
      {/* Desktop: full split tally */}
      <div className="hidden items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-3 py-1.5 font-display text-sm font-semibold tabular-nums lg:flex">
        <span className="text-[var(--color-cat)]">CAT {TALLY.cat.toLocaleString()}</span>
        <span className="text-[var(--color-ink-mute)]">·</span>
        <span className="text-[var(--color-dog)]">DOG {TALLY.dog.toLocaleString()}</span>
      </div>
      {/* Tablet / small: compact delta pill */}
      <div className={`hidden md:flex lg:hidden items-center gap-1 rounded-full border border-[var(--color-line)] bg-[var(--color-surface)] px-2.5 py-1 font-display text-xs font-semibold tabular-nums ${leaderColor}`}>
        {delta.leader === "tie"
          ? "TIED"
          : `${delta.leader.toUpperCase()} +${delta.diff.toLocaleString()}`}
      </div>
    </>
  );
}
