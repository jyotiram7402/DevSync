/**
 * SearchIndexer — normalizes raw database rows into the uniform SearchResult
 * "document" shape the UI renders, including a highlight excerpt and matched
 * field detection. This is the seam a future real index (or AI embedding
 * pipeline) would populate; today it maps Postgres rows directly. Pure.
 */
import { SEARCH_ROUTE } from "@/features/search/constants";
import type { MatchedField, SearchResult } from "@/features/search/types";
import type { Tables } from "@/types/database";

const EXCERPT_LENGTH = 160;

function firstMatchIndex(text: string, tokens: string[]): number {
  const haystack = text.toLowerCase();
  let best = -1;
  for (const token of tokens) {
    const index = haystack.indexOf(token);
    if (index !== -1 && (best === -1 || index < best)) best = index;
  }
  return best;
}

/** Build a compact excerpt centered on the first matched token. */
export function buildExcerpt(
  content: string | null,
  tokens: string[],
  maxLength = EXCERPT_LENGTH,
): string | null {
  if (!content) return null;
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) return null;
  if (normalized.length <= maxLength) return normalized;

  const matchAt = firstMatchIndex(normalized, tokens);
  if (matchAt <= 0) return `${normalized.slice(0, maxLength).trim()}…`;

  const start = Math.max(0, matchAt - Math.floor(maxLength / 3));
  const end = Math.min(normalized.length, start + maxLength);
  const slice = normalized.slice(start, end).trim();
  return `${start > 0 ? "…" : ""}${slice}${end < normalized.length ? "…" : ""}`;
}

function textMatches(value: string | null, tokens: string[]): boolean {
  if (!value) return false;
  const haystack = value.toLowerCase();
  return tokens.some((token) => haystack.includes(token));
}

export function snippetToResult(row: Tables<"snippets">, tokens: string[]): SearchResult {
  const title = row.title && row.title.length > 0 ? row.title : "Untitled snippet";
  const matchedField: MatchedField = textMatches(row.title, tokens)
    ? "title"
    : row.tags.some((tag) => textMatches(tag, tokens))
      ? "tag"
      : textMatches(row.content, tokens)
        ? "content"
        : null;

  return {
    id: row.id,
    type: "snippet",
    title,
    subtitle: row.language,
    excerpt: buildExcerpt(row.content, tokens),
    href: `/dashboard/snippets/${row.id}`,
    score: 0,
    matchedField,
    language: row.language,
    tags: row.tags,
    color: null,
    icon: null,
    pinned: row.pinned,
    favorite: row.favorite,
    archived: row.archived,
    usageCount: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function projectToResult(row: Tables<"projects">, tokens: string[]): SearchResult {
  const matchedField: MatchedField = textMatches(row.name, tokens)
    ? "name"
    : textMatches(row.description, tokens)
      ? "description"
      : null;

  return {
    id: row.id,
    type: "project",
    title: row.name,
    subtitle: "Project",
    excerpt: buildExcerpt(row.description, tokens),
    href: `/dashboard/projects/${row.id}`,
    score: 0,
    matchedField,
    language: null,
    tags: [],
    color: row.color,
    icon: row.icon,
    pinned: row.is_pinned,
    favorite: row.is_favorite,
    archived: row.is_archived,
    usageCount: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function collectionToResult(row: Tables<"collections">, tokens: string[]): SearchResult {
  const matchedField: MatchedField = textMatches(row.name, tokens)
    ? "name"
    : textMatches(row.description, tokens)
      ? "description"
      : null;

  return {
    id: row.id,
    type: "collection",
    title: row.name,
    subtitle: "Collection",
    excerpt: buildExcerpt(row.description, tokens),
    href: `/dashboard/collections`,
    score: 0,
    matchedField,
    language: null,
    tags: [],
    color: row.color,
    icon: null,
    pinned: false,
    favorite: false,
    archived: false,
    usageCount: null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function tagToResult(tag: string, count: number): SearchResult {
  return {
    id: `tag:${tag}`,
    type: "tag",
    title: tag,
    subtitle: count === 1 ? "1 snippet" : `${count} snippets`,
    excerpt: null,
    href: `${SEARCH_ROUTE}?query=${encodeURIComponent(tag)}&types=snippet&tag=${encodeURIComponent(tag)}`,
    score: 0,
    matchedField: "tag",
    language: null,
    tags: [tag],
    color: null,
    icon: null,
    pinned: false,
    favorite: false,
    archived: false,
    usageCount: count,
    createdAt: null,
    updatedAt: null,
  };
}

/** Aggregate tag arrays into distinct tags matching the query, with usage counts. */
export function aggregateTags(tagArrays: string[][], tokens: string[], limit: number): SearchResult[] {
  const counts = new Map<string, number>();
  for (const tags of tagArrays) {
    for (const tag of tags) {
      const trimmed = tag.trim();
      if (trimmed.length === 0) continue;
      if (tokens.length > 0 && !textMatches(trimmed, tokens)) continue;
      counts.set(trimmed, (counts.get(trimmed) ?? 0) + 1);
    }
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tag, count]) => tagToResult(tag, count));
}
