"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { ArrivalFeed } from "@/components/items/arrival-feed";
import { Button } from "@/components/ui/button";
import { DialogFooter, ResponsiveDialog } from "@/components/ui/dialog";
import { RelativeTime } from "@/components/ui/relative-time";
import { Skeleton } from "@/components/ui/skeleton";
import { FileDownloadButton } from "@/features/library/components/file-download-button";
import type { LibraryItem } from "@/features/snippets/types";
import { useSupabase } from "@/hooks/use-supabase";
import { createSignedUrls } from "@/lib/storage/storage";

/**
 * Images as a grid of square thumbnails (2 columns on phones up to 6 on wide
 * screens). One request signs every thumbnail; a tap opens the image large
 * with Download. Thumbnails reserve their square, so nothing shifts as they load.
 */
export function LibraryImageGrid({ items }: { items: LibraryItem[] }) {
  const supabase = useSupabase();
  const [urls, setUrls] = useState<Map<string, string>>(() => new Map());
  const [viewing, setViewing] = useState<LibraryItem | null>(null);
  const pathsKey = items.map((item) => item.path ?? "").join("|");

  useEffect(() => {
    const paths = pathsKey.split("|").filter((path) => path.length > 0);
    let active = true;
    void createSignedUrls(supabase, "snippet-attachments", paths, 3600).then((result) => {
      if (active && result.ok) setUrls(result.data);
    });
    return () => {
      active = false;
    };
  }, [supabase, pathsKey]);

  const viewingUrl = viewing?.path ? urls.get(viewing.path) : undefined;

  return (
    <>
      <ArrivalFeed
        label="Images"
        resetKey="images"
        className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        entries={items.map((item) => {
          const url = item.path ? urls.get(item.path) : undefined;
          return {
            id: item.id,
            node: (
              <button
                type="button"
                onClick={() => setViewing(item)}
                className="relative block aspect-square w-full overflow-hidden rounded-lg border border-border bg-muted transition-opacity duration-fast active:opacity-80"
              >
                {url ? (
                  <img src={url} alt="" loading="lazy" decoding="async" className="size-full object-cover" />
                ) : (
                  <Skeleton className="size-full rounded-none" />
                )}
                <span className="sr-only">Open {item.name}</span>
              </button>
            ),
          };
        })}
      />

      <ResponsiveDialog
        open={viewing !== null}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? "Image"}
        size="xl"
        footer={
          viewing ? (
            <DialogFooter>
              <Button asChild variant="outline">
                <Link href={`/dashboard/library/images/${viewing.id}`}>Details</Link>
              </Button>
              {viewing.path ? (
                <FileDownloadButton path={viewing.path} name={viewing.name} size="default" variant="default" />
              ) : null}
            </DialogFooter>
          ) : null
        }
      >
        {viewing ? (
          <div className="flex flex-col gap-2">
            {viewingUrl ? (
              <img
                src={viewingUrl}
                alt={viewing.name}
                decoding="async"
                className="max-h-[60dvh] w-full rounded-md bg-muted object-contain"
              />
            ) : (
              <Skeleton className="aspect-video w-full" />
            )}
            <p className="text-xs text-muted-foreground">
              Saved <RelativeTime value={viewing.createdAt} />
            </p>
          </div>
        ) : null}
      </ResponsiveDialog>
    </>
  );
}
