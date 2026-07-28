"use client";

import { useRealtime } from "@/hooks/use-realtime";
import type { ConnectionStatus } from "@/lib/realtime/types";

export interface ConnectionState {
  status: ConnectionStatus;
  isOnline: boolean;
  isConnected: boolean;
}

/**
 * Realtime connection status for status indicators. `isConnected` is true only
 * when the network is up AND a channel is actively subscribed.
 */
export function useConnectionStatus(): ConnectionState {
  const { status, isOnline } = useRealtime();
  return {
    status,
    isOnline,
    isConnected: isOnline && status === "connected",
  };
}
