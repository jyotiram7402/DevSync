"use client";

import { useConnectionStatus } from "@/hooks/use-connection-status";
import type { ConnectionStatus } from "@/lib/realtime/types";
import { cn } from "@/utils/cn";

const DOT: Record<ConnectionStatus, string> = {
  idle: "bg-muted-foreground",
  connecting: "bg-amber-500 animate-pulse",
  connected: "bg-emerald-500",
  reconnecting: "bg-amber-500 animate-pulse",
  disconnected: "bg-destructive",
  error: "bg-destructive",
};

const LABEL: Record<ConnectionStatus, string> = {
  idle: "Not connected",
  connecting: "Connecting",
  connected: "Connected",
  reconnecting: "Reconnecting",
  disconnected: "Disconnected",
  error: "Connection error",
};

/**
 * ConnectionIndicator — a status dot with an accessible label. Reflects the
 * platform's aggregate realtime connection state.
 */
export function ConnectionIndicator({
  showLabel = false,
  className,
}: {
  showLabel?: boolean;
  className?: string;
}) {
  const { status, isOnline } = useConnectionStatus();
  const effective: ConnectionStatus = isOnline ? status : "disconnected";
  const label = isOnline ? LABEL[effective] : "Offline";

  return (
    <span className={cn("inline-flex items-center gap-1.5", className)} aria-live="polite">
      <span className={cn("size-2 rounded-full", DOT[effective])} aria-hidden="true" />
      <span className={cn("text-xs text-muted-foreground", !showLabel && "sr-only")}>{label}</span>
    </span>
  );
}
