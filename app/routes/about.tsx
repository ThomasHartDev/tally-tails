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
    <article className="container" style={{ paddingTop: "120px", paddingBottom: "96px", maxWidth: "720px" }}>
      <span className="eyebrow">About TallyTails</span>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-3xl)",
          fontWeight: 600,
          margin: "var(--space-4) 0 var(--space-8)",
          letterSpacing: "var(--ls-tight)",
          lineHeight: 1.1,
        }}
      >
        Built to make pet shopping mean something.
      </h1>
      <p style={{ color: "var(--color-fg-muted)", lineHeight: "var(--leading-normal)", marginBottom: "var(--space-4)" }}>
        TallyTails is one storefront with two tribes. Cat side and dog side,
        each with its own SKUs, each tracked against the other. Every order
        tips a running score visible on every page. The popup, the palette,
        and the homepage face-off all bend toward whichever side is winning
        that week.
      </p>
      <p style={{ color: "var(--color-fg-muted)", lineHeight: "var(--leading-normal)", marginBottom: "var(--space-4)" }}>
        We sell good pet products. The leaderboard is the reason you'll
        remember us. We source from US warehouses where possible, ship most
        orders within 48 hours, and pay return shipping if it doesn't work
        out.
      </p>
      <p style={{ color: "var(--color-fg-muted)", lineHeight: "var(--leading-normal)" }}>
        Small team. Email goes to a real person at support@tallytails.com,
        not a ticket queue.
      </p>
    </article>
  );
}
