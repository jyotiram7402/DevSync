"use client";

import { Check, ClipboardPaste } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useQuickCapture } from "@/features/capture/quick-capture-provider";
import { createTextCaptureAction } from "@/features/snippets/actions";
import { RETENTION_DAYS } from "@/lib/retention";

/**
 * Receives content from the Android share sheet (manifest `share_target`) and
 * lets the user check it before saving — a confirm step avoids accidental
 * saves and allows an edit first. Saved exactly as shared (no trimming).
 * Falls back to Quick add when nothing was shared.
 */
export function ShareReceiver({ shared }: { shared: string }) {
  const router = useRouter();
  const { open } = useQuickCapture();
  const [text, setText] = useState(shared);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    if (text.trim().length === 0) {
      toast.error("There's nothing to save.");
      return;
    }
    setBusy(true);
    const result = await createTextCaptureAction(text);
    setBusy(false);

    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setDone(true);
    toast.success("Saved. It's on your other devices now.");
    router.push(`/dashboard/snippets/${result.data.id}`);
  }

  if (shared.trim().length === 0) {
    return (
      <div className="flex flex-col items-start gap-4 rounded-lg border border-dashed border-border p-6">
        <p className="text-sm text-muted-foreground">
          Nothing was shared. Use Quick add to save text, a link or a file.
        </p>
        <Button type="button" onClick={() => open()}>
          <ClipboardPaste aria-hidden="true" />
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
        spellCheck={false}
        className="font-mono"
      />
      <p className="text-xs text-muted-foreground">
        Links go to Links and text to Snippets. Items stay for {RETENTION_DAYS} days unless you pin them.
      </p>
      <Button type="button" onClick={() => void save()} disabled={done} loading={busy} className="sm:w-fit">
        {done ? (
          <>
            <Check aria-hidden="true" />
            Saved
          </>
        ) : busy ? (
          "Saving…"
        ) : (
          "Save"
        )}
      </Button>
    </div>
  );
}
