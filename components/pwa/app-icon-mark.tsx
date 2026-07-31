/**
 * The CopyAnywhere app-icon mark, drawn with plain divs so it renders inside
 * Next.js `ImageResponse` (which supports only a subset of CSS — flexbox,
 * absolute positioning, solid colors and gradients).
 *
 * Design: brand gradient tile with two offset rounded squares — the "copy"
 * motif — connected by a dot, echoing content moving between devices.
 * Everything is sized relative to `size`, and the mark is inset ~22% so it
 * survives Android's maskable/adaptive-icon cropping.
 */
export function AppIconMark({ size }: { size: number }) {
  const unit = size / 100;
  const card = 40 * unit;
  const radius = 10 * unit;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #5B5FFF 0%, #8B5CF6 100%)",
      }}
    >
      <div
        style={{
          position: "relative",
          width: card * 1.55,
          height: card * 1.55,
          display: "flex",
        }}
      >
        {/* Back card (the "source") */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: card,
            height: card,
            borderRadius: radius,
            background: "rgba(255,255,255,0.45)",
            display: "flex",
          }}
        />
        {/* Front card (the "destination") */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            right: 0,
            width: card,
            height: card,
            borderRadius: radius,
            background: "#FFFFFF",
            display: "flex",
          }}
        />
      </div>
    </div>
  );
}
