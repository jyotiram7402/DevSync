import { ImageResponse } from "next/og";

import { AppIconMark } from "@/components/pwa/app-icon-mark";

/**
 * Generates the 512x512 PNG app icon at /icon-512.png (also used as the
 * maskable icon, so the mark is inset to survive adaptive-icon cropping).
 */
export const runtime = "edge";
export const contentType = "image/png";

export function GET() {
  return new ImageResponse(<AppIconMark size={512} />, { width: 512, height: 512 });
}
