"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { normalizeSnippetChange } from "@/features/sync/services/realtime-sync-service";
import { useLiveChannel } from "@/hooks/use-live-channel";
import { spaceChannel } from "@/lib/realtime/channels";
import type { RealtimeChannel } from "@/lib/realtime/types";

/** Changes that land together are answered with one re-render. */
const COALESCE_MS = 150;

/**
 * Keeps a room live: subscribes to this space's item + member changes and
 * triggers a router.refresh() so shared content and the member count update
 * for everyone — also after a reconnect or a return to the tab, when events
 * may have been missed. Renders nothing.
 */
export function SpaceLiveRefresh({ spaceId }: { spaceId: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef<Set<string>>(new Set());
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
      const onChange = (payload: unknown) => {
        const change = normalizeSnippetChange(payload);
        if (!change) return;
        const key = `${change.id ?? "?"}:${change.commitTimestamp}`;
        if (seenRef.current.has(key)) return;
        if (seenRef.current.size > 500) seenRef.current.clear();
        seenRef.current.add(key);
        refresh();
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
    },
    [spaceId, refresh],
  );

  useLiveChannel({
    name: `${spaceChannel(spaceId)}:feed-${instance}`,
    configure,
    enabled: Boolean(spaceId),
    onResync: refresh,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
