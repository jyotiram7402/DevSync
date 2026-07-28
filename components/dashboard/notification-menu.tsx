"use client";

import { Bell } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * Notification bell (placeholder). Opens an accessible dropdown showing an
 * empty state — no real notifications are wired in this sprint.
 */
export function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <Bell className="size-5" />
      </Button>

      {open ? (
        <div
          role="menu"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-72 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <div className="px-3 py-2 text-sm font-medium">Notifications</div>
          <div className="my-1 h-px bg-border" role="separator" />
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            You&apos;re all caught up.
          </p>
        </div>
      ) : null}
    </div>
  );
}
