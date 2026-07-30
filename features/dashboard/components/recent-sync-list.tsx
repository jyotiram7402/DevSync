import {
  Archive,
  Code2,
  FileText,
  Image as ImageIcon,
  Link2,
  Music,
  Paperclip,
  Video,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import type { RecentSyncItem } from "@/features/dashboard/services/overview-service";
import { formatRelativeTime, truncate } from "@/utils/formatters";

const KIND_ICON: Record<string, LucideIcon> = {
  text: Code2,
  code: Code2,
  url: Link2,
  image: ImageIcon,
  pdf: FileText,
  office: FileText,
  archive: Archive,
  audio: Music,
  video: Video,
  file: Paperclip,
};

const KIND_LABEL: Record<string, string> = {
  text: "Text",
  code: "Code",
  url: "Link",
  image: "Image",
  pdf: "PDF",
  office: "Document",
  archive: "Archive",
  audio: "Audio",
  video: "Video",
  file: "File",
};

const SOURCE_LABEL: Record<string, string> = {
  web: "Web",
  mobile: "Android",
  extension: "Extension",
};

/**
 * Recent sync feed — what was synced, when, and from which platform, so the
 * cross-device flow is legible at a glance.
 */
export function RecentSyncList({ items }: { items: RecentSyncItem[] }) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Nothing synced yet. Use <span className="font-medium">Quick add</span> to sync your first
        item.
      </p>
    );
  }

  return (
    <ul className="flex flex-col divide-y">
      {items.map((item) => {
        const Icon = KIND_ICON[item.kind] ?? Paperclip;
        const source = item.source ? SOURCE_LABEL[item.source] : null;
        return (
          <li key={item.id}>
            <Link
              href={`/dashboard/snippets/${item.id}`}
              className="flex items-center gap-3 py-3 transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">
                  {truncate(item.name.replace(/\s+/g, " ").trim(), 60)}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {KIND_LABEL[item.kind] ?? "Item"}
                  {source ? ` · from ${source}` : ""} · {formatRelativeTime(item.createdAt)}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
