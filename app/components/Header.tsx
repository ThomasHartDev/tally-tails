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

/**
 * Sports-scoreboard header. Row 1 is a thin nav strip (wordmark, links,
 * account, cart). Row 2 is the scoreboard itself: oversized CAT and DOG
 * numbers in their tribe colors, with a two-tone gauge bar showing the
 * split and the weekly delta line.
 *
 * The scoreboard sticks at the top and collapses to a single line once the
 * user scrolls past it, so the catalog still owns the page.
 */
export function Header() {
  const [compact, setCompact] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { open: openCart, itemCount } = useCart();

  const delta = tallyDelta(TALLY);
  const total = TALLY.cat + TALLY.dog;
  const catPct = total === 0 ? 50 : (TALLY.cat / total) * 100;
  const dogPct = 100 - catPct;

  useEffect(() => {
    const onScroll = () => setCompact(window.scrollY > 96);
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

  const deltaLine =
    delta.leader === "tie"
      ? "Dead heat this week"
      : `${delta.leader === "cat" ? "Cats" : "Dogs"} up ${delta.diff.toLocaleString()} this week`;

  return (
    <header className="sticky top-0 z-40 bg-[color-mix(in_oklab,var(--color-bg)_92%,transparent)] backdrop-blur-md">
      {/* Row 1 — nav strip */}
      <div className="border-b border-[var(--color-line)]/50">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2.5 md:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 text-[var(--color-ink)] font-display text-sm font-bold"
            aria-label="TallyTails home"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-ink)] text-[var(--color-bg)]">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" aria-hidden>
                <path d="M4 17c0-4 3-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                <path
                  d="M7 10c0-2 1.5-3.5 3-3.5S13 8 13 10M11 10c0-2 1.5-3.5 3-3.5S17 8 17 10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span className="hidden tracking-[0.08em] sm:inline">TALLYTAILS</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors ${
                    isActive
                      ? "text-[var(--color-ink)]"
                      : "text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Link
              to="/account"
              aria-label="Account"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
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
                <span className="absolute -right-0.5 -top-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[var(--color-ink)] px-1 text-[10px] font-semibold text-[var(--color-bg)]">
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] md:hidden"
            >
              {menuOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2 — scoreboard */}
      <div
        className={`relative overflow-hidden border-b border-[var(--color-line)] transition-[max-height] duration-300 ease-out ${
          compact ? "max-h-[60px]" : "max-h-[220px]"
        }`}
        aria-label="Live cat vs dog tally"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Compact mode — single inline scoreboard line */}
          <div
            className={`flex items-center gap-3 py-3 transition-opacity duration-200 ${
              compact ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0"
            }`}
          >
            <span className="font-display text-base font-bold tabular-nums leading-none text-[#1f4a7a] sm:text-lg">
              CAT {TALLY.cat.toLocaleString()}
            </span>
            <div className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <div
                className="absolute inset-y-0 left-0 bg-[#1f4a7a] transition-[width] duration-500"
                style={{ width: `${catPct}%` }}
              />
              <div
                className="absolute inset-y-0 right-0 bg-[#a3531f] transition-[width] duration-500"
                style={{ width: `${dogPct}%` }}
              />
            </div>
            <span className="font-display text-base font-bold tabular-nums leading-none text-[#a3531f] sm:text-lg">
              {TALLY.dog.toLocaleString()} DOG
            </span>
          </div>

          {/* Full mode */}
          <div
            className={`py-5 transition-opacity duration-200 md:py-7 ${
              compact ? "pointer-events-none absolute inset-0 opacity-0" : "opacity-100"
            }`}
          >
            <div className="flex items-end justify-between gap-3 md:gap-8">
              <div className="flex flex-col items-start">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#1f4a7a]/80 sm:text-[10px]">
                  Cat side
                </span>
                <span className="font-display text-[40px] font-extrabold leading-[0.95] tabular-nums tracking-[-0.04em] text-[#1f4a7a] sm:text-[64px] md:text-[80px]">
                  {TALLY.cat.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-1 flex-col items-center justify-end gap-2 self-end pb-1 md:pb-2">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--color-ink-mute)] sm:text-[10px]">
                  Week · {deltaLine.replace(" this week", "")}
                </span>
                <div className="relative h-2 w-full max-w-sm overflow-hidden rounded-full bg-[var(--color-surface-2)]">
                  <div
                    className="absolute inset-y-0 left-0 bg-[#1f4a7a] transition-[width] duration-500"
                    style={{ width: `${catPct}%` }}
                  />
                  <div
                    className="absolute inset-y-0 right-0 bg-[#a3531f] transition-[width] duration-500"
                    style={{ width: `${dogPct}%` }}
                  />
                </div>
                <span className="hidden text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-mute)] sm:inline">
                  Resets Sunday 12am PT
                </span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-[#a3531f]/80 sm:text-[10px]">
                  Dog side
                </span>
                <span className="font-display text-[40px] font-extrabold leading-[0.95] tabular-nums tracking-[-0.04em] text-[#a3531f] sm:text-[64px] md:text-[80px]">
                  {TALLY.dog.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Primary mobile"
          className="flex flex-col gap-1 border-b border-[var(--color-line)] bg-[var(--color-bg)] px-4 py-3 md:hidden"
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
        </nav>
      )}
    </header>
  );
}
