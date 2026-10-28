"use client";

import { useEffect } from "react";

/**
 * Root-level error boundary: it replaces the root layout, so it brings its own
 * <html>/<body> and can't rely on the app's styles or fonts. The colours follow
 * the app's tokens and the system's light or dark setting. Only the error's id
 * is logged, never its message.
 */
const CSS = `
  :root { color-scheme: light dark; --bg: #FAFAFB; --fg: #16171D; --muted: #5C6070; --btn: #4A4EE6; --btn-fg: #FFFFFF; }
  @media (prefers-color-scheme: dark) { :root { --bg: #0E0F13; --fg: #ECEDF2; --muted: #A3A7B5; --btn: #7B7FFF; --btn-fg: #0E0F13; } }
  body { margin: 0; min-height: 100vh; min-height: 100dvh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 1.5rem; text-align: center; background: var(--bg); color: var(--fg); font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  h1 { font-size: 1.5rem; font-weight: 600; margin: 0; }
  p { max-width: 28rem; font-size: 0.9375rem; line-height: 1.5; color: var(--muted); margin: 0; }
  button { cursor: pointer; min-height: 44px; border-radius: 0.5rem; border: 0; background: var(--btn); color: var(--btn-fg); padding: 0.625rem 1.25rem; font-size: 0.9375rem; font-weight: 500; }
  button:focus-visible { outline: 2px solid var(--btn); outline-offset: 2px; }
`;

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("App error", error.digest ?? error.name);
  }, [error]);

  return (
    <html lang="en">
      <head>
        <title>Something went wrong · CopyAnywhere</title>
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
      </head>
      <body>
        <h1>Something went wrong</h1>
        <p>CopyAnywhere couldn&apos;t load. Your snippets and files are safe in your account. Try again in a moment.</p>
        <button type="button" onClick={reset}>
          Try again
        </button>
      </body>
    </html>
  );
}
