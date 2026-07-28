"use client";

import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { UserAvatar } from "@/components/auth/user-avatar";
import { useUser } from "@/hooks/use-user";

/**
 * Account dropdown for the authenticated header. A lightweight, accessible
 * disclosure (no external dropdown dependency): closes on Escape and on
 * outside click, and exposes aria-haspopup/aria-expanded.
 */
export function UserMenu() {
  const user = useUser();
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

  if (!user) return null;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      >
        <span className="sr-only">Open account menu</span>
        <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account"
          className="absolute right-0 z-50 mt-2 w-60 rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          <div className="px-2 py-1.5">
            <p className="truncate text-sm font-medium">{user.displayName ?? "Account"}</p>
            {user.email ? (
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            ) : null}
          </div>
          <div className="my-1 h-px bg-border" />
          <LogoutButton onDone={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
