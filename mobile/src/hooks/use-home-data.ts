import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

import { QUERY_KEYS } from "~/lib/query-client";
import { useAuth } from "~/providers/auth-provider";
import { useConnection } from "~/hooks/use-connection";
import { subscribeSnippetChanges } from "~/services/realtime-service";
import { listFavorites, listPinned, listRecent } from "~/services/snippet-service";
import { flushQueue } from "~/services/sync-manager";
import { getActiveWorkspace } from "~/services/workspace-service";
import type { RecentItem, WorkspaceInfo } from "~/types";

export function useWorkspace() {
  const { user } = useAuth();
  return useQuery<WorkspaceInfo | null>({
    queryKey: QUERY_KEYS.workspace,
    queryFn: getActiveWorkspace,
    enabled: Boolean(user),
  });
}

/**
 * Aggregates the home screen's data: workspace, recent/favorite/pinned items,
 * live realtime invalidation, and offline-queue flush on reconnect.
 */
export function useHomeData() {
  const workspaceQuery = useWorkspace();
  const workspaceId = workspaceQuery.data?.id ?? null;
  const queryClient = useQueryClient();
  const { online } = useConnection();

  const recent = useQuery<RecentItem[]>({
    queryKey: ["snippets", "recent", workspaceId],
    queryFn: () => (workspaceId ? listRecent(workspaceId) : Promise.resolve([])),
    enabled: Boolean(workspaceId),
  });
  const favorites = useQuery<RecentItem[]>({
    queryKey: ["snippets", "favorites", workspaceId],
    queryFn: () => (workspaceId ? listFavorites(workspaceId) : Promise.resolve([])),
    enabled: Boolean(workspaceId),
  });
  const pinned = useQuery<RecentItem[]>({
    queryKey: ["snippets", "pinned", workspaceId],
    queryFn: () => (workspaceId ? listPinned(workspaceId) : Promise.resolve([])),
    enabled: Boolean(workspaceId),
  });

  useEffect(() => {
    if (!workspaceId) return;
    return subscribeSnippetChanges(workspaceId, () => {
      void queryClient.invalidateQueries({ queryKey: ["snippets"] });
    });
  }, [workspaceId, queryClient]);

  useEffect(() => {
    if (!online || !workspaceId) return;
    void flushQueue(workspaceId).then(() =>
      queryClient.invalidateQueries({ queryKey: ["snippets"] }),
    );
  }, [online, workspaceId, queryClient]);

  return {
    workspace: workspaceQuery.data ?? null,
    workspaceId,
    recent,
    favorites,
    pinned,
    online,
    loading: workspaceQuery.isLoading || recent.isLoading,
    refetchAll: () => queryClient.invalidateQueries({ queryKey: ["snippets"] }),
  };
}
