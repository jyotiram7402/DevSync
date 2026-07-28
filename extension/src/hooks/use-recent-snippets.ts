import { useCallback, useEffect, useState } from "react";

import { listRecentSnippets } from "@ext/services/snippet-service";
import { subscribeSnippetChanges } from "@ext/services/realtime-service";
import type { RecentSnippet } from "@ext/types";

/**
 * Recent snippets for the popup. Reads directly (fast, RLS-scoped) and
 * live-updates via the shared realtime subscription while the popup is open.
 */
export function useRecentSnippets(workspaceId: string | null) {
  const [snippets, setSnippets] = useState<RecentSnippet[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!workspaceId) {
      setSnippets([]);
      return;
    }
    setLoading(true);
    setSnippets(await listRecentSnippets(workspaceId));
    setLoading(false);
  }, [workspaceId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!workspaceId) return;
    return subscribeSnippetChanges(workspaceId, () => {
      void load();
    });
  }, [workspaceId, load]);

  return { snippets, loading, reload: load };
}
