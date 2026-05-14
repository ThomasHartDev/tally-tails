import type { MetaFunction } from "react-router";
import { brand } from "~/brand";
import { useSeo } from "~/lib/seo";

export const meta: MetaFunction = () => {
  const title = `About | ${brand.name}`;
  const description = `${brand.name} is a pet storefront built around a live cat-vs-dog leaderboard. Every order tips the score. Cat side products, dog side products, one ongoing tally.`;
  const url = `${brand.baseUrl}/about`;
  const image = `${brand.baseUrl}${brand.ogImage}`;
  return [
    { title },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:image", content: image },
    { property: "og:site_name", content: brand.name },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: image },
  ];
};

export default function AboutPage() {
  useSeo({
    title: "About",
    description: `${brand.name} is a pet storefront built around a live cat-vs-dog leaderboard. Every order tips the score. Cat side products, dog side products, one ongoing tally.`,
    path: "/about",
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-12 md:px-8 md:py-20">
      <div className="overflow-hidden rounded-3xl bg-[var(--color-surface-2)] mb-10">
        <img
          src="/brand/scenes/scene-close-race.webp"
          alt="TallyTails cat and dog mascots running side by side"
          width="1200"
          height="600"
          className="w-full object-cover"
        />
      </div>

      <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
        About TallyTails
      </span>
      <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-[-0.04em] text-[var(--color-ink)] md:text-5xl">
        Built to make pet shopping mean something.
      </h1>

      <div className="mt-8 space-y-5 text-base leading-relaxed text-[var(--color-ink-soft)]">
        <p>
          TallyTails is one storefront with two tribes. Cat side and dog side,
          each with its own SKUs, each tracked against the other. Every order
          tips a running score visible on every page. The popup, the palette,
          and the homepage face-off all bend toward whichever side is winning
          that week.
        </p>
        <p>
          We sell good pet products. The leaderboard is the reason you'll
          remember us. We source from US warehouses where possible, ship most
          orders within 48 hours, and pay return shipping if it doesn't work
          out.
        </p>
        <p>
          Small team. Email goes to a real person at{" "}
          <a
            href="mailto:support@tallytails.com"
            className="font-semibold text-[var(--color-ink)] underline-offset-2 hover:underline"
          >
            support@tallytails.com
          </a>
          , not a ticket queue.
        </p>
      </div>

      <div className="mt-12 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <span className="font-display text-3xl font-bold text-[var(--color-ink)]">48h</span>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Most orders ship in under two days.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <span className="font-display text-3xl font-bold text-[var(--color-ink)]">30d</span>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            No-questions returns. We pay the label.
          </p>
        </div>
        <div className="rounded-2xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5">
          <span className="font-display text-3xl font-bold text-[var(--color-ink)]">2</span>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
            Tribes. One score. Pick a side.
          </p>
        </div>
      </div>
    </article>
  );
}
