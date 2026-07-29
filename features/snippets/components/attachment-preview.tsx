"use client";

import { Download, ExternalLink, FileText } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSupabase } from "@/hooks/use-supabase";
import { createSignedUrl } from "@/lib/storage/storage";

const BUCKET = "snippet-attachments" as const;

/**
 * Renders a synced file attachment: inline image, embedded PDF, or a download
 * card for anything else. The bucket is private, so access is via a short-lived
 * signed URL fetched with the user's session.
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
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void createSignedUrl(supabase, BUCKET, path, 3600).then((result) => {
      if (!active) return;
      if (result.ok) setUrl(result.data.signedUrl);
      else setError(result.error.message);
    });
    return () => {
      active = false;
    };
  }, [supabase, path]);

  if (error) {
    return (
      <p role="alert" className="rounded-lg border border-dashed p-6 text-sm text-destructive">
        Could not load this attachment: {error}
      </p>
    );
  }

  if (!url) return <Skeleton className="h-64 w-full rounded-lg" />;

  const downloadUrl = `${url}${url.includes("?") ? "&" : "?"}download=${encodeURIComponent(name)}`;
  const actions = (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="outline">
        <a href={url} target="_blank" rel="noreferrer">
          <ExternalLink className="size-4" aria-hidden="true" />
          Open
        </a>
      </Button>
      <Button asChild>
        <a href={downloadUrl} rel="noreferrer">
          <Download className="size-4" aria-hidden="true" />
          Download
        </a>
      </Button>
    </div>
  );

  if (kind === "image") {
    return (
      <div className="flex flex-col items-start gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="max-h-[520px] w-full rounded-lg border object-contain"
        />
        {actions}
      </div>
    );
  }

  if (mimeType === "application/pdf") {
    return (
      <div className="flex flex-col gap-3">
        <iframe src={url} title={name} className="h-[600px] w-full rounded-lg border" />
        {actions}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-lg border p-4">
      <span className="flex size-12 items-center justify-center rounded-md bg-muted text-muted-foreground">
        <FileText className="size-6" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">
          {mimeType}
          {size ? ` · ${(size / 1024).toFixed(0)} KB` : ""}
        </p>
      </div>
      {download}
    </div>
  );
}
