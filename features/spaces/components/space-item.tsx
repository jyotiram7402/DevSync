"use client";

import { ExternalLink, Maximize2, Trash2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { ItemPreview } from "@/components/items/item-preview";
import { ItemRow, MetaDot } from "@/components/items/item-row";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FileIcon } from "@/components/ui/file-icon";
import { Menu, type MenuEntry } from "@/components/ui/menu";
import { RelativeTime } from "@/components/ui/relative-time";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDownloadButton } from "@/features/library/components/file-download-button";
import { deleteSpaceItemAction } from "@/features/spaces/actions";
import { spaceItemAuthor, spaceItemKind } from "@/features/spaces/display";
import type { SpaceItem } from "@/features/spaces/types";
import { useSupabase } from "@/hooks/use-supabase";
import { titleFromText } from "@/lib/item-text";
import { displayHost, isSafeToOpenInline, safeWebUrl } from "@/lib/safe-url";
import { createSignedUrl } from "@/lib/storage/storage";
import { formatBytes } from "@/utils/formatters";

const BUCKET = "space-attachments" as const;
const OPEN_SECONDS = 300;

/** Images get an inline preview; SVG and other script-capable types stay files. */
export function showsImagePreview(item: SpaceItem): boolean {
  return item.path !== null && spaceItemKind(item) === "image" && isSafeToOpenInline(item.mimeType);
}

/**
 * One shared item in a room, from the shared item family: who shared it and
 * when, a preview, and an always-visible Copy (text), Open (links) or Download
 * (files). The menu views images, opens files in a new tab with a fresh link,
 * and deletes (for the sharer or the room owner, after asking).
 */
export function SpaceItemRow({
  item,
  isOwner,
  imageUrl,
  onView,
}: {
  item: SpaceItem;
  isOwner: boolean;
  /** Signed preview URL for images (the feed signs them all in one request). */
  imageUrl?: string | undefined;
  /** Opens the feed's image viewer on this item. */
  onView?: (() => void) | undefined;
}) {
  const supabase = useSupabase();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [opening, setOpening] = useState(false);

  const kind = spaceItemKind(item);
  const isFile = item.path !== null;
  const isImage = showsImagePreview(item);
  const canDelete = item.mine || isOwner;

  async function open() {
    if (!item.path || opening) return;
    // Open the tab inside the tap (popup blockers), then point it at a fresh link.
    const tab = window.open("about:blank", "_blank");
    if (tab) tab.opener = null;
    setOpening(true);
    const result = await createSignedUrl(supabase, BUCKET, item.path, OPEN_SECONDS);
    setOpening(false);
    if (!result.ok) {
      tab?.close();
      toast.error("Couldn't open the file. Check your connection and try again.");
      return;
    }
    if (tab) tab.location.href = result.data.signedUrl;
    else window.location.href = result.data.signedUrl;
  }

  async function remove() {
    setDeleting(true);
    const result = await deleteSpaceItemAction(item.spaceId, item.id);
    setDeleting(false);
    if (!result.ok) {
      toast.error(result.error.message);
      return;
    }
    setConfirmDelete(false);
    toast.success("Deleted for everyone in the room.");
  }

  const menuItems: MenuEntry[] = [];
  if (isImage && onView) menuItems.push({ label: "View", icon: Maximize2, onSelect: onView });
  if (isFile && isSafeToOpenInline(item.mimeType)) {
    menuItems.push({ label: "Open in new tab", icon: ExternalLink, onSelect: () => void open() });
  }
  if (canDelete) {
    if (menuItems.length > 0) menuItems.push("separator");
    menuItems.push({ label: "Delete", icon: Trash2, destructive: true, onSelect: () => setConfirmDelete(true) });
  }

  const meta = (
    <>
      <span className="font-medium text-foreground">{spaceItemAuthor(item)}</span>
      <MetaDot />
      <RelativeTime value={item.createdAt} />
      {isFile && item.size ? (
        <>
          <MetaDot />
          <span>{formatBytes(item.size, 1)}</span>
        </>
      ) : null}
    </>
  );

  const menu = menuItems.length > 0 ? <Menu label="Item actions" items={menuItems} /> : null;

  let row: ReactNode;
  if (isFile && item.path) {
    row = (
      <ItemRow
        kind={kind}
        title={item.content}
        titleLines={2}
        media={<FileIcon name={item.content} mimeType={item.mimeType} size="sm" />}
        preview={
          isImage ? (
            <button
              type="button"
              onClick={onView}
              className="block w-full max-w-sm overflow-hidden rounded-md border border-border bg-muted transition-opacity duration-fast active:opacity-80"
            >
              <span className="block aspect-video">
                {imageUrl ? (
                  <img src={imageUrl} alt="" loading="lazy" decoding="async" className="size-full object-contain" />
                ) : (
                  <Skeleton className="size-full rounded-none" />
                )}
              </span>
              <span className="sr-only">View {item.content}</span>
            </button>
          ) : undefined
        }
        meta={meta}
        primaryAction={<FileDownloadButton bucket={BUCKET} path={item.path} name={item.content} />}
        menu={menu}
      />
    );
  } else if (kind === "link") {
    const link = safeWebUrl(item.content);
    row = (
      <ItemRow
        kind={kind}
        title={displayHost(item.content) ?? item.content}
        preview={<p className="truncate font-mono text-xs text-muted-foreground">{item.content}</p>}
        meta={meta}
        primaryAction={
          <span className="flex items-center gap-1.5">
            <CopyButton value={item.content} iconOnly variant="ghost" srContext="link" />
            {link ? (
              <Button asChild size="sm" variant="outline">
                <a href={link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  Open
                </a>
              </Button>
            ) : null}
          </span>
        }
        menu={menu}
      />
    );
  } else {
    const { title, preview } = titleFromText(item.content, "Empty");
    row = (
      <ItemRow
        kind={kind}
        title={title}
        preview={preview ? <ItemPreview text={preview} code lines={4} /> : undefined}
        meta={meta}
        primaryAction={<CopyButton value={item.content} srContext={kind === "error" ? "error" : "code"} />}
        menu={menu}
      />
    );
  }

  return (
    <>
      {row}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => void remove()}
        pending={deleting}
        destructive
        title="Delete this item?"
        description={
          isFile
            ? `"${item.content}" is deleted for everyone in the room. This can't be undone.`
            : "It's deleted for everyone in the room. This can't be undone."
        }
        confirmLabel="Delete"
      />
    </>
  );
}
