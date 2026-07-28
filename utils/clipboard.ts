/**
 * Copy text to the clipboard, resolving to whether it succeeded.
 *
 * Prefers the async Clipboard API in secure contexts and falls back to a
 * hidden-textarea + execCommand approach where it is unavailable or denied
 * (the "Copy" action must never dead-end — see the PRD/UX principles). Safe to
 * import anywhere: it no-ops and returns false outside the browser.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (
    typeof navigator !== "undefined" &&
    typeof window !== "undefined" &&
    navigator.clipboard &&
    window.isSecureContext
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the legacy fallback below.
    }
  }

  if (typeof document === "undefined") {
    return false;
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "absolute";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);
    return succeeded;
  } catch {
    return false;
  }
}
