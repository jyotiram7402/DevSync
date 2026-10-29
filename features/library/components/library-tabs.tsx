"use client";

import { ScrollableTabs } from "@/components/ui/scrollable-tabs";
import type { LibraryType } from "@/features/library/config";
import { LIBRARY_NAV } from "@/lib/dashboard/navigation";

/** Images / Links / Docs / Files, one scrolling row of chips (links keep URLs stable). */
export function LibraryTabs({ active }: { active: LibraryType }) {
  return (
    <ScrollableTabs
      aria-label="Library"
      activeId={active}
      items={LIBRARY_NAV.map((item) => ({
        id: item.href.split("/").pop() ?? item.href,
        label: item.label,
        icon: item.icon,
        href: item.href,
      }))}
    />
  );
}
