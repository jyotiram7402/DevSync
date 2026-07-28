/**
 * Date & time formatting helpers.
 *
 * Pure, dependency-light wrappers over the Intl API. All timestamps in DevSync
 * are stored in UTC; these helpers render them in the viewer's locale. No
 * side effects, so they are trivial to test and safe to use anywhere.
 */

type DateInput = Date | string | number;

/** Format an absolute date, e.g. "Jul 22, 2026". */
export function formatDate(date: DateInput, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

/** Format an absolute date and time, e.g. "Jul 22, 2026, 3:04 PM". */
export function formatDateTime(date: DateInput, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

const DIVISIONS: ReadonlyArray<{ amount: number; unit: Intl.RelativeTimeFormatUnit }> = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
];

/** Format a relative time, e.g. "3 minutes ago" or "in 2 days". */
export function formatRelativeTime(date: DateInput, locale = "en-US"): string {
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  let duration = (new Date(date).getTime() - Date.now()) / 1000;

  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.unit);
    }
    duration /= division.amount;
  }

  return rtf.format(Math.round(duration), "year");
}
