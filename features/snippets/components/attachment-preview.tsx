"use client";

import { Download, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { ErrorState } from "@/components/shared/error-state";
import { Button } from "@/components/ui/button";
import { FileIcon } from "@/components/ui/file-icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabase } from "@/hooks/use-supabase";
import { isSafeToOpenInline } from "@/lib/safe-url";
import { createSignedUrl, downloadFile } from "@/lib/storage/storage";
import { formatBytes } from "@/utils/formatters";

const BUCKET = "snippet-attachments" as const;
const PREVIEW_SECONDS = 3600;
const OPEN_SECONDS = 300;

/**
 * A synced file on its item page: the image or PDF itself when it can be
 * shown, then the file card with Open and Download. The bucket is private, so
 * previews use a short-lived signed URL; "Open" asks for a fresh link on every
 * press (an old tab never shows an expired link), and "Download" fetches the
 * real bytes so the file keeps its name. Files that could run code when opened
 * (HTML, SVG…) are download-only.
 */
export function AttachmentPreview({
  path,
  kind,
  mimeType,
  name,
  size,
}: {
  path: string;
  kind: string;
  mimeType: string;
  name: string;
  size?: number;
}) {
  const supabase = useSupabase();
  const inline = isSafeToOpenInline(mimeType);
  const showsPreview = kind === "image" || mimeType === "application/pdf";
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);

  useEffect(() => {
    if (!showsPreview) return;
    let active = true;
    setPreviewError(null);
    void createSignedUrl(
      supabase,
      BUCKET,
      path,
      PREVIEW_SECONDS,
      inline ? undefined : { download: name || true },
    ).then((result) => {
      if (!active) return;
      if (result.ok) setPreviewUrl(result.data.signedUrl);
      else setPreviewError(result.error.message);
    });
    return () => {
      active = false;
    };
  }, [supabase, path, showsPreview, inline, name, attempt]);

  async function open() {
    if (opening) return;
    // Open the tab inside the tap (popup blockers), then point it at a fresh link.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    setOpening(true);
    const result = await createSignedUrl(supabase, BUCKET, path, OPEN_SECONDS);
    setOpening(false);
    if (!result.ok) {
      tab?.close();
      toast.error("Couldn't open the file. Check your connection and try again.");
      return;
    }
    if (tab) tab.location.href = result.data.signedUrl;
    else window.location.href = result.data.signedUrl;
  }

  async function download() {
    if (downloading) return;
    setDownloading(true);
    const result = await downloadFile(supabase, BUCKET, path);
    setDownloading(false);
    if (!result.ok) {
      toast.error("Couldn't download the file. Check your connection and try again.");
      return;
    }
    const objectUrl = URL.createObjectURL(result.data);
    const anchor = document.createElement("a");
    anchor.href = objectUrl;
    anchor.download = name && name.length > 0 ? name : "download";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(objectUrl);
  }

  return (
    <div className="flex flex-col gap-3">
      {showsPreview && previewError ? (
        <ErrorState
          title="Couldn't show a preview"
          description="The file is still saved. Try again, or download it below."
          onRetry={() => setAttempt((count) => count + 1)}
        />
      ) : null}

      {kind === "image" && !previewError ? (
        previewUrl ? (
          <img
            src={previewUrl}
            alt={name}
            decoding="async"
            className="max-h-[70dvh] w-full rounded-lg border border-border bg-muted object-contain"
          />
        ) : (
          <Skeleton className="aspect-video w-full rounded-lg" />
        )
      ) : null}

      {mimeType === "application/pdf" && !previewError ? (
        previewUrl ? (
          <iframe src={previewUrl} title={name} className="h-[70dvh] w-full rounded-lg border border-border" />
        ) : (
          <Skeleton className="h-[70dvh] w-full rounded-lg" />
        )
      ) : null}

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <FileIcon name={name} mimeType={mimeType} />
          <div className="min-w-0">
            <p className="line-clamp-2 text-sm font-medium [overflow-wrap:anywhere]" title={name}>
              {name}
            </p>
            {size ? <p className="text-xs text-muted-foreground">{formatBytes(size, 1)}</p> : null}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {inline ? (
            <Button type="button" variant="outline" onClick={() => void open()} loading={opening}>
              {opening ? null : <ExternalLink aria-hidden="true" />}
              Open
            </Button>
          ) : null}
          <Button type="button" onClick={() => void download()} loading={downloading}>
            {downloading ? null : <Download aria-hidden="true" />}
            {downloading ? "Downloading…" : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}
