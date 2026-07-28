/**
 * FilterBuilder — canonical representation of active filters.
 *
 * Owns the (pure) translation between a SearchFilters object and its URL /
 * signature forms, plus small predicates used for client-side result kinds
 * (e.g. tags, which are aggregated rather than queried per-row). The DB-side
 * `.eq/.in/.gte` application lives in the repository where it can stay fully
 * typed against the Supabase query builder.
 */
import type { SearchFilters, SearchParams } from "@/features/search/types";

const FILTER_KEYS: ReadonlyArray<keyof SearchFilters> = [
  "projectId",
  "collectionId",
  "language",
  "tag",
  "createdBy",
  "updatedBy",
  "createdAfter",
  "createdBefore",
  "updatedAfter",
  "updatedBefore",
  "favorite",
  "pinned",
  "archived",
  "visibility",
  "workspaceId",
];

export function activeFilterCount(filters: SearchFilters): number {
  return FILTER_KEYS.reduce((count, key) => (filters[key] !== undefined ? count + 1 : count), 0);
}

export function hasActiveFilters(filters: SearchFilters): boolean {
  return activeFilterCount(filters) > 0;
}

/** Flatten filters into string query params (omitting undefined). */
export function filtersToQueryRecord(filters: SearchFilters): Record<string, string> {
  const record: Record<string, string> = {};
  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value === undefined) continue;
    record[key] = typeof value === "boolean" ? String(value) : value;
  }
  return record;
}

/** Stable signature for de-duplicating identical searches (perf). */
export function paramsSignature(params: SearchParams): string {
  return JSON.stringify({
    q: params.query,
    t: [...params.types].sort(),
    s: params.sort,
    sc: params.scope,
    p: params.page,
    ps: params.pageSize,
    f: filtersToQueryRecord(params.filters),
  });
}

/** Whether a within-range date predicate is satisfied (client-side kinds). */
export function withinDateRange(iso: string | null, after?: string, before?: string): boolean {
  if (!iso) return after === undefined && before === undefined;
  const time = new Date(iso).getTime();
  if (Number.isNaN(time)) return true;
  if (after !== undefined && time < new Date(after).getTime()) return false;
  if (before !== undefined && time > new Date(before).getTime()) return false;
  return true;
}
