"use client";

import { useEffect, useRef } from "react";

import { useRealtime } from "@/hooks/use-realtime";
import type { BusEvent } from "@/lib/realtime/types";

/**
 * Subscribe to typed events on the platform EventBus. Pass `"*"` to observe
 * every event. The handler is kept in a ref so it never goes stale and callers
 * do not need to memoize it; the subscription is created once per name.
 */
export function useRealtimeEvent<T = unknown>(
  name: string,
  handler: (event: BusEvent<T>) => void,
): void {
  const { platform } = useRealtime();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!platform) return;
    return platform.events.on<T>(name, (event) => handlerRef.current(event));
  }, [platform, name]);
}
