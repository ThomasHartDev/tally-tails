import { useEffect } from "react";
import { brand } from "~/brand";

export type SeoInput = {
  /** Page-specific title fragment. Final tag is `<frag> | <brand>` unless `absoluteTitle` is true. */
  title: string;
  /** Page-specific description, ~50–155 chars. */
  description: string;
  /** Path relative to brand.baseUrl. Defaults to current pathname. */
  path?: string;
  /** Page-specific OG image (relative or absolute). Defaults to brand.ogImage. */
  image?: string;
  /** Defaults to "website". Use "article" for blog posts, "product" for PDPs. */
  type?: "website" | "article" | "product";
  /** If true, use `title` as the full document title, no brand suffix. */
  absoluteTitle?: boolean;
  /** Optional noindex flag (drafts, demo-only routes). */
  noindex?: boolean;
};

function abs(url: string) {
  if (url.startsWith("http")) return url;
  return `${brand.baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function setMeta(attr: "name" | "property", key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(
    `meta[${attr}="${key}"]`
  );
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setLink(rel: string, href: string) {
  let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

/**
 * Update document title + meta tags for the current route. Runs client-side on
 * mount and whenever inputs change. Google Bot executes JS so this works for
 * search indexing; for stricter crawlers use the prerender setup in vite.config.
 */
export function useSeo(input: SeoInput): void {
  useEffect(() => {
    const path = input.path ?? window.location.pathname;
    const fullTitle = input.absoluteTitle
      ? input.title
      : `${input.title} | ${brand.name}`;
    document.title = fullTitle;

    const url = abs(path);
    const image = abs(input.image ?? brand.ogImage);

    setMeta("name", "description", input.description);
    setLink("canonical", url);

    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", input.description);
    setMeta("property", "og:url", url);
    setMeta("property", "og:type", input.type ?? "website");
    setMeta("property", "og:image", image);
    setMeta("property", "og:site_name", brand.name);

    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", input.description);
    setMeta("name", "twitter:image", image);

    setMeta(
      "name",
      "robots",
      input.noindex ? "noindex, follow" : "index, follow"
    );
  }, [
    input.title,
    input.description,
    input.path,
    input.image,
    input.type,
    input.absoluteTitle,
    input.noindex,
  ]);
}

/**
 * Inject (or replace) a `<script type="application/ld+json">` block in <head>
 * with the given JSON-LD payload. Each call uses a stable id so multiple
 * blocks (e.g. Product + BreadcrumbList) coexist without colliding.
 */
export function useJsonLd(id: string, data: Record<string, unknown>): void {
  useEffect(() => {
    const elId = `jsonld-${id}`;
    let el = document.getElementById(elId) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = elId;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
    return () => {
      el?.remove();
    };
  }, [id, data]);
}

/** Helper to assemble a BreadcrumbList JSON-LD object. */
export function breadcrumbList(
  items: Array<{ name: string; path: string }>
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: abs(it.path),
    })),
  };
}
