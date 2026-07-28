import {
  normalizeSnippetChange,
  snippetsChangeFilter,
} from "@/features/sync/services/realtime-sync-service";
import { supabase } from "~/lib/supabase";

/**
 * Realtime — subscribes to workspace snippet changes on the SAME Supabase
 * Realtime backend the web Realtime Platform uses, reusing the shared
 * `snippetsChangeFilter` + `normalizeSnippetChange` primitives. This is NOT a
 * second realtime system — it consumes the existing one.
 */
export function subscribeSnippetChanges(workspaceId: string, onChange: () => void): () => void {
  const channel = supabase.channel(`mobile:workspace:${workspaceId}`);
  channel
    .on("postgres_changes", snippetsChangeFilter(workspaceId), (payload: unknown) => {
      if (normalizeSnippetChange(payload)) onChange();
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
