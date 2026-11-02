"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { normalizeSnippetChange } from "@/features/sync/services/realtime-sync-service";
import { useLiveChannel } from "@/hooks/use-live-channel";
import { userChannel } from "@/lib/realtime/channels";
import type { RealtimeChannel } from "@/lib/realtime/types";

/** Changes that land together are answered with one re-render. */
const COALESCE_MS = 150;

/**
 * Keeps the notes page/widget live: subscribes to this user's `notes` changes
 * on the shared realtime platform (same infra as the sync engine) and triggers
 * a router.refresh() — also after a reconnect or a return to the tab, when
 * events may have been missed. A seen-set drops duplicate deliveries; because
 * the refresh performs no write, there is no self-update loop. Renders nothing.
 */
export function NotesLiveRefresh({ userId }: { userId: string }) {
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
      channel.on(
        "postgres_changes",
        { event: "*" as const, schema: "public", table: "notes", filter: `user_id=eq.${userId}` },
        (payload: unknown) => {
          const change = normalizeSnippetChange(payload);
          if (!change) return;
          const key = `${change.id ?? "?"}:${change.commitTimestamp}`;
          if (seenRef.current.has(key)) return;
          if (seenRef.current.size > 500) seenRef.current.clear();
          seenRef.current.add(key);
          refresh();
        },
      );
    },
    [userId, refresh],
  );

  useLiveChannel({
    name: `${userChannel(userId)}:notes-${instance}`,
    configure,
    enabled: Boolean(userId),
    onResync: refresh,
  });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
