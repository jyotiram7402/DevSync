import "server-only";

import { resolveContext } from "@/features/snippets/services/snippet-repository";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";

/**
 * Dashboard overview — the real numbers behind the home screen.
 *
 * Everything is derived from the signed-in user's workspace through RLS: exact
 * counts for the stat cards, a recent-sync feed, real device rows, and storage
 * usage summed from attachment metadata. No placeholder data.
 */
const NO_WORKSPACE: ActionError = {
  code: "NOT_FOUND",
  message: "No workspace found for your account.",
};

/** Items scanned when deriving per-kind counts, storage, and the recent feed. */
const SCAN_LIMIT = 1000;
const RECENT_LIMIT = 8;
const DEVICE_ONLINE_WINDOW_MS = 2 * 60_000;
/** Free-plan storage allowance (matches the snippet-attachments budget). */
export const STORAGE_LIMIT_BYTES = 1024 * 1024 * 1024;

export interface OverviewCounts {
  snippets: number;
  projects: number;
  collections: number;
  devices: number;
  images: number;
  links: number;
  docs: number;
  files: number;
}

export interface RecentSyncItem {
  id: string;
  name: string;
  kind: string;
  source: string | null;
  createdAt: string;
}

export interface OverviewDevice {
  id: string;
  name: string;
  os: string | null;
  browser: string | null;
  clientType: string;
  lastSeenAt: string | null;
  online: boolean;
}

export interface DashboardOverview {
  workspaceId: string;
  workspaceName: string;
  counts: OverviewCounts;
  recent: RecentSyncItem[];
  devices: OverviewDevice[];
  storageUsedBytes: number;
  storageLimitBytes: number;
  lastSyncedAt: string | null;
}

function metaString(metadata: unknown, key: string): string | null {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const value = (metadata as Record<string, unknown>)[key];
    if (typeof value === "string") return value;
  }
  return null;
}

function metaNumber(metadata: unknown, key: string): number {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const value = (metadata as Record<string, unknown>)[key];
    if (typeof value === "number" && Number.isFinite(value)) return value;
  }
  return 0;
}

export async function getDashboardOverview(): Promise<ActionResult<DashboardOverview>> {
  try {
    const client = await createServerSupabaseClient();
    const context = await resolveContext(client);
    if (!context) return err(NO_WORKSPACE);
    const { workspaceId } = context;

    const [workspaceRes, projectCountRes, collectionCountRes, deviceRes, scanRes] =
      await Promise.all([
        client.from("workspaces").select("name").eq("id", workspaceId).maybeSingle(),
        client
          .from("projects")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .eq("is_archived", false),
        client
          .from("collections")
          .select("id", { count: "exact", head: true })
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null),
        client
          .from("devices")
          .select("id,name,os,browser,client_type,last_seen_at")
          .is("revoked_at", null)
          .order("last_seen_at", { ascending: false, nullsFirst: false })
          .limit(10),
        client
          .from("snippets")
          .select("id,title,content,created_at,metadata")
          .eq("workspace_id", workspaceId)
          .is("deleted_at", null)
          .eq("archived", false)
          .order("created_at", { ascending: false })
          .limit(SCAN_LIMIT),
      ]);

    const rows = scanRes.data ?? [];

    const counts: OverviewCounts = {
      snippets: 0,
      projects: projectCountRes.count ?? 0,
      collections: collectionCountRes.count ?? 0,
      devices: (deviceRes.data ?? []).length,
      images: 0,
      links: 0,
      docs: 0,
      files: 0,
    };

    let storageUsedBytes = 0;
    for (const row of rows) {
      const kind = metaString(row.metadata, "kind") ?? "text";
      if (kind === "image") counts.images += 1;
      else if (kind === "url") counts.links += 1;
      else if (kind === "pdf" || kind === "office") counts.docs += 1;
      else if (kind === "file" || kind === "archive" || kind === "audio" || kind === "video") {
        counts.files += 1;
      } else counts.snippets += 1; // text / code — the Snippets view
      if (metaString(row.metadata, "path")) {
        storageUsedBytes += metaNumber(row.metadata, "size");
      }
    }

    const recent: RecentSyncItem[] = rows.slice(0, RECENT_LIMIT).map((row) => ({
      id: row.id,
      name: row.title && row.title.length > 0 ? row.title : row.content,
      kind: metaString(row.metadata, "kind") ?? "text",
      source: metaString(row.metadata, "source"),
      createdAt: row.created_at,
    }));

    const now = Date.now();
    const devices: OverviewDevice[] = (deviceRes.data ?? []).map((row) => ({
      id: row.id,
      name: row.name,
      os: row.os,
      browser: row.browser,
      clientType: row.client_type,
      lastSeenAt: row.last_seen_at,
      online:
        row.last_seen_at !== null &&
        now - new Date(row.last_seen_at).getTime() < DEVICE_ONLINE_WINDOW_MS,
    }));

    return ok({
      workspaceId,
      workspaceName: workspaceRes.data?.name ?? "Personal Workspace",
      counts,
      recent,
      devices,
      storageUsedBytes,
      storageLimitBytes: STORAGE_LIMIT_BYTES,
      lastSyncedAt: rows[0]?.created_at ?? null,
    });
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as { message: unknown }).message)
        : "";
    // eslint-disable-next-line no-console
    console.error("[dashboard] overview error:", message);
    return err({ code: "INTERNAL", message: "Could not load your workspace overview." });
  }
}
