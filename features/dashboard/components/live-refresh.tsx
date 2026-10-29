"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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
 *
 * Each mount gets its own channel name: Home, Snippets and Library all mount
 * one, and moving between them releases the old channel while the new one
 * starts. With a shared name the new page would pick up the channel that is
 * still leaving and miss every update.
 */
export function LiveRefresh({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [instance] = useState(() => Math.random().toString(36).slice(2, 10));

  const configure = (channel: RealtimeChannel) => {
    channel.on("postgres_changes", snippetsChangeFilter(workspaceId), (payload: unknown) => {
      if (!normalizeSnippetChange(payload)) return;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 400);
    });
  };

  useRealtimeChannel({ name: `${workspaceChannel(workspaceId)}:live-${instance}`, configure });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
