"use client";

import { Link2, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { kindFromMime, LIBRARY_ADD, type LibraryType } from "@/features/library/config";
import {
  createPendingFileSnippetAction,
  createTextCaptureAction,
  finalizeFileSnippetAction,
} from "@/features/snippets/actions";
import { useSupabase } from "@/hooks/use-supabase";
import { snippetAttachmentPath } from "@/lib/storage/paths";
import { uploadFile } from "@/lib/storage/storage";

const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Category-scoped add: a file picker for images/docs/files, a URL box for links. */
export function LibraryAdd({ type }: { type: LibraryType }) {
  const router = useRouter();
  const supabase = useSupabase();
  const config = LIBRARY_ADD[type];
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState("");

  async function handleFile(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File is too large (max 10 MB).");
      return;
    }
    setBusy(true);
    const mimeType = file.type || "application/octet-stream";
    const kind = kindFromMime(mimeType);

    const pending = await createPendingFileSnippetAction({ name: file.name, mimeType, size: file.size, kind });
    if (!pending.ok) {
      setBusy(false);
      toast.error(pending.error.message);
      return;
    }
    const { snippetId, workspaceId } = pending.data;
    const path = snippetAttachmentPath(workspaceId, snippetId, file.name);
    const uploaded = await uploadFile(supabase, {
      bucket: "snippet-attachments",
      path,
      file,
      contentType: mimeType,
    });
    if (!uploaded.ok) {
      setBusy(false);
      toast.error(uploaded.error.message);
      return;
    }
    const finalized = await finalizeFileSnippetAction(snippetId, {
      bucket: "snippet-attachments",
      path: uploaded.data.path,
      mimeType,
      size: file.size,
      kind,
    });
    setBusy(false);
    if (!finalized.ok) {
      toast.error(finalized.error.message);
      return;
    }
    toast.success("Synced to CopyAnywhere.");
    router.refresh();
  }

  async function handleLink() {
    const value = url.trim();
    if (value.length === 0) return;
    setBusy(true);
    const result = await createTextCaptureAction(value);
    setBusy(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setUrl("");
    setLinkOpen(false);
    toast.success("Link saved.");
    router.refresh();
  }

  if (config.isLink) {
    if (!linkOpen) {
      return (
        <Button type="button" onClick={() => setLinkOpen(true)}>
          <Link2 className="size-4" aria-hidden="true" />
          {config.label}
        </Button>
      );
    }
    return (
      <div className="flex w-full max-w-md items-center gap-2">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          aria-label="Link URL"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleLink();
            if (e.key === "Escape") setLinkOpen(false);
          }}
        />
        <Button type="button" onClick={() => void handleLink()} disabled={busy}>
          {busy ? <Loader2 className="size-4 animate-spin" /> : "Save"}
        </Button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={config.accept}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      <Button type="button" onClick={() => inputRef.current?.click()} disabled={busy} aria-busy={busy}>
        {busy ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" aria-hidden="true" />}
        {busy ? "Uploading…" : config.label}
      </Button>
    </>
  );
}
