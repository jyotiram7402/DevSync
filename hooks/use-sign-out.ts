"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

import { useSupabase } from "@/hooks/use-supabase";
import { signOut } from "@/lib/auth/auth";

/**
 * Signs the user out via the browser client (so auth state updates instantly),
 * then goes to the home page and refreshes server components. Shared by the
 * sign-out button, the account menu and the phone "More" sheet.
 */
export function useSignOut(): { signOut: (onDone?: () => void) => void; pending: boolean } {
  const supabase = useSupabase();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function run(onDone?: () => void) {
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

  return { signOut: run, pending };
}
