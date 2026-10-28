import { ImageResponse } from "next/og";

import { AppIconMark } from "@/components/pwa/app-icon-mark";

/** The 180×180 home-screen icon iPhone and iPad use (Next adds the apple-touch-icon link). */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<AppIconMark size={180} />, size);
}
