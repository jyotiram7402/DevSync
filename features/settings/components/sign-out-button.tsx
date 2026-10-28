"use client";

import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSignOut } from "@/hooks/use-sign-out";

/** Sign out on this device (same flow as the account menu). */
export function SignOutButton() {
  const { signOut, pending } = useSignOut();

  return (
    <Button type="button" variant="outline" onClick={() => signOut()} loading={pending} className="w-fit">
      {pending ? null : <LogOut aria-hidden="true" />}
      {pending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
