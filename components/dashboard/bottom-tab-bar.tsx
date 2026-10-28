"use client";

import { Ellipsis, Plus, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LIBRARY_NAV,
  MORE_NAV,
  NAV_HOME,
  NAV_SNIPPETS,
  NAV_SPACES,
  isNavActive,
} from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

/**
 * Phone bottom bar (hidden from md, where the sidebar takes over): Home,
 * Snippets, Add (the one add action, opening the Add sheet), Spaces and More
 * (everything else, in the More sheet). Labeled, with the active destination
 * on the selection wash. It respects the home indicator, and hides while a
 * text field has focus (styles/globals.css) so the keyboard never lifts it
 * over the field.
 */
const MORE_HREFS = [...LIBRARY_NAV, ...MORE_NAV].map((item) => item.href);

export function BottomTabBar() {
  const pathname = usePathname();
  const addOpen = useUIStore((state) => state.addSheetOpen);
  const setAddOpen = useUIStore((state) => state.setAddSheetOpen);
  const moreOpen = useUIStore((state) => state.moreSheetOpen);
  const setMoreOpen = useUIStore((state) => state.setMoreSheetOpen);
  const moreActive = MORE_HREFS.some((href) => isNavActive(pathname, href));

  return (
    <nav
      aria-label="Primary"
      data-bottom-nav=""
      className="fixed inset-x-0 bottom-0 z-nav border-t border-border bg-background/95 pb-safe backdrop-blur-md supports-[backdrop-filter]:bg-background/85 md:hidden"
    >
      <div className="mx-auto grid h-14 max-w-md grid-cols-5 px-1">
        <TabLink
          href={NAV_HOME.href}
          label={NAV_HOME.label}
          icon={NAV_HOME.icon}
          active={isNavActive(pathname, NAV_HOME.href)}
        />
        <TabLink
          href={NAV_SNIPPETS.href}
          label={NAV_SNIPPETS.label}
          icon={NAV_SNIPPETS.icon}
          active={isNavActive(pathname, NAV_SNIPPETS.href)}
        />

        <button
          type="button"
          onClick={() => setAddOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={addOpen}
          className="group flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-foreground"
        >
          <span className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform duration-fast group-active:scale-95">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          Add
        </button>

        <TabLink
          href={NAV_SPACES.href}
          label={NAV_SPACES.label}
          icon={NAV_SPACES.icon}
          active={isNavActive(pathname, NAV_SPACES.href)}
        />

        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className={tabClass(moreActive)}
        >
          <TabIcon icon={Ellipsis} active={moreActive} />
          More
        </button>
      </div>
    </nav>
  );
}

function tabClass(active: boolean): string {
  return cn(
    "group flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors duration-fast",
    active ? "text-foreground" : "text-muted-foreground",
  );
}

function TabIcon({ icon: Icon, active }: { icon: LucideIcon; active: boolean }) {
  return (
    <span
      className={cn(
        "flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-fast group-active:bg-accent",
        active && "bg-wash text-primary-ink",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

function TabLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={tabClass(active)}>
      <TabIcon icon={icon} active={active} />
      {label}
    </Link>
  );
}
