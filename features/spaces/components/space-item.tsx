"use client";

import { Check, Copy, Download, ExternalLink, FileText, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { deleteSpaceItemAction } from "@/features/spaces/actions";
import type { SpaceItem } from "@/features/spaces/types";
import { useSupabase } from "@/hooks/use-supabase";
import { createSignedUrl, downloadFile } from "@/lib/storage/storage";

const BUCKET = "space-attachments" as const;

function timeLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function SpaceItemCard({ item, isOwner }: { item: SpaceItem; isOwner: boolean }) {
  const supabase = useSupabase();
  const isFile = Boolean(item.path);
  const isImage = item.kind === "image" && isFile;
  const canDelete = item.mine || isOwner;

  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!isFile || !item.path) return;
    let active = true;
    void createSignedUrl(supabase, BUCKET, item.path, 3600).then((res) => {
      if (active && res.ok) setSignedUrl(res.data.signedUrl);
    });
    return () => {
      active = false;
    };
  }, [supabase, item.path, isFile]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(item.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      toast.success("Copied.");
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  }

  async function download() {
    if (!item.path || downloading) return;
    setDownloading(true);
    const res = await downloadFile(supabase, BUCKET, item.path);
    setDownloading(false);
    if (!res.ok) {
      if (signedUrl) window.open(signedUrl, "_blank");
      return;
    }
    const objectUrl = URL.createObjectURL(res.data);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = item.content || "download";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  async function remove() {
    setDeleting(true);
    const res = await deleteSpaceItemAction(item.spaceId, item.id);
    if (!res.ok) {
      setDeleting(false);
      toast.error(res.error.message);
    }
    // On success the realtime refresh removes the card.
  }

  const meta = (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span>{item.mine ? "You" : (item.author ?? "Someone")}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={item.createdAt}>{timeLabel(item.createdAt)}</time>
    </div>
  );

  return (
    <li className="flex flex-col gap-2 rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-3">
        {meta}
        <div className="flex shrink-0 items-center gap-1">
          {!isFile ? (
            <Button type="button" variant="ghost" size="icon" onClick={() => void copyText()} aria-label="Copy">
              {copied ? <Check className="size-4 text-brand" /> : <Copy className="size-4" />}
            </Button>
          ) : null}
          {isFile ? (
            <>
              {signedUrl ? (
                <Button asChild variant="ghost" size="icon" aria-label="Open">
                  <a href={signedUrl} target="_blank" rel="noreferrer">
                    <ExternalLink className="size-4" />
                  </a>
                </Button>
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => void download()}
                disabled={downloading}
                aria-label="Download"
              >
                {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              </Button>
            </>
          ) : null}
          {canDelete ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => void remove()}
              disabled={deleting}
              aria-label="Delete"
            >
              <Trash2 className="size-4 text-muted-foreground" />
            </Button>
          ) : null}
        </div>
      </div>

      {isImage && signedUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={signedUrl} alt={item.content} className="max-h-72 w-full rounded-md border object-contain" />
      ) : isFile ? (
        <div className="flex items-center gap-3 rounded-md border p-3">
          <span className="flex size-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{item.content}</p>
            <p className="text-xs text-muted-foreground">
              {item.mimeType ?? "file"}
              {item.size ? ` · ${(item.size / 1024).toFixed(0)} KB` : ""}
            </p>
          </div>
        </div>
      ) : item.kind === "url" ? (
        <a
          href={item.content}
          target="_blank"
          rel="noreferrer"
          className="break-all text-sm text-brand hover:underline"
        >
          {item.content}
        </a>
      ) : (
        <p className="whitespace-pre-wrap break-words text-sm">{item.content}</p>
      )}
    </li>
  );
}
