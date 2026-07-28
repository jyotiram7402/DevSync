"use client";

import { useEffect } from "react";
import { Activity } from "lucide-react";

import { useConnection } from "@/hooks/use-connection";
import { useRealtime } from "@/hooks/use-realtime";
import { cn } from "@/utils/cn";

function tone(ms: number | null): string {
  if (ms === null) return "text-muted-foreground";
  if (ms < 150) return "text-emerald-600 dark:text-emerald-400";
  if (ms < 500) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

/**
 * LatencyBadge — shows the most recent realtime round-trip latency. Mounting
 * this enables the platform's opt-in latency probe; unmounting disables it.
 */
export function LatencyBadge({ className }: { className?: string }) {
  const { platform } = useRealtime();
  const { metrics } = useConnection();

  useEffect(() => {
    if (!platform) return;
    platform.enableLatencyProbe();
    return () => platform.disableLatencyProbe();
  }, [platform]);

  const ms = metrics?.lastLatencyMs ?? null;

  return (
    <span
      className={cn("inline-flex items-center gap-1 text-xs tabular-nums", tone(ms), className)}
      aria-live="polite"
    >
      <Activity className="size-3" aria-hidden="true" />
      <span>{ms === null ? "— ms" : `${ms} ms`}</span>
    </span>
  );
}
