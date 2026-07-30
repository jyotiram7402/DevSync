import type { MetadataRoute } from "next";

/**
 * Next.js's Manifest type does not yet model `share_target` or `id`, which are
 * valid manifest members. Extend it rather than casting, so the rest of the
 * object stays fully type-checked. Next serializes this object straight to JSON.
 */
type ExtendedManifest = MetadataRoute.Manifest & {
  id?: string;
  share_target?: {
    action: string;
    method: "GET" | "POST";
    enctype?: string;
    params: { title?: string; text?: string; url?: string };
  };
};

/**
 * Web App Manifest.
 *
 * Makes DevSync installable as a standalone app ("Install app" / "Add to Home
 * Screen") on Android and desktop. Next.js serves this at
 * /manifest.webmanifest and injects <link rel="manifest"> automatically.
 *
 * `display: "standalone"` is what makes the installed icon open fullscreen,
 * without the browser address bar — so it feels like a native app.
 *
 * IMPORTANT: Android/Chrome only offers the real install prompt when a
 * 192x192 AND a 512x512 PNG icon are present (SVG alone is not enough), and a
 * service worker with a fetch handler is registered (see public/sw.js).
 *
 * `share_target` registers DevSync in the Android share sheet, so "Share →
 * DevSync" from any app opens /dashboard/share with the shared text or link.
 */
export default function manifest(): ExtendedManifest {
  return {
    name: "DevSync — Copy Once. Debug Anywhere.",
    short_name: "DevSync",
    description:
      "Sync your errors, logs, and snippets across every device you code on. Copy on one machine, paste on another.",
    id: "/dashboard/home",
    start_url: "/dashboard/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#09090b",
    theme_color: "#09090b",
    categories: ["productivity", "developer", "utilities"],
    icons: [
      // PNG icons are required for installability on Android.
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Maskable variant so the launcher icon fills adaptive icon shapes.
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      // Vector fallback for browsers that prefer it.
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      { name: "Quick add", short_name: "Add", url: "/dashboard/share" },
      { name: "Images", short_name: "Images", url: "/dashboard/library/images" },
      { name: "Links", short_name: "Links", url: "/dashboard/library/links" },
    ],
    share_target: {
      action: "/dashboard/share",
      method: "GET",
      params: {
        title: "title",
        text: "text",
        url: "url",
      },
    },
  };
}
