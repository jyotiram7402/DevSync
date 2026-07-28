"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSupabase } from "@/hooks/use-supabase";
import { signOut } from "@/lib/auth/auth";
import { cn } from "@/utils/cn";

/**
 * Signs the user out via the browser client (so auth state updates instantly),
 * then refreshes server components. `onDone` lets a parent (e.g. UserMenu)
 * close itself.
 */
export function LogoutButton({
  className,
  onDone,
}: {
  className?: string;
  onDone?: () => void;
}) {
  const supabase = useSupabase();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLogout() {
    startTransition(async () => {
      const result = await signOut(supabase);
      if (!result.ok) {
        toast.error(result.error.message);
        return;
      }
      onDone?.();
      router.push("/");
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleLogout}
      disabled={isPending}
      className={cn("w-full justify-start gap-2", className)}
    >
      <LogOut className="size-4" />
      {isPending ? "Signing out…" : "Sign out"}
    </Button>
  );
}
