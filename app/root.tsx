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
import tokensCss from "~/styles/tokens.css?url";
import globalCss from "~/styles/global.css?url";

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
  // Tokens load before global so cascade order matches the legacy app.
  { rel: "stylesheet", href: tokensCss },
  { rel: "stylesheet", href: globalCss },
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
