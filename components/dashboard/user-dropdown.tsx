"use client";

import { LogOut, Settings, User } from "lucide-react";

import { UserAvatar } from "@/components/auth/user-avatar";
import { Menu } from "@/components/ui/menu";
import { useSignOut } from "@/hooks/use-sign-out";
import type { AuthUser } from "@/types/auth";

/**
 * Account menu for the dashboard top bar: who is signed in, Profile, Settings
 * and Sign out. A dropdown on desktop and an action sheet on phones (Menu).
 */
export function UserDropdown({ user }: { user: AuthUser }) {
  const { signOut, pending } = useSignOut();

  return (
    <Menu
      label="Account"
      header={
        <div className="flex min-w-0 flex-col">
          <p className="truncate text-sm font-medium text-foreground">{user.displayName ?? "Account"}</p>
          {user.email ? <p className="truncate text-xs text-muted-foreground">{user.email}</p> : null}
        </div>
      }
      items={[
        { label: "Profile", icon: User, href: "/dashboard/profile" },
        { label: "Settings", icon: Settings, href: "/dashboard/settings" },
        "separator",
        {
          label: pending ? "Signing out…" : "Sign out",
          icon: LogOut,
          onSelect: () => signOut(),
          disabled: pending,
        },
      ]}
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity duration-fast active:opacity-80 pointer-coarse:size-11"
        >
          <span className="sr-only">Account menu</span>
          <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl} />
        </button>
      )}
    />
  );
}
