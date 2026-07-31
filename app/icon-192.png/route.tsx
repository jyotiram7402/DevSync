import { ImageResponse } from "next/og";

import { AppIconMark } from "@/components/pwa/app-icon-mark";

/**
 * Generates the 192x192 PNG app icon at /icon-192.png.
 *
 * Android/Chrome requires real PNG icons (192 + 512) before it will offer
 * "Install app" — SVG alone is not enough. Rendering them from JSX keeps the
 * mark in sync with the brand and avoids committing binary assets.
 */
export const runtime = "edge";

export function GET() {
  return new ImageResponse(<AppIconMark size={192} />, { width: 192, height: 192 });
}
