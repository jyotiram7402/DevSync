"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-sign-out";
import { cn } from "@/utils/cn";

/**
 * Sign-out button. `onDone` lets a parent (e.g. a menu or sheet) close itself
 * once the session has ended.
 */
export function LogoutButton({
  className,
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const { signOut, pending } = useSignOut();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={() => signOut(onDone)}
      loading={pending}
      className={cn("w-full justify-start gap-2", className)}
    >
      {pending ? null : <LogOut aria-hidden="true" />}
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
