/**
 * Client-side mirror of the database retention policy (migration 0011).
 *
 * Items are soft-deleted `RETENTION_DAYS` after creation unless pinned or
 * favorited, then permanently purged the same number of days later. Keep this
 * value in sync with `public.devsync_retention_days()` in SQL.
 */
export const RETENTION_DAYS = 7;

const DAY_MS = 86_400_000;

/** Whole days left before an item expires (0 = expiring today, never negative). */
export function daysUntilExpiry(createdAt: string): number {
  const created = new Date(createdAt).getTime();
  if (Number.isNaN(created)) return RETENTION_DAYS;
  const elapsedDays = (Date.now() - created) / DAY_MS;
  return Math.max(0, Math.ceil(RETENTION_DAYS - elapsedDays));
}

/** Short label for an item's retention state. Pinned/favorited items are kept. */
export function expiryLabel(createdAt: string, kept: boolean): string {
  if (kept) return "Kept";
  const days = daysUntilExpiry(createdAt);
  if (days === 0) return "Expires today";
  if (days === 1) return "Expires tomorrow";
  return `Expires in ${days}d`;
}
