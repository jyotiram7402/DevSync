/**
 * Pure string & number formatting helpers.
 *
 * No side effects, no external dependencies — safe and trivial to test. Used
 * for presentation concerns like truncating previews and pluralizing counts.
 */

/** Truncate text to `maxLength` characters, appending a suffix when cut. */
export function truncate(text: string, maxLength: number, suffix = "…"): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.slice(0, Math.max(0, maxLength - suffix.length)).trimEnd() + suffix;
}

/** Uppercase the first character of a string. */
export function capitalize(text: string): string {
  if (text.length === 0) {
    return text;
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Format a count with its singular/plural noun, e.g. "1 snippet" / "3 snippets". */
export function pluralize(count: number, singular: string, plural?: string): string {
  const word = count === 1 ? singular : (plural ?? `${singular}s`);
  return `${count} ${word}`;
}

/** Format a number using the locale's grouping, e.g. "1,234". */
export function formatNumber(value: number, locale = "en-US"): string {
  return new Intl.NumberFormat(locale).format(value);
}

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB", "PB"] as const;

/** Human-readable byte size, e.g. "1.5 KB". */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes <= 0) {
    return "0 B";
  }
  const k = 1024;
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), BYTE_UNITS.length - 1);
  const unit = BYTE_UNITS[index] ?? "B";
  const value = bytes / Math.pow(k, index);
  return `${parseFloat(value.toFixed(Math.max(0, decimals)))} ${unit}`;
}
