"use client";

import { Code2, Home, Plus, Search, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useQuickCapture } from "@/features/capture/quick-capture-provider";
import { cn } from "@/utils/cn";

/**
 * Native-style bottom tab bar for mobile (hidden at md+, where the sidebar
 * takes over). Four destinations plus a raised center "quick add" button — the
 * signature action — that opens the capture modal. Respects the iOS/Android
 * safe-area inset so it never sits under the gesture bar.
 */
interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
}

const TABS: Tab[] = [
  { href: "/dashboard/home", label: "Home", icon: Home },
  { href: "/dashboard/snippets", label: "Snippets", icon: Code2 },
  { href: "/dashboard/search", label: "Search", icon: Search },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function BottomTabBar() {
  const pathname = usePathname();
  const { open } = useQuickCapture();

  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/90 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex h-14 max-w-md items-stretch justify-between px-2">
        {left.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab.href)} />
        ))}

        {/* Center: raised quick-add action */}
        <div className="flex w-16 items-center justify-center">
          <button
            type="button"
            onClick={open}
            aria-label="Quick add"
            className="-mt-6 flex size-14 items-center justify-center rounded-full bg-brand text-brand-foreground shadow-glow ring-4 ring-background transition-transform active:scale-95"
          >
            <Plus className="size-6" aria-hidden="true" />
          </button>
        </div>

        {right.map((tab) => (
          <TabLink key={tab.href} tab={tab} active={isActive(pathname, tab.href)} />
        ))}
      </div>
    </nav>
  );
}

function TabLink({ tab, active }: { tab: Tab; active: boolean }) {
  const Icon = tab.icon;
  return (
    <Link
      href={tab.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-[10px] font-medium transition-colors",
        active ? "text-brand" : "text-muted-foreground",
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {tab.label}
    </Link>
  );
}
