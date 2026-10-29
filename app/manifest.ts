import type { MetadataRoute } from "next";

import { THEME_COLOR } from "@/lib/theme";

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
 * Web App Manifest — makes CopyAnywhere installable ("Install app" / "Add to
 * Home Screen"). Next.js serves it at /manifest.webmanifest and adds the link.
 *
 * - `display: "standalone"` opens the installed app full screen, without the
 *   browser bars. No orientation lock: landscape and tablets work too.
 * - Android/Chrome only offers to install with a 192 and a 512 PNG icon (SVG
 *   alone is not enough); those are generated from the same mark as the logo
 *   and favicon (app/icon-*.png/route.tsx). The 512 icon is full-bleed with
 *   the mark inside the safe zone, so it also serves as the maskable icon.
 * - Colors follow the light theme; inside the app, ThemeColorSync keeps the
 *   title bar on the theme the person chose.
 * - `share_target` puts CopyAnywhere in the Android share sheet: sharing text
 *   or a link opens /dashboard/share with it filled in.
 */
export default function manifest(): ExtendedManifest {
  return {
    name: "CopyAnywhere",
    short_name: "CopyAnywhere",
    description: "Copy on one device, paste on any other: text, code, errors, links, images and files.",
    id: "/dashboard/home",
    start_url: "/dashboard/home",
    scope: "/",
    display: "standalone",
    background_color: THEME_COLOR.light,
    theme_color: THEME_COLOR.light,
    categories: ["productivity", "utilities", "developer"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    shortcuts: [
      {
        name: "Quick add",
        short_name: "Add",
        description: "Paste text or a link and save it",
        url: "/dashboard/share",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Snippets",
        short_name: "Snippets",
        url: "/dashboard/snippets",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Spaces",
        short_name: "Spaces",
        url: "/dashboard/spaces",
        icons: [{ src: "/icon-192.png", sizes: "192x192", type: "image/png" }],
      },
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
