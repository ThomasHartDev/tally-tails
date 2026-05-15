import {
  Outlet,
  useRouteError,
  useRouteLoaderData,
  isRouteErrorResponse,
  Links,
  Meta,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
  type LoaderFunctionArgs,
} from "react-router";
import { useEffect } from "react";
import { useNonce } from "@shopify/hydrogen";
import { CartProvider } from "~/lib/cart-context";
import { captureReferralFromUrl } from "~/lib/referral";
import { Header } from "~/components/Header";
import { Footer } from "~/components/Footer";
import { CartDrawer } from "~/components/CartDrawer";
import { AnalyticsScripts } from "~/components/AnalyticsScripts";
import { EmailDiscountPopup } from "~/components/EmailDiscountPopup";
import { TallyFloater } from "~/components/TallyFloater";
// Tailwind v4 compiles this file in-place. The `?inline` import returns
// the compiled CSS as a string so we can embed it in a <style> tag,
// dodging the dev-mode link/MIME bug documented in
// ~/.claude/projects/-root-projects-tally-tails/memory/feedback_vite_css_mime_in_dev.md.
import appCss from "~/styles/app.css?inline";

export async function loader({ context }: LoaderFunctionArgs) {
  // Expose only the public-safe env vars to the client. Server-only keys
  // (RESEND, STRIPE_SECRET, etc.) stay on the worker.
  return {
    publicEnv: {
      metaPixelId: context.env.PUBLIC_META_PIXEL_ID || undefined,
      klaviyoPublicKey: context.env.PUBLIC_KLAVIYO_PUBLIC_KEY || undefined,
      klaviyoListId: context.env.PUBLIC_KLAVIYO_WAITLIST_LIST_ID || undefined,
    },
  };
}

export function useRootData() {
  return useRouteLoaderData<typeof loader>("root");
}

export const links: LinksFunction = () => [
  { rel: "icon", type: "image/webp", href: "/brand/favicon.webp" },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
  // Google Fonts. CSS-only import so the browser fetches woff2 on its
  // own without a stylesheet round-trip on the server. Preconnect to
  // shave the first-byte time.
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Inter:wght@400;500;600;700&display=swap",
  },
];

export function Layout({ children }: { children?: React.ReactNode }) {
  const nonce = useNonce();
  const data = useRootData();
  const env = data?.publicEnv;

  return (
    <html lang="en" data-tribe="neutral">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: appCss }} />
        <AnalyticsScripts
          nonce={nonce}
          metaPixelId={env?.metaPixelId}
          klaviyoPublicKey={env?.klaviyoPublicKey}
        />
      </head>
      <body className="bg-[var(--color-bg)] text-[var(--color-ink)] antialiased">
        {children}
        <ScrollRestoration nonce={nonce} />
        <Scripts nonce={nonce} />
      </body>
    </html>
  );
}

export default function App() {
  const data = useRootData();
  const env = data?.publicEnv;
  // Capture ?ref=CODE into a 60-day cookie on first page paint so the
  // checkout action can attach it as a Shopify discount code.
  useEffect(() => {
    captureReferralFromUrl();
  }, []);
  return (
    <CartProvider>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
      <TallyFloater />
      <EmailDiscountPopup
        klaviyoPublicKey={env?.klaviyoPublicKey}
        klaviyoListId={env?.klaviyoListId}
      />
    </CartProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  let errorMessage = "Unknown error";
  let errorStatus = 500;

  if (isRouteErrorResponse(error)) {
    errorMessage = error?.data?.message ?? error.data;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  const is404 = errorStatus === 404;
  const mascot = is404
    ? "/brand/mascots/cat-shocked.webp"
    : "/brand/mascots/dog-shocked.webp";

  return (
    <div className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
      <img
        src={mascot}
        alt=""
        width="200"
        height="200"
        className="h-40 w-40 object-contain"
      />
      <span className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-mute)]">
        Error {errorStatus}
      </span>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-[-0.04em] text-[var(--color-ink)]">
        {is404 ? "Page not found" : "Something broke"}
      </h1>
      <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
        {is404
          ? "That URL didn't match anything in the catalog or the journal."
          : "We're looking at the logs. Try again in a minute."}
      </p>
      <a href="/" className="btn-primary mt-6">
        Back to the score
      </a>
      {!is404 && errorMessage && (
        <pre className="mt-8 max-w-full overflow-x-auto rounded-md bg-[var(--color-surface-2)] p-4 text-left text-xs text-[var(--color-ink-soft)]">
          {errorMessage}
        </pre>
      )}
    </div>
  );
}
