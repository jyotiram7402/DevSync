"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  normalizeSnippetChange,
  snippetsChangeFilter,
} from "@/features/sync/services/realtime-sync-service";
import { useLiveChannel } from "@/hooks/use-live-channel";
import { workspaceChannel } from "@/lib/realtime/channels";
import type { RealtimeChannel } from "@/lib/realtime/types";

/** Changes that land together are answered with one re-render. */
const COALESCE_MS = 150;

/**
 * Keeps a server-rendered page live: subscribes to this workspace's snippet
 * changes through the shared Realtime Platform and triggers a router.refresh()
 * so server data re-renders without a manual reload. It also refreshes after a
 * reconnect, a return to the tab or the network coming back, when events may
 * have been missed. Renders nothing.
 *
 * Lists that can apply changes themselves use LiveSnippetFeed instead; this is
 * for pages whose rows only the server can build (the Library views).
 *
 * Each mount gets its own channel name: moving between pages releases the old
 * channel while the new one starts. With a shared name the new page would pick
 * up the channel that is still leaving and miss every update.
 */
export function LiveRefresh({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [instance] = useState(() => Math.random().toString(36).slice(2, 10));

  const refresh = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      router.refresh();
    }, COALESCE_MS);
  }, [router]);

  const configure = useCallback(
    (channel: RealtimeChannel) => {
      channel.on("postgres_changes", snippetsChangeFilter(workspaceId), (payload: unknown) => {
        if (normalizeSnippetChange(payload)) refresh();
      });
    },
    [workspaceId, refresh],
  );

  useLiveChannel({
    name: `${workspaceChannel(workspaceId)}:live-${instance}`,
    configure,
    onResync: refresh,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
