"use client";

import { AlertTriangle, Check, CloudOff, Loader2, RefreshCw } from "lucide-react";

import { useClipboardSync } from "@/features/sync/hooks/use-clipboard-sync";
import type { SyncStatus } from "@/features/sync/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";

const LABELS: Record<SyncStatus, string> = {
  idle: "Sync ready",
  syncing: "Syncing…",
  synced: "Synced",
  error: "Sync error",
  offline: "Offline",
};

const ICONS: Record<SyncStatus, typeof Check> = {
  idle: RefreshCw,
  syncing: Loader2,
  synced: Check,
  error: AlertTriangle,
  offline: CloudOff,
};

const TONE: Record<SyncStatus, string> = {
  idle: "text-muted-foreground",
  syncing: "text-brand",
  synced: "text-emerald-600 dark:text-emerald-400",
  error: "text-destructive",
  offline: "text-amber-600 dark:text-amber-400",
};

/**
 * SyncStatusIndicator — a compact button that both reflects the current sync
 * state and triggers a manual clipboard sync. The live label is announced to
 * assistive technology via aria-live.
 */
export function SyncStatusIndicator({ className }: { className?: string }) {
  const { status, isSyncing, sync } = useClipboardSync();
  const Icon = ICONS[status];
  const label = LABELS[status];

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => void sync()}
      disabled={isSyncing}
      aria-label={`${label}. Sync clipboard now.`}
      className={cn("gap-1.5", className)}
    >
      <Icon className={cn(TONE[status], isSyncing && "animate-spin")} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
      <span aria-live="polite" className="sr-only">
        {label}
      </span>
    </Button>
  );
}
