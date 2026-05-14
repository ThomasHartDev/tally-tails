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
// All CSS is centralized here as ?inline imports and embedded as a single
// <style> tag in <head>. This dodges the dev-mode Vite bug where CSS at
// the `?url` or side-effect import path serves as a JS module instead of
// text/css (see memory/feedback_vite_css_mime_in_dev.md). Order matters
// for the cascade: tokens first, then global, then layout-level routes,
// then per-component. Each component CSS used to be imported in its own
// .tsx file with `import "./Foo.css"`; those imports are removed because
// they silently fail under the bug. Centralizing here keeps a single
// place to update if the upstream Vite/Hydrogen integration fixes the
// MIME issue.
import tokensCss from "~/styles/tokens.css?inline";
import globalCss from "~/styles/global.css?inline";
import indexRouteCss from "~/styles/routes/_index.css?inline";
import accountRouteCss from "~/styles/routes/account.css?inline";
import blogRouteCss from "~/styles/routes/blog.css?inline";
import shopHandleRouteCss from "~/styles/routes/shop.$handle.css?inline";
import headerCss from "~/components/Header.css?inline";
import footerCss from "~/components/Footer.css?inline";
import productCardCss from "~/components/ProductCard.css?inline";
import cartDrawerCss from "~/components/CartDrawer.css?inline";
import cartProgressBarCss from "~/components/CartProgressBar.css?inline";
import emailDiscountPopupCss from "~/components/EmailDiscountPopup.css?inline";
import reviewFormCss from "~/components/ReviewForm.css?inline";
import reviewListCss from "~/components/ReviewList.css?inline";
import starsCss from "~/components/Stars.css?inline";

const ALL_CSS = [
  tokensCss,
  globalCss,
  indexRouteCss,
  accountRouteCss,
  blogRouteCss,
  shopHandleRouteCss,
  headerCss,
  footerCss,
  productCardCss,
  cartDrawerCss,
  cartProgressBarCss,
  emailDiscountPopupCss,
  reviewFormCss,
  reviewListCss,
  starsCss,
].join("\n");

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
  // Stylesheets are inlined via <style> tags in the Layout below — see
  // the import comment for the dev-mode reasoning. Only favicons live
  // in the explicit links() export.
  { rel: "icon", type: "image/webp", href: "/brand/favicon.webp" },
  { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
];

export function Layout({ children }: { children?: React.ReactNode }) {
  const nonce = useNonce();
  const data = useRootData();
  const env = data?.publicEnv;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <style
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: ALL_CSS }}
        />
        <AnalyticsScripts
          nonce={nonce}
          metaPixelId={env?.metaPixelId}
          klaviyoPublicKey={env?.klaviyoPublicKey}
        />
      </head>
      <body>
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

  return (
    <div className="route-error">
      <h1>Oops</h1>
      <h2>{errorStatus}</h2>
      {errorMessage ? (
        <fieldset>
          <pre>{errorMessage}</pre>
        </fieldset>
      ) : null}
    </div>
  );
}
