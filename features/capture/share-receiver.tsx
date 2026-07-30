"use client";

import { Check, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createTextCaptureAction } from "@/features/snippets/actions";
import { useQuickCapture } from "@/features/capture/quick-capture-provider";
import { RETENTION_DAYS } from "@/lib/retention";

/**
 * Receives content from the Android share sheet (manifest `share_target`) and
 * lets the user confirm before syncing — a confirm step avoids accidental saves
 * and lets them edit first. Falls back to Quick Capture when nothing was shared.
 */
export function ShareReceiver({ shared }: { shared: string }) {
  const router = useRouter();
  const { open } = useQuickCapture();
  const [text, setText] = useState(shared);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function sync() {
    const content = text.trim();
    if (content.length === 0) {
      toast.error("Nothing to sync.");
      return;
    }
    setBusy(true);
    const result = await createTextCaptureAction(content);
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setDone(true);
    toast.success("Synced to DevSync.");
    router.push(`/dashboard/snippets/${result.data.id}`);
  }

  if (shared.trim().length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-xl border border-dashed p-6">
        <p className="text-sm text-muted-foreground">
          Nothing was shared. Use Quick add to sync text, a link, or a file.
        </p>
        <Button type="button" onClick={open}>
          <Zap className="size-4" aria-hidden="true" />
          Quick add
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <Textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
        aria-label="Shared content"
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Links are filed under Links, text under Snippets. Items auto-expire after {RETENTION_DAYS}{" "}
        days unless pinned.
      </p>
      <Button type="button" onClick={() => void sync()} disabled={busy || done} aria-busy={busy}>
        {done ? (
          <>
            <Check className="size-4" aria-hidden="true" />
            Synced
          </>
        ) : busy ? (
          "Syncing…"
        ) : (
          "Sync to DevSync"
        )}
      </Button>
    </div>
  );
}
