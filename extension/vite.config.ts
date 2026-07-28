import { fileURLToPath, URL } from "node:url";

import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import manifest from "./manifest.config";

/**
 * Vite build for the DevSync MV3 extension (@crxjs handles manifest emission,
 * HTML entries, and the service-worker/content-script bundling).
 *
 * `@ext/*` resolves extension source; `@/*` resolves shared, framework-agnostic
 * modules from the main repo (types, realtime + sync primitives) so the
 * extension reuses that infrastructure instead of duplicating it.
 */
export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      "@ext": fileURLToPath(new URL("./src", import.meta.url)),
      "@": fileURLToPath(new URL("..", import.meta.url)),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: { port: 5173 },
  },
  build: {
    // HTML entries (popup + options) are discovered from the manifest by
    // @crxjs; no explicit rollup inputs are needed.
    target: "esnext",
    sourcemap: true,
  },
});
