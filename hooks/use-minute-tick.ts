"use client";

import { useSyncExternalStore } from "react";

/**
 * A shared once-a-minute tick, so relative times ("5m ago") stay fresh. One
 * interval serves every subscriber and stops when the last one unmounts.
 */
const listeners = new Set<() => void>();
let tick = 0;
let timer: number | undefined;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  if (timer === undefined) {
    timer = window.setInterval(() => {
      tick += 1;
      for (const notify of listeners) notify();
    }, 60_000);
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && timer !== undefined) {
      window.clearInterval(timer);
      timer = undefined;
    }
  };
}

export function useMinuteTick(): number {
  return useSyncExternalStore(
    subscribe,
    () => tick,
    () => 0,
  );
}
