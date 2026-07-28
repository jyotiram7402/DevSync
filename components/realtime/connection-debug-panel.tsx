"use client";

import { Bug, X } from "lucide-react";
import { useEffect, useState } from "react";

import { useConnection } from "@/hooks/use-connection";
import { useRealtime } from "@/hooks/use-realtime";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

function isDebugEnabled(): boolean {
  if (typeof process !== "undefined" && process.env.NEXT_PUBLIC_REALTIME_DEBUG === "1") return true;
  return typeof process !== "undefined" && process.env.NODE_ENV !== "production";
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-6 py-0.5">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  );
}

/**
 * ConnectionDebugPanel — an internal, dev-only overlay exposing live realtime
 * metrics. Renders nothing in production (unless explicitly enabled). Opening it
 * activates the latency probe so RTT is measured while inspecting.
 */
export function ConnectionDebugPanel({ className }: { className?: string }) {
  const { platform } = useRealtime();
  const { status, isOnline, metrics } = useConnection();
  const [open, setOpen] = useState(false);
  const [allowed] = useState(isDebugEnabled);

  useEffect(() => {
    if (!platform || !open) return;
    platform.enableLatencyProbe();
    return () => platform.disableLatencyProbe();
  }, [platform, open]);

  if (!allowed) return null;

  return (
    <div className={cn("fixed bottom-4 right-4 z-50", className)}>
      {open ? (
        <section
          aria-label="Realtime debug panel"
          className="w-64 rounded-lg border bg-card p-3 text-xs shadow-premium"
        >
          <header className="mb-2 flex items-center justify-between">
            <span className="font-semibold">Realtime</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="-mr-1 -mt-1 size-6"
              aria-label="Close debug panel"
              onClick={() => setOpen(false)}
            >
              <X className="size-3.5" />
            </Button>
          </header>
          <dl>
            <Row label="Status" value={status} />
            <Row label="Online" value={isOnline ? "yes" : "no"} />
            <Row label="Connects" value={metrics?.connectCount ?? 0} />
            <Row label="Reconnects" value={metrics?.reconnectCount ?? 0} />
            <Row label="Subscriptions" value={metrics?.subscriptionCount ?? 0} />
            <Row label="Channels" value={metrics?.channelCount ?? 0} />
            <Row label="Latency" value={metrics?.lastLatencyMs === null || metrics?.lastLatencyMs === undefined ? "—" : `${metrics.lastLatencyMs} ms`} />
            <Row label="Avg latency" value={metrics?.averageLatencyMs === null || metrics?.averageLatencyMs === undefined ? "—" : `${metrics.averageLatencyMs} ms`} />
            <Row label="Dropped" value={metrics?.droppedMessages ?? 0} />
            <Row label="Duplicates" value={metrics?.duplicateMessages ?? 0} />
            <Row label="Uptime" value={`${Math.round((metrics?.connectionDurationMs ?? 0) / 1000)}s`} />
          </dl>
        </section>
      ) : (
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open realtime debug panel"
          onClick={() => setOpen(true)}
        >
          <Bug className="size-4" />
        </Button>
      )}
    </div>
  );
}
