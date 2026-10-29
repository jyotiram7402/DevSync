"use client";

import { RefreshCw, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { useConnectionStatus } from "@/hooks/use-connection-status";
import { useMounted } from "@/hooks/use-mounted";

/** Brief realtime hiccups are normal; only say "Reconnecting" if it lasts. */
const RECONNECTING_DELAY_MS = 3000;

/**
 * ConnectionBanner — a quiet strip under the top bar when this device is
 * offline, or when live updates have been reconnecting for a few seconds.
 * Reads the existing realtime status; it doesn't touch any subscription. The
 * polite live region is always present so the change is announced.
 */
export function ConnectionBanner() {
  const mounted = useMounted();
  const { status, isOnline } = useConnectionStatus();
  const reconnecting = isOnline && (status === "reconnecting" || status === "error");
  const [showReconnecting, setShowReconnecting] = useState(false);

  useEffect(() => {
    if (!reconnecting) {
      setShowReconnecting(false);
      return;
    }
    const timer = window.setTimeout(() => setShowReconnecting(true), RECONNECTING_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [reconnecting]);

  const offline = mounted && !isOnline;

  return (
    <div role="status" aria-live="polite">
      {offline ? (
        <p className="flex items-center justify-center gap-2 border-t border-border bg-muted px-4 py-1.5 text-center text-xs font-medium text-muted-foreground">
          <WifiOff className="size-3.5 shrink-0" aria-hidden="true" />
          You&apos;re offline. New items will appear when you&apos;re back online.
        </p>
      ) : mounted && showReconnecting ? (
        <p className="flex items-center justify-center gap-2 border-t border-border bg-warning/10 px-4 py-1.5 text-center text-xs font-medium text-warning">
          <RefreshCw className="size-3.5 shrink-0 animate-spin" aria-hidden="true" />
          Reconnecting to live updates…
        </p>
      ) : null}
    </div>
  );
}
