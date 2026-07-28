"use client";

import { ConnectionIndicator } from "@/components/realtime/connection-indicator";
import { LatencyBadge } from "@/components/realtime/latency-badge";
import { cn } from "@/utils/cn";

/**
 * RealtimeStatus — compact composite of the connection indicator and latency
 * badge for status bars / debug surfaces.
 */
export function RealtimeStatus({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-3", className)}>
      <ConnectionIndicator showLabel />
      <LatencyBadge />
    </div>
  );
}
