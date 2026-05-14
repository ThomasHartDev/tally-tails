import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { brand } from "~/brand";
import { breadcrumbList, useJsonLd, useSeo } from "~/lib/seo";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  isoDate: string;
  category: string;
  readingMinutes: number;
  image: string;
  imageAlt: string;
  status: "live" | "upcoming";
};

const POSTS: Post[] = [
  {
    slug: "how-the-tally-works",
    title: "How the tally works",
    excerpt:
      "The score behind every page. How we count, when it resets, and why the popup colour shifts when one side pulls ahead. Plain English, not a whitepaper.",
    date: "May 12, 2026",
    isoDate: "2026-05-12",
    category: "How it works",
    readingMinutes: 4,
    image: "/brand/scenes/scene-close-race.webp",
    imageAlt: "TallyTails cat and dog mascots running neck and neck",
    status: "live",
  },
  {
    slug: "why-cats-vs-dogs",
    title: "Why a cat-vs-dog rivalry storefront",
    excerpt:
      "We could have sold pet products under a neutral brand. We didn't. Here's the bet: tribal identity moves people in a way better photography and faster shipping can't.",
    date: "May 5, 2026",
    isoDate: "2026-05-05",
    category: "Founding",
    readingMinutes: 6,
    image: "/brand/scenes/scene-stalemate.webp",
    imageAlt: "Cat and dog mascots facing each other",
    status: "live",
  },
  {
    slug: "sourcing-the-catalog",
    title: "How we source 30 SKUs without buying junk",
    excerpt:
      "The vendor shortlist, the rejects pile, what we tested in our own homes, and the one product that almost made it to launch before the cat refused to use it.",
    date: "Coming soon",
    isoDate: "2026-06-01",
    category: "Operations",
    readingMinutes: 5,
    image: "/brand/scenes/scene-upset-cats.webp",
    imageAlt: "Cat mascot looking unimpressed",
    status: "upcoming",
  },
  {
    slug: "weekly-reset-mechanic",
    title: "Why the score resets every Sunday",
    excerpt:
      "Game-design notes. We tried a season-long score. Engagement died at week three. The Sunday-midnight reset keeps every week meaningful.",
    date: "Coming soon",
    isoDate: "2026-06-08",
    category: "Game design",
    readingMinutes: 3,
    image: "/brand/scenes/scene-upset-dogs.webp",
    imageAlt: "Dog mascot looking annoyed",
    status: "upcoming",
  },
];

export const meta: MetaFunction = () => {
  const title = `Journal | ${brand.name}`;
  const description =
    "Notes from inside TallyTails. How the leaderboard works, the bets behind the rivalry mechanic, sourcing decisions, and what we'd do differently if we started over.";
  const url = `${brand.baseUrl}/blog`;
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

export default function BlogIndex() {
  useSeo({
    title: "Journal",
    description:
      "Notes from inside TallyTails. How the leaderboard works, the bets behind the rivalry mechanic, sourcing decisions, and what we'd do differently if we started over.",
    path: "/blog",
  });

  const livePosts = POSTS.filter((p) => p.status === "live");

  useJsonLd("blog", {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: `${brand.name} Journal`,
    url: `${brand.baseUrl}/blog`,
    description:
      "Notes from inside TallyTails. Leaderboard mechanics, brand bets, sourcing decisions, and post-mortems.",
    publisher: {
      "@type": "Organization",
      name: brand.name,
      url: brand.baseUrl,
    },
    blogPost: livePosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.isoDate,
      url: `${brand.baseUrl}/blog/${p.slug}`,
      image: `${brand.baseUrl}${p.image}`,
      author: { "@type": "Organization", name: brand.name },
    })),
  });

  useJsonLd(
    "breadcrumbs",
    breadcrumbList([
      { name: "Home", path: "/" },
      { name: "Journal", path: "/blog" },
    ]),
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8 md:py-20">
      <header className="mb-12 max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
          TallyTails Journal
        </span>
        <h1 className="mt-2 font-display text-4xl font-bold leading-tight tracking-[-0.04em] text-[var(--color-ink)] md:text-5xl">
          Notes from inside the storefront.
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--color-ink-soft)]">
          Leaderboard mechanics, the bets behind the brand, sourcing decisions,
          and post-mortems. Short, real, and written by the people actually
          building TallyTails.
        </p>
      </header>

      <ul className="grid gap-6 md:grid-cols-2">
        {POSTS.map((post, idx) => {
          const upcoming = post.status === "upcoming";
          const Tag = upcoming ? "div" : Link;
          const tagProps = upcoming
            ? {}
            : { to: "/blog" };
          return (
            <li key={post.slug}>
              <Tag
                {...(tagProps as { to: string })}
                className={`group block overflow-hidden rounded-3xl border border-[var(--color-line)] bg-[var(--color-surface)] transition ${
                  upcoming ? "opacity-70" : "hover:border-[var(--color-ink)]"
                }`}
              >
                <div className="aspect-[16/10] overflow-hidden bg-[var(--color-surface-2)]">
                  <img
                    src={post.image}
                    alt={post.imageAlt}
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx === 0 ? "high" : "auto"}
                    width="800"
                    height="500"
                    className={`h-full w-full object-cover transition-transform duration-500 ${
                      upcoming ? "" : "group-hover:scale-105"
                    }`}
                  />
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-ink-mute)]">
                    <span className="font-semibold uppercase tracking-[0.14em] text-[var(--color-ink)]">
                      {post.category}
                    </span>
                    <span aria-hidden>·</span>
                    <time dateTime={post.isoDate}>{post.date}</time>
                    <span aria-hidden>·</span>
                    <span>{post.readingMinutes} min read</span>
                    {upcoming && (
                      <span className="ml-auto rounded-full bg-[var(--color-surface-2)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--color-ink-soft)]">
                        Drafting
                      </span>
                    )}
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-[-0.02em] text-[var(--color-ink)]">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">
                    {post.excerpt}
                  </p>
                  {!upcoming && (
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-ink)]">
                      Read the post
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
                        <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  )}
                </div>
              </Tag>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
