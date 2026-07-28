"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary. This catches errors thrown in the root layout
 * itself, so it must render its own <html> and <body> and cannot rely on the
 * app's global styles or fonts. Styling is therefore inline and self-contained.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "1.5rem",
          textAlign: "center",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          backgroundColor: "#ffffff",
          color: "#09090b",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600, margin: 0 }}>A critical error occurred</h1>
        <p style={{ maxWidth: "28rem", fontSize: "0.875rem", color: "#71717a", margin: 0 }}>
          The application could not recover from an unexpected error. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            cursor: "pointer",
            borderRadius: "0.5rem",
            border: "none",
            backgroundColor: "#18181b",
            color: "#fafafa",
            padding: "0.5rem 1rem",
            fontSize: "0.875rem",
            fontWeight: 500,
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
