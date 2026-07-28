import type { SyncChangeAction } from "@/features/sync/types";

/**
 * RealtimeSyncService — pure helpers for the snippets postgres_changes stream.
 * Validates/normalizes incoming payloads (malformed payloads are rejected) and
 * builds the workspace-scoped subscription filter.
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
