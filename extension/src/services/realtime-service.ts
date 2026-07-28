import { getSupabaseClient } from "@ext/shared/supabase-client";
import type { ConnectionStatus } from "@ext/types";
import {
  normalizeSnippetChange,
  snippetsChangeFilter,
} from "@/features/sync/services/realtime-sync-service";

/**
 * Realtime — subscribes to the workspace's snippet changes on the SAME Supabase
 * Realtime backend the web Realtime Platform uses, reusing the shared
 * `snippetsChangeFilter` + `normalizeSnippetChange` primitives (no duplicated
 * change-parsing logic). Used from the popup (a document context); the MV3
 * service worker is intentionally not kept alive for a socket.
 */
export function subscribeSnippetChanges(workspaceId: string, onChange: () => void): () => void {
  const client = getSupabaseClient();
  const channel = client.channel(`ext:workspace:${workspaceId}`);

  channel
    .on("postgres_changes", snippetsChangeFilter(workspaceId), (payload: unknown) => {
      if (normalizeSnippetChange(payload)) onChange();
    })
    .subscribe();

  return () => {
    void client.removeChannel(channel);
  };
}

export function getConnectionStatus(): ConnectionStatus {
  return typeof navigator !== "undefined" && navigator.onLine === false ? "offline" : "online";
}
