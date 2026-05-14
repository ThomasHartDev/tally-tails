import type { MetaFunction } from "react-router";
import { Link } from "react-router";
import { brand } from "~/brand";
import { breadcrumbList, useJsonLd, useSeo } from "~/lib/seo";

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;     // human-readable
  isoDate: string;  // ISO 8601 for JSON-LD
  category: string;
  readingMinutes: number;
  image: string;    // public/ path
  imageAlt: string;
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
    image: "/blog/how-the-tally-works.webp",
    imageAlt: "TallyTails leaderboard counter sketch",
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
    image: "/blog/why-cats-vs-dogs.webp",
    imageAlt: "Cat and dog mascot sketches face to face",
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
    blogPost: POSTS.map((p) => ({
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
    ])
  );

  return (
    <div className="blog">
      <header className="blog-hero container">
        <span className="eyebrow">TallyTails Journal</span>
        <h1 className="blog-hero-title">Notes from inside the storefront.</h1>
        <p className="blog-hero-sub">
          Leaderboard mechanics, the bets behind the brand, sourcing
          decisions, and post-mortems. Short, real, and written by the people
          actually building TallyTails.
        </p>
      </header>

      <ul className="blog-list container">
        {POSTS.map((post, idx) => (
          <li className="blog-card" key={post.slug}>
            <Link to="/blog" className="blog-card-link">
              <div className="blog-card-image-wrap">
                <img
                  src={post.image}
                  alt={post.imageAlt}
                  className="blog-card-image"
                  loading={idx === 0 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  width="800"
                  height="1000"
                />
              </div>
              <div className="blog-card-body">
                <div className="blog-card-meta">
                  <span className="blog-card-category">{post.category}</span>
                  <span className="blog-card-dot" aria-hidden="true">
                    ·
                  </span>
                  <time dateTime={post.isoDate}>{post.date}</time>
                  <span className="blog-card-dot" aria-hidden="true">
                    ·
                  </span>
                  <span>{post.readingMinutes} min read</span>
                </div>
                <h2 className="blog-card-title">{post.title}</h2>
                <p className="blog-card-excerpt">{post.excerpt}</p>
                <span className="blog-card-cta" aria-hidden="true">
                  Read the post
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
