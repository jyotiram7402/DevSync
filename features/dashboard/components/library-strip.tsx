import Link from "next/link";

import { KindIcon } from "@/components/ui/kind-badge";
import type { ItemKind } from "@/lib/item-kinds";

const TILES: ReadonlyArray<{ label: string; href: string; kind: ItemKind; key: "images" | "links" | "docs" | "files" }> = [
  { label: "Images", href: "/dashboard/library/images", kind: "image", key: "images" },
  { label: "Links", href: "/dashboard/library/links", kind: "link", key: "links" },
  { label: "Documents", href: "/dashboard/library/docs", kind: "doc", key: "docs" },
  { label: "Files", href: "/dashboard/library/files", kind: "file", key: "files" },
];

/** The Library at a glance: how many of each, one tap into each. */
export function LibraryStrip({ counts }: { counts: Record<"images" | "links" | "docs" | "files", number> }) {
  return (
    <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
      {TILES.map((tile) => (
        <li key={tile.key}>
          <Link
            href={tile.href}
            className="flex min-h-16 items-center gap-3 rounded-lg border border-border bg-card p-3 transition-colors duration-fast hover:border-input/60 active:bg-accent"
          >
            <KindIcon kind={tile.kind} size="md" />
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-medium">{tile.label}</span>
              <span className="text-xs tabular-nums text-muted-foreground">{counts[tile.key]}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
