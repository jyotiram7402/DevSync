"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { normalizeSnippetChange } from "@/features/sync/services/realtime-sync-service";
import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import { userChannel } from "@/lib/realtime/channels";
import type { RealtimeChannel } from "@/lib/realtime/types";

/**
 * Keeps the notes page/widget live: subscribes to this user's `notes` changes
 * on the shared realtime platform (same infra as the sync engine) and triggers
 * a debounced router.refresh(). A seen-set drops duplicate deliveries; because
 * the refresh performs no write, there is no self-update loop. Renders nothing.
 */
export function NotesLiveRefresh({ userId }: { userId: string }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seenRef = useRef<Set<string>>(new Set());

  const configure = (channel: RealtimeChannel) => {
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

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => router.refresh(), 350);
      },
    );
  };

  useRealtimeChannel({ name: `${userChannel(userId)}:notes`, configure, enabled: Boolean(userId) });

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return null;
}
