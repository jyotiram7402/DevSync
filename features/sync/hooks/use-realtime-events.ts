"use client";

import { useEffect, useRef } from "react";

import { useSync } from "@/features/sync/hooks/use-sync";
import type { SyncEvent } from "@/features/sync/types";

/**
 * Subscribe to live sync events. The callback is kept in a ref so callers do
 * not need to memoize it and never see a stale closure; the subscription
 * itself is created once per dispatcher.
 */
export function useRealtimeEvents(onEvent: (event: SyncEvent) => void): void {
  const { dispatcher } = useSync();
  const handlerRef = useRef(onEvent);
  handlerRef.current = onEvent;

  useEffect(() => {
    return dispatcher.on((event) => handlerRef.current(event));
  }, [dispatcher]);
}
