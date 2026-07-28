/**
 * Global Search Platform — domain types.
 *
 * Designed to be resource-agnostic so future targets (users, workspaces,
 * devices, prompt history, commands) and future consumers (AI retrieval,
 * extensions, CLI) can plug in without reshaping the contract.
 */
import type { SnippetVisibility } from "@/features/snippets/types";

/** Resource types searchable today. */
export type SearchResourceType = "snippet" | "project" | "collection" | "tag";

/** Reserved for future search targets (architecture only, not yet queried). */
export const FUTURE_RESOURCE_TYPES = [
  "user",
  "workspace",
  "device",
  "prompt",
  "command",
] as const;
export type FutureResourceType = (typeof FUTURE_RESOURCE_TYPES)[number];

export type SearchScope = "global" | "workspace";

export type SearchSortKey =
  | "relevance"
  | "updated"
  | "created"
  | "alphabetical"
  | "favorites"
  | "pinned";

/** Which field produced the match (drives highlighting emphasis). */
export type MatchedField = "title" | "content" | "name" | "description" | "tag" | null;

/**
 * A single normalized search hit. Intentionally flat (not a discriminated
 * union) so result cards render uniformly; type-specific extras are optional.
 */
export interface SearchResult {
  id: string;
  type: SearchResourceType;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  href: string;
  score: number;
  matchedField: MatchedField;
  language: string | null;
  tags: string[];
  color: string | null;
  icon: string | null;
  pinned: boolean;
  favorite: boolean;
  archived: boolean;
  /** Usage count for aggregate results (e.g. a tag). */
  usageCount: number | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface SearchFilters {
  projectId?: string;
  collectionId?: string;
  language?: string;
  tag?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  favorite?: boolean;
  pinned?: boolean;
  archived?: boolean;
  visibility?: SnippetVisibility;
  /** Future multi-workspace scoping. */
  workspaceId?: string;
}

export interface SearchParams {
  query: string;
  types: SearchResourceType[];
  scope: SearchScope;
  sort: SearchSortKey;
  page: number;
  pageSize: number;
  filters: SearchFilters;
}

export type ResourceCounts = Record<SearchResourceType, number>;

export interface SearchResponse {
  query: string;
  scope: SearchScope;
  results: SearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  counts: ResourceCounts;
  tookMs: number;
}

export interface SearchSuggestion {
  type: SearchResourceType;
  label: string;
  href: string | null;
}

/** A term the user searched for (persisted locally). */
export interface RecentSearch {
  query: string;
  at: string;
}

/** A named, reusable search (persisted locally). */
export interface SavedSearch {
  id: string;
  name: string;
  query: string;
  types: SearchResourceType[];
  sort: SearchSortKey;
  filters: SearchFilters;
  createdAt: string;
}
