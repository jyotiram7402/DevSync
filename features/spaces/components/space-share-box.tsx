"use client";

import { Loader2, Paperclip, Send } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { kindFromMime } from "@/features/library/config";
import { shareFileAction, shareTextAction } from "@/features/spaces/actions";
import { useSupabase } from "@/hooks/use-supabase";
import { spaceAttachmentPath } from "@/lib/storage/paths";
import { uploadFile } from "@/lib/storage/storage";

const MAX_FILE_BYTES = 10 * 1024 * 1024;
const BUCKET = "space-attachments" as const;

/** The composer at the top of a room: share text/links, or upload a file. */
export function SpaceShareBox({ spaceId }: { spaceId: string }) {
  const supabase = useSupabase();
  const inputRef = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [category, setCategory] = useState<"error" | "code">("error");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function sendText() {
    const content = text.trim();
    if (content.length === 0) return;
    setSending(true);
    const res = await shareTextAction(spaceId, { content, category });
    setSending(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    setText("");
  }

  async function sendFile(file: File) {
    if (file.size > MAX_FILE_BYTES) {
      toast.error("File is too large (max 10 MB).");
      return;
    }
    setUploading(true);
    const mimeType = file.type || "application/octet-stream";
    const kind = kindFromMime(mimeType);
    const tempId = crypto.randomUUID();
    const path = spaceAttachmentPath(spaceId, tempId, file.name);

    const uploaded = await uploadFile(supabase, { bucket: BUCKET, path, file, contentType: mimeType });
    if (!uploaded.ok) {
      setUploading(false);
      toast.error(uploaded.error.message);
      return;
    }
    const res = await shareFileAction(spaceId, {
      path: uploaded.data.path,
      name: file.name,
      mimeType,
      size: file.size,
      kind,
    });
    setUploading(false);
    if (!res.ok) {
      toast.error(res.error.message);
      return;
    }
    toast.success("Shared to the room.");
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          category === "error"
            ? "Paste an error, stack trace or log…  (Ctrl/⌘ + Enter to send)"
            : "Paste code, a command or a link…  (Ctrl/⌘ + Enter to send)"
        }
        rows={2}
        className="resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
            e.preventDefault();
            void sendText();
          }
        }}
      />
      <div className="flex items-center justify-between gap-2">
        <div role="radiogroup" aria-label="Share as" className="flex items-center gap-1 rounded-md bg-muted p-0.5">
          {(["error", "code"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={category === value}
              onClick={() => setCategory(value)}
              className={
                category === value
                  ? "rounded px-2.5 py-1 text-xs font-medium bg-background shadow-sm"
                  : "rounded px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
              }
            >
              {value === "error" ? "Error" : "Code"}
            </button>
          ))}
        </div>
        <input
          ref={inputRef}
          type="file"
          hidden
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void sendFile(file);
          }}
        />
        <div className="flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />}
            {uploading ? "Uploading…" : "File"}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => void sendText()}
            disabled={sending || text.trim().length === 0}
          >
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            Share
          </Button>
        </div>
      </div>
    </div>
  );
}
