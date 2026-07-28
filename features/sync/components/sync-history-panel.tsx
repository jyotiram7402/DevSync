"use client";

import { History } from "lucide-react";
import { useState } from "react";

import { useSync } from "@/features/sync/hooks/use-sync";
import type { SyncEvent } from "@/features/sync/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/utils/cn";

function formatTime(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function HistoryRow({ event }: { event: SyncEvent }) {
  return (
    <li className="flex items-start justify-between gap-3 border-b py-2 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm">{event.message}</p>
        <p className="text-xs text-muted-foreground">{event.type}</p>
      </div>
      <time dateTime={event.at} className="shrink-0 text-xs tabular-nums text-muted-foreground">
        {formatTime(event.at)}
      </time>
    </li>
  );
}

/**
 * SyncHistoryPanel — a dialog listing this session's sync activity (in-memory,
 * newest first). No database reads: history is the live event log.
 */
export function SyncHistoryPanel({ className }: { className?: string }) {
  const { history, clearHistory } = useSync();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn("gap-1.5", className)}
        onClick={() => setOpen(true)}
      >
        <History className="size-4" aria-hidden="true" />
        <span className="hidden sm:inline">History</span>
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Sync history"
        description="Activity from the current session."
        className="max-w-lg"
      >
        {history.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">No sync activity yet.</p>
        ) : (
          <ul className="max-h-80 overflow-y-auto pr-1">
            {history.map((event) => (
              <HistoryRow key={event.id} event={event} />
            ))}
          </ul>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={clearHistory}
            disabled={history.length === 0}
          >
            Clear
          </Button>
          <Button type="button" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}
