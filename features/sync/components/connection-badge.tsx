"use client";

import { Wifi, WifiOff } from "lucide-react";

import { useConnectionStatus } from "@/hooks/use-connection-status";
import type { ConnectionStatus } from "@/lib/realtime/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

const LABELS: Record<ConnectionStatus, string> = {
  idle: "Not connected",
  connecting: "Connecting…",
  connected: "Live",
  reconnecting: "Reconnecting…",
  disconnected: "Disconnected",
  error: "Connection error",
};

/**
 * ConnectionBadge — realtime connection state as a small pill. Reflects the
 * network + channel status; announces changes politely.
 */
export function ConnectionBadge({ className }: { className?: string }) {
  const { status, isOnline, isConnected } = useConnectionStatus();
  const label = isOnline ? LABELS[status] : "Offline";

  return (
    <Badge
      variant={isConnected ? "brand" : "muted"}
      className={cn("gap-1", className)}
      aria-live="polite"
    >
      {isOnline ? (
        <Wifi className="size-3" aria-hidden="true" />
      ) : (
        <WifiOff className="size-3" aria-hidden="true" />
      )}
      <span>{label}</span>
    </Badge>
  );
}
