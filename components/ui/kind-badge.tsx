import {
  CodeXml,
  FileArchive,
  FileAudio,
  FileText,
  FileVideo,
  Image as ImageIcon,
  Layers,
  Link2,
  ListTodo,
  Paperclip,
  ScrollText,
  SquareTerminal,
  TriangleAlert,
  Type,
  type LucideIcon,
} from "lucide-react";

import { ITEM_KINDS, type ItemKind, type KindTone } from "@/lib/item-kinds";
import { cn } from "@/utils/cn";

/**
 * KindBadge / KindIcon — how an item's kind looks everywhere (Snippets,
 * Library, Spaces, Search). Always an icon plus a label: the kind color is a
 * quiet tint on the icon only, never the sole signal.
 */
export const KIND_ICONS: Record<ItemKind, LucideIcon> = {
  text: Type,
  code: CodeXml,
  command: SquareTerminal,
  error: TriangleAlert,
  stacktrace: Layers,
  log: ScrollText,
  link: Link2,
  image: ImageIcon,
  doc: FileText,
  file: Paperclip,
  archive: FileArchive,
  audio: FileAudio,
  video: FileVideo,
  note: ListTodo,
};

/** Icon color per tone (full class names so Tailwind generates them). */
export const KIND_TONE_TEXT: Record<KindTone, string> = {
  neutral: "text-kind-neutral",
  code: "text-kind-code",
  command: "text-kind-command",
  error: "text-kind-error",
  link: "text-kind-link",
  image: "text-kind-image",
  doc: "text-kind-doc",
  note: "text-kind-note",
};

/** Tinted icon tile per tone. */
export const KIND_TONE_TILE: Record<KindTone, string> = {
  neutral: "bg-kind-neutral/10 text-kind-neutral",
  code: "bg-kind-code/10 text-kind-code",
  command: "bg-kind-command/10 text-kind-command",
  error: "bg-kind-error/10 text-kind-error",
  link: "bg-kind-link/10 text-kind-link",
  image: "bg-kind-image/10 text-kind-image",
  doc: "bg-kind-doc/10 text-kind-doc",
  note: "bg-kind-note/10 text-kind-note",
};

/** Small label: tinted icon + kind name, e.g. "⚠ Error". */
export function KindBadge({ kind, className }: { kind: ItemKind; className?: string }) {
  const { label, tone } = ITEM_KINDS[kind];
  const Icon = KIND_ICONS[kind];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-border bg-surface px-1.5 py-0.5 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      <Icon className={cn("size-3.5 shrink-0", KIND_TONE_TEXT[tone])} aria-hidden="true" />
      {label}
    </span>
  );
}

const TILE_SIZES = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-5",
  lg: "size-12 [&_svg]:size-6",
} as const;

/** Square tinted tile with the kind icon; the kind name is its accessible label. */
export function KindIcon({
  kind,
  size = "md",
  className,
}: {
  kind: ItemKind;
  size?: keyof typeof TILE_SIZES;
  className?: string;
}) {
  const { label, tone } = ITEM_KINDS[kind];
  const Icon = KIND_ICONS[kind];
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        KIND_TONE_TILE[tone],
        TILE_SIZES[size],
        className,
      )}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}
