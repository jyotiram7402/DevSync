"use client";

import {
  Archive,
  FileText,
  Link2,
  Music,
  Paperclip,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { sourceLabel } from "@/features/library/config";
import type { LibraryItem } from "@/features/snippets/types";
import { useSupabase } from "@/hooks/use-supabase";
import { expiryLabel } from "@/lib/retention";
import { createSignedUrl } from "@/lib/storage/storage";
import { cn } from "@/utils/cn";

const ICONS: Record<string, LucideIcon> = {
  url: Link2,
  pdf: FileText,
  office: FileText,
  archive: Archive,
  audio: Music,
  video: Video,
  file: Paperclip,
};

function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** One row in a library view: thumbnail/icon, name, when, and source platform. */
export function LibraryItemRow({ item }: { item: LibraryItem }) {
  const supabase = useSupabase();
  const [thumb, setThumb] = useState<string | null>(null);
  const isImage = item.kind === "image" && Boolean(item.path);

  useEffect(() => {
    if (!isImage || !item.path) return;
    let active = true;
    void createSignedUrl(supabase, "snippet-attachments", item.path, 3600).then((result) => {
      if (active && result.ok) setThumb(result.data.signedUrl);
    });
    return () => {
      active = false;
    };
  }, [supabase, item.path, isImage]);

  const Icon = ICONS[item.kind] ?? Paperclip;
  const source = sourceLabel(item.source);

  return (
    <Link
      href={`/dashboard/snippets/${item.id}`}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-secondary/50",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="size-full object-cover" />
        ) : (
          <Icon className="size-5" aria-hidden="true" />
        )}
      </span>

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate text-sm font-medium">{item.name}</span>
        <span className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
          <time dateTime={item.createdAt}>{formatWhen(item.createdAt)}</time>
          {source ? (
            <>
              <span aria-hidden="true">·</span>
              <span>from {source}</span>
            </>
          ) : null}
        </span>
      </span>

      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium",
          item.kept ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground",
        )}
      >
        {expiryLabel(item.createdAt, item.kept)}
      </span>
    </Link>
  );
}
