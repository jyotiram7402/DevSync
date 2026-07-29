import type { MetadataRoute } from "next";

/**
 * Web App Manifest.
 *
 * Makes DevSync installable as a standalone app ("Add to Home Screen") on
 * mobile and desktop. Next.js serves this at /manifest.webmanifest and injects
 * the <link rel="manifest"> tag on every page automatically.
 *
 * `display: "standalone"` is what makes the installed icon open fullscreen,
 * without the browser address bar — so it feels like a native app.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DevSync — Copy Once. Debug Anywhere.",
    short_name: "DevSync",
    description:
      "Sync your errors, logs, and snippets across every device you code on. Copy on one machine, paste on another.",
    start_url: "/dashboard/snippets",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#5b5bd6",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/logo.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}
