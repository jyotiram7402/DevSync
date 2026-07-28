"use client";

import { CreditCard, Settings, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { LogoutButton } from "@/components/auth/logout-button";
import { UserAvatar } from "@/components/auth/user-avatar";
import type { AuthUser } from "@/types/auth";

/**
 * Account dropdown for the dashboard top bar. Shows identity and links to
 * profile/settings/billing plus sign-out. Accessible disclosure with Escape
 * and outside-click handling. Reuses the existing UserAvatar/LogoutButton.
 */
const MENU_LINKS = [
  { href: "/dashboard/profile", label: "Profile", icon: User },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
] as const;

export function UserDropdown({ user }: { user: AuthUser }) {
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
          <div className="my-1 h-px bg-border" role="separator" />
          {MENU_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <link.icon className="size-4" aria-hidden="true" />
              {link.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-border" role="separator" />
          <LogoutButton onDone={() => setOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
