"use client";

import { useEffect, useState } from "react";

import { useRealtime } from "@/hooks/use-realtime";
import type { MetricsSnapshot } from "@/lib/realtime/metrics";
import type { ConnectionStatus } from "@/lib/realtime/types";

export interface ConnectionInfo {
  status: ConnectionStatus;
  isOnline: boolean;
  isConnected: boolean;
  /** Live metrics snapshot (null when the platform is unconfigured). */
  metrics: MetricsSnapshot | null;
}

/**
 * Rich connection view: aggregate status plus a live metrics snapshot
 * (reconnect count, latency, subscription/channel counts, connection duration).
 * For a lightweight status-only read, prefer useConnectionStatus.
 */
export function useConnection(): ConnectionInfo {
  const { platform, status, isOnline } = useRealtime();
  const [metrics, setMetrics] = useState<MetricsSnapshot | null>(
    () => platform?.metrics.snapshot() ?? null,
  );

  useEffect(() => {
    if (!platform) return;
    setMetrics(platform.metrics.snapshot());
    return platform.metrics.onChange(setMetrics);
  }, [platform]);

  return {
    status,
    isOnline,
    isConnected: isOnline && status === "connected",
    metrics,
  };
}
