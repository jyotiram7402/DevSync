"use client";

import { useEffect, useRef } from "react";

import { useRealtime } from "@/hooks/use-realtime";
import type { SubscriptionDescriptor } from "@/lib/realtime/types";

/**
 * Register a logical subscription (postgres_changes / broadcast / presence) via
 * the platform's SubscriptionManager. The subscription is keyed by
 * `descriptor.key`; identical keys are de-duplicated. The descriptor is read
 * from a ref so callers need not memoize it, but binding handlers should be
 * stable (e.g. dispatch through refs) since they attach once per channel.
 */
export function useSubscription(
  descriptor: SubscriptionDescriptor | null,
  enabled = true,
): void {
  const { platform } = useRealtime();
  const descriptorRef = useRef(descriptor);
  descriptorRef.current = descriptor;

  const key = descriptor?.key ?? null;

  useEffect(() => {
    const current = descriptorRef.current;
    if (!platform || !current || !enabled || !key) return;
    return platform.subscriptions.subscribe(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, key, enabled]);
}
