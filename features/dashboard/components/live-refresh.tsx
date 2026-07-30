"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import { workspaceChannel } from "@/lib/realtime/channels";
import {
  normalizeSnippetChange,
  snippetsChangeFilter,
} from "@/features/sync/services/realtime-sync-service";
import type { RealtimeChannel } from "@/lib/realtime/types";

/**
 * Keeps a server-rendered page live: subscribes to this workspace's snippet
 * changes through the shared Realtime Platform and triggers a debounced
 * router.refresh() so server data (counts, recent sync, storage) re-renders
 * without a manual reload. Renders nothing.
 */
export function LiveRefresh({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const configure = (channel: RealtimeChannel) => {
    channel.on("postgres_changes", snippetsChangeFilter(workspaceId), (payload: unknown) => {
      if (!normalizeSnippetChange(payload)) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 400);
    });
  };

  useRealtimeChannel({ name: workspaceChannel(workspaceId), configure });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
