import { z } from "zod";

import {
  ALL_RESOURCE_TYPES,
  DEFAULT_SEARCH_SCOPE,
  DEFAULT_SEARCH_SORT,
  SEARCH_MAX_PAGE_SIZE,
  SEARCH_PAGE_SIZE,
} from "@/features/search/constants";
import type {
  SearchFilters,
  SearchParams,
  SearchResourceType,
} from "@/features/search/types";

/**
 * Global Search Platform — validation. A single `parseSearchParams` normalizes
 * untrusted input (URL query, client calls) into a fully-defaulted, safe
 * SearchParams. Never trusts raw strings; every field is coerced/whitelisted.
 */
const RESOURCE_TYPES = ["snippet", "project", "collection", "tag"] as const;

export const resourceTypeSchema = z.enum(RESOURCE_TYPES);
export const searchScopeSchema = z.enum(["global", "workspace"]);
export const searchSortSchema = z.enum([
  "relevance",
  "updated",
  "created",
  "alphabetical",
  "favorites",
  "pinned",
]);
export const visibilitySchema = z.enum(["private", "workspace", "public"]);

/** Coerce URL/user booleans without the "any non-empty string is true" trap. */
const boolParam = z.preprocess(
  (v) => (v === true || v === "true" ? true : v === false || v === "false" ? false : undefined),
  z.boolean().optional(),
);

const trimmed = z
  .string()
  .trim()
  .transform((s) => (s.length > 0 ? s : undefined))
  .optional()
  .catch(undefined);

const uuid = z.string().uuid().optional().catch(undefined);

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(10_000).catch(1),
  pageSize: z.coerce.number().int().min(1).max(SEARCH_MAX_PAGE_SIZE).catch(SEARCH_PAGE_SIZE),
});

export const searchFiltersSchema = z.object({
  projectId: uuid,
  collectionId: uuid,
  language: trimmed,
  tag: trimmed,
  createdBy: uuid,
  updatedBy: uuid,
  createdAfter: trimmed,
  createdBefore: trimmed,
  updatedAfter: trimmed,
  updatedBefore: trimmed,
  favorite: boolParam,
  pinned: boolParam,
  archived: boolParam,
  visibility: visibilitySchema.optional().catch(undefined),
  workspaceId: uuid,
});

function normalizeTypes(input: unknown): SearchResourceType[] {
  const raw = Array.isArray(input)
    ? input
    : typeof input === "string"
      ? input.split(",")
      : [];
  const valid = raw
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter((value): value is SearchResourceType =>
      (RESOURCE_TYPES as readonly string[]).includes(value),
    );
  const unique = Array.from(new Set(valid));
  return unique.length > 0 ? unique : [...ALL_RESOURCE_TYPES];
}

/** Build a SearchFilters object containing only defined keys (exact-optional safe). */
function normalizeFilters(raw: z.infer<typeof searchFiltersSchema>): SearchFilters {
  const filters: SearchFilters = {};
  if (raw.projectId !== undefined) filters.projectId = raw.projectId;
  if (raw.collectionId !== undefined) filters.collectionId = raw.collectionId;
  if (raw.language !== undefined) filters.language = raw.language;
  if (raw.tag !== undefined) filters.tag = raw.tag;
  if (raw.createdBy !== undefined) filters.createdBy = raw.createdBy;
  if (raw.updatedBy !== undefined) filters.updatedBy = raw.updatedBy;
  if (raw.createdAfter !== undefined) filters.createdAfter = raw.createdAfter;
  if (raw.createdBefore !== undefined) filters.createdBefore = raw.createdBefore;
  if (raw.updatedAfter !== undefined) filters.updatedAfter = raw.updatedAfter;
  if (raw.updatedBefore !== undefined) filters.updatedBefore = raw.updatedBefore;
  if (raw.favorite !== undefined) filters.favorite = raw.favorite;
  if (raw.pinned !== undefined) filters.pinned = raw.pinned;
  if (raw.archived !== undefined) filters.archived = raw.archived;
  if (raw.visibility !== undefined) filters.visibility = raw.visibility;
  if (raw.workspaceId !== undefined) filters.workspaceId = raw.workspaceId;
  return filters;
}

export interface RawSearchInput {
  query?: unknown;
  types?: unknown;
  scope?: unknown;
  sort?: unknown;
  page?: unknown;
  pageSize?: unknown;
  filters?: unknown;
}

/**
 * Normalize any untrusted search input into a safe, fully-defaulted SearchParams.
 * `filters` may be a nested object or flat query keys (URL params) — both work.
 */
export function parseSearchParams(input: RawSearchInput): SearchParams {
  const query = typeof input.query === "string" ? input.query.trim().slice(0, 200) : "";
  const types = normalizeTypes(input.types);
  const scope = searchScopeSchema.catch(DEFAULT_SEARCH_SCOPE).parse(input.scope);
  const sort = searchSortSchema.catch(DEFAULT_SEARCH_SORT).parse(input.sort);
  const { page, pageSize } = paginationSchema.parse({ page: input.page, pageSize: input.pageSize });

  const filterSource =
    input.filters && typeof input.filters === "object" ? input.filters : input;
  const rawFilters = searchFiltersSchema.safeParse(filterSource);
  const filters = rawFilters.success ? normalizeFilters(rawFilters.data) : {};

  return { query, types, scope, sort, page, pageSize, filters };
}
