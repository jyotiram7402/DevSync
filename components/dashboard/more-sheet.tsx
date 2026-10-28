"use client";

import { LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { ResponsiveDialog } from "@/components/ui/dialog";
import { useSignOut } from "@/hooks/use-sign-out";
import { LIBRARY_NAV, MORE_NAV, isNavActive } from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

/**
 * The phone "More" sheet: every destination that isn't in the bottom bar
 * (Library views, Quick Notes, Projects, Search, Settings, Help), plus the
 * theme and sign out. Closes when a link inside is followed.
 */
export function MoreSheet() {
  const open = useUIStore((state) => state.moreSheetOpen);
  const setOpen = useUIStore((state) => state.setMoreSheetOpen);
  const pathname = usePathname();
  const { signOut, pending } = useSignOut();

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  function close() {
    setOpen(false);
  }

  return (
    <ResponsiveDialog open={open} onClose={close} title="More">
      <section aria-labelledby="more-library" className="flex flex-col gap-2">
        <h3 id="more-library" className="text-xs font-medium text-muted-foreground">
          Library
        </h3>
        <ul className="grid grid-cols-2 gap-2">
          {LIBRARY_NAV.map((item) => {
            const active = isNavActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex h-14 items-center gap-3 rounded-lg border px-3 text-sm font-medium transition-colors duration-fast active:bg-accent",
                    active ? "border-transparent bg-wash text-primary-ink" : "border-border text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="size-5 shrink-0" aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <ul className="-mx-2 flex flex-col">
        {MORE_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={close}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-12 items-center gap-3 rounded-lg px-2 text-base transition-colors duration-fast active:bg-accent",
                  active ? "bg-wash font-medium text-primary-ink" : "text-foreground hover:bg-accent",
                )}
              >
                <Icon className={cn("size-5 shrink-0", !active && "text-muted-foreground")} aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="text-sm font-medium">Theme</span>
        <ThemeToggle />
      </div>

      <Button type="button" variant="outline" onClick={() => signOut(close)} loading={pending}>
        {pending ? null : <LogOut aria-hidden="true" />}
        {pending ? "Signing out…" : "Sign out"}
      </Button>
    </ResponsiveDialog>
  );
}
