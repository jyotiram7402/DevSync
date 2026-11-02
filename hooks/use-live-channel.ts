"use client";

import { useCallback, useEffect, useRef } from "react";

import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import type { RealtimeChannel } from "@/lib/realtime/types";

/** Why a catch-up with the server is needed. */
export type ResyncReason = "reconnected" | "visible" | "online";

/** A tab hidden at least this long may have missed events (its socket may have been frozen). */
const HIDDEN_RESYNC_MS = 10_000;
/** Give the socket a moment to reconnect before catching up. */
const ONLINE_SETTLE_MS = 1_500;

export interface UseLiveChannelOptions {
  name: string | null | undefined;
  configure: (channel: RealtimeChannel) => void;
  enabled?: boolean;
  /**
   * Called when events may have been missed: the subscription came back after
   * a drop, the tab is shown again after a while, or the network returned.
   * Callers fetch from the server then, so nothing stays stale until a reload.
   */
  onResync: (reason: ResyncReason) => void;
}

/**
 * A live channel that also knows when it may have missed something. Events
 * sent while a socket is down are gone for good, so every live list needs a
 * catch-up on recovery; this hook spots those moments so each list doesn't
 * have to. Use a name unique to the mount (see LiveRefresh).
 */
export function useLiveChannel({ name, configure, enabled = true, onResync }: UseLiveChannelOptions): void {
  const resyncRef = useRef(onResync);
  const subscribedRef = useRef(0);

  useEffect(() => {
    resyncRef.current = onResync;
  }, [onResync]);

  // The first SUBSCRIBED is the normal start; any later one means the channel
  // was re-joined after a drop.
  const handleStatus = useCallback((status: string) => {
    if (status !== "SUBSCRIBED") return;
    subscribedRef.current += 1;
    if (subscribedRef.current > 1) resyncRef.current("reconnected");
  }, []);

  useRealtimeChannel({ name, configure, enabled, onStatus: handleStatus });

  useEffect(() => {
    if (!enabled || !name) return;
    subscribedRef.current = 0;

    let hiddenAt: number | null = null;
    let onlineTimer: ReturnType<typeof setTimeout> | null = null;

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      const away = hiddenAt === null ? 0 : Date.now() - hiddenAt;
      hiddenAt = null;
      if (away >= HIDDEN_RESYNC_MS) resyncRef.current("visible");
    };
    const handleOnline = () => {
      if (onlineTimer) clearTimeout(onlineTimer);
      onlineTimer = setTimeout(() => {
        onlineTimer = null;
        resyncRef.current("online");
      }, ONLINE_SETTLE_MS);
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("online", handleOnline);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("online", handleOnline);
      if (onlineTimer) clearTimeout(onlineTimer);
    };
  }, [name, enabled]);
}
