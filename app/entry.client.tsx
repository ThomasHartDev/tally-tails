import { HydratedRouter } from "react-router/dom";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { NonceProvider } from "@shopify/hydrogen";

if (!window.location.origin.includes("webcache.googleusercontent.com")) {
  startTransition(() => {
    // Pull the nonce off whatever script the server already injected.
    const existingNonce = (document.querySelector("script[nonce]") as HTMLScriptElement | null)?.nonce;

    hydrateRoot(
      document,
      <StrictMode>
        <NonceProvider value={existingNonce}>
          <HydratedRouter />
        </NonceProvider>
      </StrictMode>,
    );
  });
}
