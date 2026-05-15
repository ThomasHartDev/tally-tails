import { useEffect, useState } from "react";
import { TALLY, tallyDelta } from "~/lib/tally";

/**
 * Persistent leaderboard floater. Bottom-right on desktop, bottom-stretched
 * on mobile. Collapsible. The score is the secret sauce of the storefront
 * but it's not the headline — the catalog is. The floater stays in the
 * corner so it's visible while shopping without dominating the page.
 *
 * Hard-coded TALLY for now (see app/lib/tally.ts). Once action #8 ships
 * the leaderboard backend, the root loader returns the live numbers and
 * the floater reads them via props instead of the static import.
 */
export function TallyFloater() {
  const [expanded, setExpanded] = useState(false);
  const [hidden, setHidden] = useState(false);
  const delta = tallyDelta(TALLY);
  const total = TALLY.cat + TALLY.dog;
  const catPct = total === 0 ? 50 : Math.round((TALLY.cat / total) * 100);

  // Honor a "dismissed" cookie so the floater doesn't nag returning users
  // who actively closed it. Resets after the session for now.
  useEffect(() => {
    try {
      const dismissed = sessionStorage.getItem("tally-floater-dismissed");
      if (dismissed === "1") setHidden(true);
    } catch {
      /* private browsing, fail open */
    }
  }, []);

  if (hidden) return null;

  const dismiss = () => {
    try { sessionStorage.setItem("tally-floater-dismissed", "1"); } catch {}
    setHidden(true);
  };

  return (
    <aside
      aria-label="Live cat vs dog leaderboard"
      className="fixed bottom-4 right-4 z-30 w-[calc(100%-2rem)] max-w-[280px] sm:bottom-6 sm:right-6"
    >
      <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] shadow-lg shadow-black/10 backdrop-blur-sm">
        {/* Header row */}
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-2 px-4 py-2 text-left"
        >
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--color-ink-mute)]">
            Live Tally · This Week
          </span>
          <svg
            width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          >
            <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Score row */}
        <div className="flex items-baseline justify-between gap-3 px-4 pb-2">
          <span className="font-display text-base font-bold tabular-nums tracking-tight text-[#1f4a7a]">
            CAT <span className="text-xl">{TALLY.cat.toLocaleString()}</span>
          </span>
          <span className="text-[10px] uppercase tracking-widest text-[var(--color-ink-mute)]">vs</span>
          <span className="font-display text-base font-bold tabular-nums tracking-tight text-[#a3531f]">
            <span className="text-xl">{TALLY.dog.toLocaleString()}</span> DOG
          </span>
        </div>

        {/* Gauge */}
        <div className="mx-4 mb-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
          <div
            className="h-full bg-[#5b9dd9] transition-[width] duration-500"
            style={{ width: `${catPct}%` }}
          />
        </div>

        <div className="px-4 pb-3 text-[11px] text-[var(--color-ink-soft)]">
          {delta.leader === "cat" && <>Cats up by <b className="text-[#1f4a7a]">{delta.diff}</b></>}
          {delta.leader === "dog" && <>Dogs up by <b className="text-[#a3531f]">{delta.diff}</b></>}
          {delta.leader === "tie" && <>Dead heat.</>}
        </div>

        {expanded && (
          <div className="border-t border-[var(--color-line)] px-4 py-3 text-xs leading-relaxed text-[var(--color-ink-soft)]">
            <p className="mb-2">
              Every order ticks the side it came from. Score resets every
              Sunday at midnight Pacific. Bragging rights renew weekly.
            </p>
            <div className="mt-3 flex items-center justify-between">
              <a
                href="/how-it-works"
                className="font-semibold text-[var(--color-ink)] underline-offset-2 hover:underline"
              >
                How it works →
              </a>
              <button
                type="button"
                onClick={dismiss}
                className="text-[var(--color-ink-mute)] hover:text-[var(--color-ink)]"
              >
                Hide for this session
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
