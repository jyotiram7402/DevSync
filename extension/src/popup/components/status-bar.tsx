import { Wifi, WifiOff } from "lucide-react";

import type { ConnectionStatus, SyncState, WorkspaceInfo } from "@ext/types";
import { relativeTime } from "@ext/utils/format";
import { cn } from "@ext/utils/cn";

const SYNC_LABEL: Record<SyncState["status"], string> = {
  idle: "Ready",
  syncing: "Syncing…",
  synced: "Synced",
  error: "Sync issue",
  offline: "Offline",
};

/** Compact workspace + connection + sync status row. */
export function StatusBar({
  workspace,
  connection,
  sync,
}: {
  workspace: WorkspaceInfo | null;
  connection: ConnectionStatus;
  sync: SyncState;
}) {
  const online = connection === "online";
  return (
    <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="size-2 shrink-0 rounded-full bg-brand" aria-hidden="true" />
        <span className="truncate text-xs font-medium" title={workspace?.name ?? undefined}>
          {workspace?.name ?? "No workspace"}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
        <span>
          {SYNC_LABEL[sync.status]}
          {sync.lastSyncedAt ? ` · ${relativeTime(sync.lastSyncedAt)}` : ""}
        </span>
        <span
          className={cn("inline-flex items-center", online ? "text-emerald-500" : "text-amber-500")}
          title={online ? "Online" : "Offline"}
        >
          {online ? (
            <Wifi className="size-3.5" aria-label="Online" />
          ) : (
            <WifiOff className="size-3.5" aria-label="Offline" />
          )}
        </span>
      </div>
    </div>
  );
}
