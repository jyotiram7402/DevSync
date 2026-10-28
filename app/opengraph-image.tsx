import { ImageResponse } from "next/og";

import { BRAND_COLOR } from "@/components/pwa/app-icon-mark";

/**
 * The picture shown when a CopyAnywhere link is shared (chat apps, social):
 * the mark, the name, what it does, and the "arrived" item with the selection
 * wash — the app's signature moment.
 */
export const alt = "CopyAnywhere — copy on one device, paste on any other.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#FAFAFB",
          color: "#16171D",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: BRAND_COLOR,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width={48} height={48} viewBox="1.5 0 32 32" fill="none">
              <path d="M10 9 L17 16 L10 23" stroke="#FFFFFF" strokeWidth={2.75} strokeLinecap="round" strokeLinejoin="round" />
              <path
                d="M18 9 L25 16 L18 23"
                stroke="#FFFFFF"
                strokeWidth={2.75}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.55}
              />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 600, letterSpacing: -1 }}>CopyAnywhere</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 600, lineHeight: 1.1, letterSpacing: -2, maxWidth: 900 }}>
            Copy on one device. Paste on any other.
          </div>
          <div style={{ fontSize: 30, color: "#5C6070", maxWidth: 900 }}>
            Text, code, errors, links, images and files. In any browser, with nothing to install.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "20px 24px",
            borderRadius: 12,
            border: "2px solid #E4E5EB",
            background: "#EEEEFF",
            maxWidth: 760,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: BRAND_COLOR,
            }}
          />
          <div style={{ fontSize: 26, fontFamily: "monospace", color: "#16171D" }}>
            TypeError: Cannot read properties of undefined
          </div>
          <div style={{ fontSize: 22, color: "#4A4EE6", marginLeft: "auto" }}>Arrived</div>
        </div>
      </div>
    ),
    size,
  );
}
