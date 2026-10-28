"use client";

import { Link2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DialogFooter, ResponsiveDialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

/** Category-scoped add: a file picker for images/docs/files, a link box (in a sheet on phones) for links. */
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
      toast.error("That file is over 10 MB. Files can be up to 10 MB.");
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
    toast.success("Uploaded. It's on your other devices now.");
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
    toast.success("Link saved. It's on your other devices now.");
    router.refresh();
  }

  if (config.isLink) {
    return (
      <>
        <Button type="button" size="sm" onClick={() => setLinkOpen(true)}>
          <Link2 aria-hidden="true" />
          {config.label}
        </Button>
        <ResponsiveDialog
          open={linkOpen}
          onClose={() => setLinkOpen(false)}
          title="Add a link"
          description="Paste a web address. It shows up on all your devices."
          size="sm"
          footer={
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setLinkOpen(false)} disabled={busy}>
                Cancel
              </Button>
              <Button type="button" onClick={() => void handleLink()} loading={busy}>
                {busy ? "Saving…" : "Save link"}
              </Button>
            </DialogFooter>
          }
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="library-link">Link</Label>
            <Input
              id="library-link"
              type="url"
              inputMode="url"
              autoCapitalize="none"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="done"
              placeholder="https://…"
              value={url}
              data-autofocus=""
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleLink();
              }}
            />
          </div>
        </ResponsiveDialog>
      </>
    );
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={config.accept}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFile(file);
        }}
      />
      <Button type="button" size="sm" onClick={() => inputRef.current?.click()} loading={busy}>
        {busy ? null : <Plus aria-hidden="true" />}
        {busy ? "Uploading…" : config.label}
      </Button>
    </>
  );
}
