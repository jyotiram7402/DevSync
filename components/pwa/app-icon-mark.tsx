/**
 * The CopyAnywhere app icon for generated PNGs (home screen, install, iPhone),
 * matching the logo in the app (components/shared/logo.tsx) and the favicon
 * (app/icon.svg): the double chevron in white on the brand color.
 *
 * Plain elements and inline SVG only, so it renders inside Next.js
 * `ImageResponse`. Full-bleed square (iOS and Android round the corners
 * themselves); the mark stays well inside the maskable safe zone.
 */
export const BRAND_COLOR = "#5B5FFF";

export function AppIconMark({ size }: { size: number }) {
  const mark = Math.round(size * 0.72);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_COLOR,
      }}
    >
      {/* viewBox shifted 1.5 units so the pair of chevrons sits optically centered. */}
      <svg width={mark} height={mark} viewBox="1.5 0 32 32" fill="none">
        <path
          d="M10 9 L17 16 L10 23"
          stroke="#FFFFFF"
          strokeWidth={2.75}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
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
  );
}
