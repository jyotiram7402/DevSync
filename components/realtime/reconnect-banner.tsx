"use client";

import { RefreshCw } from "lucide-react";

import { useConnectionStatus } from "@/hooks/use-connection-status";
import { cn } from "@/utils/cn";

/**
 * ReconnectBanner — platform-level notice shown while the realtime connection
 * is recovering (network is up but the channel is reconnecting / errored).
 * Announced assertively so assistive tech surfaces the transient state.
 */
export function ReconnectBanner({ className }: { className?: string }) {
  const { status, isOnline } = useConnectionStatus();
  const recovering = isOnline && (status === "reconnecting" || status === "error");

  if (!recovering) return null;

  return (
    <div
      role="status"
      aria-live="assertive"
      className={cn(
        "flex items-center justify-center gap-2 bg-amber-500/10 px-4 py-1.5 text-xs font-medium text-amber-700 dark:text-amber-300",
        className,
      )}
    >
      <RefreshCw className="size-3.5 animate-spin" aria-hidden="true" />
      <span>Reconnecting to realtime…</span>
    </div>
  );
}
