/**
 * SearchRankingService — relevance scoring and ordering (pure).
 *
 * Because the snippet tsvector is unweighted and ranking across resource types
 * happens in one merged list, scoring is computed here from explicit signals
 * (exact/prefix/substring title matches, token coverage, tag matches, field
 * weight, pinned/favorite, recency). This keeps ranking transparent and easy to
 * evolve, and gives the "relevance" sort meaning without an ad-hoc SQL rank.
 */
import type { SearchResult, SearchSortKey } from "@/features/search/types";

const DAY_MS = 86_400_000;

function recencyBoost(updatedAt: string | null): number {
  if (!updatedAt) return 0;
  const age = Date.now() - new Date(updatedAt).getTime();
  if (Number.isNaN(age) || age < 0) return 0;
  if (age < 7 * DAY_MS) return 10;
  if (age < 30 * DAY_MS) return 5;
  if (age < 90 * DAY_MS) return 2;
  return 0;
}

export function scoreResult(result: SearchResult, tokens: string[], query: string): number {
  let score = 0;
  const q = query.trim().toLowerCase();
  const title = result.title.toLowerCase();

  if (q.length > 0) {
    if (title === q) score += 120;
    else if (title.startsWith(q)) score += 80;
    else if (title.includes(q)) score += 50;

    const covered = tokens.filter((token) => title.includes(token)).length;
    score += covered * 10;

    const lowerTags = result.tags.map((tag) => tag.toLowerCase());
    if (lowerTags.includes(q)) score += 45;
    else if (lowerTags.some((tag) => tokens.some((token) => tag.includes(token)))) score += 20;

    const excerpt = result.excerpt;
    if (excerpt && tokens.some((token) => excerpt.toLowerCase().includes(token))) score += 15;
  }

  if (result.matchedField === "title" || result.matchedField === "name") score += 15;
  if (result.pinned) score += 8;
  if (result.favorite) score += 5;
  score += recencyBoost(result.updatedAt);

  return score;
}

export function applyScores(
  results: SearchResult[],
  tokens: string[],
  query: string,
): SearchResult[] {
  return results.map((result) => ({ ...result, score: scoreResult(result, tokens, query) }));
}

function time(iso: string | null): number {
  if (!iso) return 0;
  const value = new Date(iso).getTime();
  return Number.isNaN(value) ? 0 : value;
}

/** Return a new array ordered by the requested sort key. */
export function rankResults(results: SearchResult[], sort: SearchSortKey): SearchResult[] {
  const copy = [...results];
  switch (sort) {
    case "updated":
      return copy.sort((a, b) => time(b.updatedAt) - time(a.updatedAt));
    case "created":
      return copy.sort((a, b) => time(b.createdAt) - time(a.createdAt));
    case "alphabetical":
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case "favorites":
      return copy.sort(
        (a, b) => Number(b.favorite) - Number(a.favorite) || time(b.updatedAt) - time(a.updatedAt),
      );
    case "pinned":
      return copy.sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || time(b.updatedAt) - time(a.updatedAt),
      );
    case "relevance":
    default:
      return copy.sort((a, b) => b.score - a.score || time(b.updatedAt) - time(a.updatedAt));
  }
}
