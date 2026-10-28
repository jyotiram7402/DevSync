/**
 * Guards for user-provided addresses and files.
 *
 * Saved links and shared files are user content, so they're checked before
 * they become an `href` or are opened in the browser.
 */

/** The address if it's a web (http/https) URL, otherwise null — never javascript:, data:, file:… */
export function safeWebUrl(value: string): string | null {
  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Host name for display, e.g. "github.com" (no "www."). */
export function displayHost(value: string): string | null {
  const url = safeWebUrl(value);
  if (!url) return null;
  return new URL(url).hostname.replace(/^www\./, "");
}

/**
 * Whether a stored file can open directly in the browser. Anything that could
 * run code when opened (HTML, SVG, XML, scripts…) is served as a download
 * instead, so a file shared into a room can't behave like a web page.
 */
export function isSafeToOpenInline(mimeType: string | null | undefined): boolean {
  const mime = (mimeType ?? "").toLowerCase().split(";")[0]?.trim() ?? "";
  if (mime === "image/svg+xml") return false;
  return (
    mime.startsWith("image/") ||
    mime.startsWith("video/") ||
    mime.startsWith("audio/") ||
    mime === "application/pdf" ||
    mime === "text/plain"
  );
}
