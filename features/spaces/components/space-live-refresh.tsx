"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { normalizeSnippetChange } from "@/features/sync/services/realtime-sync-service";
import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import { spaceChannel } from "@/lib/realtime/channels";
import type { RealtimeChannel } from "@/lib/realtime/types";

/**
 * Keeps a room live: subscribes to this space's item + member changes and
 * triggers a debounced router.refresh() so shared content and the member count
 * update for everyone within about a second. Renders nothing.
 */
export function SpaceLiveRefresh({ spaceId }: { spaceId: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const configure = (channel: RealtimeChannel) => {
    const onChange = (payload: unknown) => {
      const change = normalizeSnippetChange(payload);
      if (!change) return;
      const key = `${change.id ?? "?"}:${change.commitTimestamp}`;
      if (seenRef.current.has(key)) return;
      if (seenRef.current.size > 500) seenRef.current.clear();
      seenRef.current.add(key);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => router.refresh(), 250);
    };

    channel.on(
      "postgres_changes",
      { event: "*" as const, schema: "public", table: "space_items", filter: `space_id=eq.${spaceId}` },
      onChange,
    );
    channel.on(
      "postgres_changes",
      { event: "*" as const, schema: "public", table: "space_members", filter: `space_id=eq.${spaceId}` },
      onChange,
    );
  };

  useRealtimeChannel({ name: `${spaceChannel(spaceId)}:feed`, configure, enabled: Boolean(spaceId) });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
