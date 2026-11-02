import type { SyncChangeAction } from "@/features/sync/types";
import type { Json, Tables } from "@/types/database";

/**
 * RealtimeSyncService — pure helpers for the snippets postgres_changes stream.
 * Validates/normalizes incoming payloads (malformed payloads are rejected),
 * reads the full row a change carries, and builds the workspace-scoped
 * subscription filter.
 */
export const SNIPPETS_TABLE = "snippets";

export interface NormalizedChange {
  action: SyncChangeAction;
  id: string | null;
  commitTimestamp: string;
}

export function normalizeSnippetChange(payload: unknown): NormalizedChange | null {
  if (typeof payload !== "object" || payload === null) return null;
  const record = payload as {
    eventType?: unknown;
    new?: unknown;
    old?: unknown;
    commit_timestamp?: unknown;
  };

  const action: SyncChangeAction | null =
    record.eventType === "INSERT"
      ? "create"
      : record.eventType === "UPDATE"
        ? "update"
        : record.eventType === "DELETE"
          ? "delete"
          : null;
  if (!action) return null;

  const row = action === "delete" ? record.old : record.new;
  const id =
    typeof row === "object" && row !== null && typeof (row as { id?: unknown }).id === "string"
      ? (row as { id: string }).id
      : null;

  const commitTimestamp =
    typeof record.commit_timestamp === "string"
      ? record.commit_timestamp
      : new Date().toISOString();

  return { action, id, commitTimestamp };
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function stringOrNull(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function toJson(value: unknown): Json {
  return typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean" ||
    typeof value === "object"
    ? (value as Json)
    : null;
}

/**
 * The full snippets row a change carries (`replica identity full`), or null if
 * the payload has no usable row. Lenient on optional columns, strict on the
 * ones a list can't do without.
 */
export function readSnippetRow(value: unknown): Tables<"snippets"> | null {
  if (typeof value !== "object" || value === null) return null;
  const row = value as Record<string, unknown>;
  if (
    !isString(row.id) ||
    !isString(row.workspace_id) ||
    !isString(row.content) ||
    !isString(row.created_at) ||
    !isString(row.updated_at)
  ) {
    return null;
  }
  return {
    id: row.id,
    workspace_id: row.workspace_id,
    project_id: stringOrNull(row.project_id),
    title: stringOrNull(row.title),
    content: row.content,
    language: stringOrNull(row.language),
    type: isString(row.type) ? row.type : "text",
    tags: Array.isArray(row.tags) ? row.tags.filter(isString) : [],
    pinned: row.pinned === true,
    favorite: row.favorite === true,
    archived: row.archived === true,
    visibility: isString(row.visibility) ? row.visibility : "private",
    source_device_id: stringOrNull(row.source_device_id),
    created_by: stringOrNull(row.created_by),
    updated_by: stringOrNull(row.updated_by),
    metadata: toJson(row.metadata),
    created_at: row.created_at,
    updated_at: row.updated_at,
    deleted_at: stringOrNull(row.deleted_at),
  };
}

export interface SnippetChange extends NormalizedChange {
  /** The row after the change (INSERT/UPDATE); null for DELETE or when the payload carries no usable row. */
  row: Tables<"snippets"> | null;
}

/** A change together with the row it carries, so a list can apply it without asking the server. */
export function parseSnippetChange(payload: unknown): SnippetChange | null {
  const change = normalizeSnippetChange(payload);
  if (!change) return null;
  const row = change.action === "delete" ? null : readSnippetRow((payload as { new?: unknown }).new);
  return { ...change, row };
}

export function snippetsChangeFilter(workspaceId: string): {
  event: "*";
  schema: "public";
  table: string;
  filter: string;
} {
  return {
    event: "*",
    schema: "public",
    table: SNIPPETS_TABLE,
    filter: `workspace_id=eq.${workspaceId}`,
  };
}
