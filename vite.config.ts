import { defineConfig } from "vite";
import { hydrogen } from "@shopify/hydrogen/vite";
import { oxygen } from "@shopify/mini-oxygen/vite";
import { reactRouter } from "@react-router/dev/vite";

export default defineConfig({
  plugins: [hydrogen(), oxygen(), reactRouter()],
  resolve: {
    tsconfigPaths: true,
  },
  build: {
    // Allow a strict Content-Security-Policy
    // without inlining assets as base64.
    assetsInlineLimit: 0,
  },
  ssr: {
    optimizeDeps: {
      include: [
        "react-router > set-cookie-parser",
        "react-router > cookie",
        "react-router",
      ],
    },
  },
  server: {
    allowedHosts: [".tryhydrogen.dev"],
  },
});
