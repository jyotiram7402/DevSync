"use client";

import { X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { SidebarItem } from "@/components/dashboard/sidebar-item";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { DASHBOARD_PRIMARY_NAV, DASHBOARD_SECONDARY_NAV } from "@/lib/dashboard/navigation";
import { useUIStore } from "@/stores/ui-store";
import { cn } from "@/utils/cn";

/**
 * Mobile navigation drawer. Slides in over a backdrop, traps scroll while open,
 * closes on Escape / backdrop click / route change, and moves focus into the
 * panel on open. Hidden at md and above (desktop uses the persistent sidebar).
 */
export function MobileNavigation() {
  const open = useUIStore((state) => state.mobileNavOpen);
  const setOpen = useUIStore((state) => state.setMobileNavOpen);
  const pathname = usePathname();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  // Escape to close + lock body scroll + move focus into the panel while open.
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, setOpen]);

  const close = () => setOpen(false);

  return (
    <div
      className={cn("fixed inset-0 z-50 md:hidden", open ? "" : "pointer-events-none")}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/50 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={close}
      />
      <div
        id="mobile-navigation"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        tabIndex={-1}
        className={cn(
          "absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col border-r bg-background shadow-lg outline-none transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b p-4">
          <Logo />
          <Button type="button" variant="ghost" size="icon" aria-label="Close navigation" onClick={close}>
            <X className="size-5" />
          </Button>
        </div>
        <nav aria-label="Mobile" className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {DASHBOARD_PRIMARY_NAV.map((item) => (
            <SidebarItem key={item.href} {...item} onNavigate={close} />
          ))}
          <div className="my-2 h-px bg-border" role="separator" />
          {DASHBOARD_SECONDARY_NAV.map((item) => (
            <SidebarItem key={item.href} {...item} onNavigate={close} />
          ))}
        </nav>
      </div>
    </div>
  );
}
