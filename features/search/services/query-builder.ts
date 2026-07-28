/**
 * QueryBuilder — turns a raw user query into safe search inputs.
 *
 * Two strategies are supported downstream: PostgreSQL full-text search (for
 * snippet title+content via the generated tsvector) and ILIKE substring match
 * (projects, collections, tags, and the FTS fallback). This module owns the
 * text normalization for both, keeping query construction injection-safe and
 * in one place. Pure and dependency-light.
 */
import { FTS_MIN_QUERY_LENGTH } from "@/features/search/constants";

/** Strip characters that have meaning in PostgREST `or()`/ILIKE patterns. */
export function sanitizeIlikeTerm(term: string): string {
  return term
    .replace(/[,()*%\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Use FTS for longer, word-like queries; ILIKE prefix for short fragments. */
export function shouldUseFts(term: string): boolean {
  return sanitizeIlikeTerm(term).length >= FTS_MIN_QUERY_LENGTH;
}

/**
 * websearch_to_tsquery accepts free text safely (quotes, OR, negation) and
 * never throws on odd input, so we pass the trimmed term through unchanged.
 */
export function toWebSearchQuery(term: string): string {
  return term.trim();
}

/** Lowercased word tokens used for client-side ranking and highlighting. */
export function tokenize(term: string): string[] {
  return term
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.replace(/[^\p{L}\p{N}_-]/gu, ""))
    .filter((token) => token.length > 0);
}

/** True when the text contains every token (used for match detection). */
export function matchesAllTokens(text: string, tokens: string[]): boolean {
  if (tokens.length === 0) return false;
  const haystack = text.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}
