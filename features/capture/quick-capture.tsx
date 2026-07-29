"use client";

import { FileUp, Paperclip, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ClipboardEvent, type DragEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  createPendingFileSnippetAction,
  createSnippetAction,
  finalizeFileSnippetAction,
} from "@/features/snippets/actions";
import { useSupabase } from "@/hooks/use-supabase";
import { snippetAttachmentPath } from "@/lib/storage/paths";
import { uploadFile } from "@/lib/storage/storage";
import { cn } from "@/utils/cn";

/** Matches the snippet-attachments bucket limit (10MB). */
const MAX_FILE_BYTES = 10 * 1024 * 1024;

function kindFromMime(mime: string): string {
  const m = mime.toLowerCase();
  if (m.startsWith("image/")) return "image";
  if (m.startsWith("audio/")) return "audio";
  if (m.startsWith("video/")) return "video";
  if (m === "application/pdf") return "pdf";
  if (m.includes("zip")) return "archive";
  if (
    m.includes("word") ||
    m.includes("excel") ||
    m.includes("spreadsheet") ||
    m.includes("presentation") ||
    m.includes("officedocument")
  ) {
    return "office";
  }
  if (m.startsWith("text/") || m === "application/json") return "text";
  return "file";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function QuickCapture({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const supabase = useSupabase();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewUrl = useMemo(
    () => (file && file.type.startsWith("image/") ? URL.createObjectURL(file) : null),
    [file],
  );
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // Reset when the dialog closes.
  useEffect(() => {
    if (!open) {
      setText("");
      setFile(null);
      setBusy(false);
      setDragOver(false);
    }
  }, [open]);

  function chooseFile(next: File | null) {
    if (next && next.size > MAX_FILE_BYTES) {
      toast.error(`File is too large (max ${formatBytes(MAX_FILE_BYTES)}).`);
      return;
    }
    setFile(next);
  }

  function handlePaste(event: ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(event.clipboardData.items).find((entry) => entry.kind === "file");
    const pasted = item?.getAsFile();
    if (pasted) {
      event.preventDefault();
      chooseFile(pasted);
    }
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    const dropped = event.dataTransfer.files[0];
    if (dropped) chooseFile(dropped);
  }

  async function submitText(): Promise<boolean> {
    const result = await createSnippetAction({ content: text.trim() });
    if (!result.ok) {
      toast.error(result.error.message);
      return false;
    }
    return true;
  }

  async function submitFile(target: File): Promise<boolean> {
    const mimeType = target.type || "application/octet-stream";
    const kind = kindFromMime(mimeType);

    const pending = await createPendingFileSnippetAction({
      name: target.name,
      mimeType,
      size: target.size,
      kind,
    });
    if (!pending.ok) {
      toast.error(pending.error.message);
      return false;
    }

    const { snippetId, workspaceId } = pending.data;
    const path = snippetAttachmentPath(workspaceId, snippetId, target.name);
    const uploaded = await uploadFile(supabase, {
      bucket: "snippet-attachments",
      path,
      file: target,
      contentType: mimeType,
    });
    if (!uploaded.ok) {
      toast.error(uploaded.error.message);
      return false;
    }

    const finalized = await finalizeFileSnippetAction(snippetId, {
      bucket: "snippet-attachments",
      path: uploaded.data.path,
      mimeType,
      size: target.size,
      kind,
    });
    if (!finalized.ok) {
      toast.error(finalized.error.message);
      return false;
    }
    return true;
  }

  async function handleSubmit() {
    if (busy) return;
    if (!file && text.trim().length === 0) {
      toast.error("Paste text or attach a file first.");
      return;
    }
    setBusy(true);
    const ok = file ? await submitFile(file) : await submitText();
    setBusy(false);
    if (ok) {
      toast.success(file ? "File synced to DevSync." : "Synced to DevSync.");
      onClose();
      router.refresh();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Quick capture"
      description="Paste text, or drop / attach a file — it syncs to all your devices."
      className="max-w-lg"
    >
      <div
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          "flex flex-col gap-3 rounded-lg border border-dashed p-1 transition-colors",
          dragOver ? "border-brand bg-brand/5" : "border-transparent",
        )}
      >
        {file ? (
          <div className="flex items-center gap-3 rounded-md border bg-muted/40 p-3">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="" className="size-12 rounded object-cover" />
            ) : (
              <span className="flex size-12 items-center justify-center rounded bg-muted text-muted-foreground">
                <Paperclip className="size-5" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{file.name}</p>
              <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Remove file"
              onClick={() => chooseFile(null)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : (
          <Textarea
            autoFocus
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Paste or type anything… (or paste an image / drop a file)"
            rows={5}
            aria-label="Content to capture"
          />
        )}

        <input
          ref={fileInputRef}
          type="file"
          hidden
          onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
        />
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={busy}
        >
          <FileUp className="size-4" aria-hidden="true" />
          Attach file
        </Button>
        <Button type="button" onClick={() => void handleSubmit()} disabled={busy} aria-busy={busy}>
          {busy ? "Syncing…" : file ? "Sync file" : "Sync"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
