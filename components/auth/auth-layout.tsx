import type { ReactNode } from "react";

import { AuthBackdrop } from "@/components/auth/auth-backdrop";
import { Logo } from "@/components/shared/logo";

/**
 * Centered layout shell for the authentication pages. Renders the page's
 * <main> landmark with the brand mark above the card slot, over the syncing
 * items background. `isolate` keeps the background behind the content.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="relative isolate flex min-h-dvh flex-col items-center justify-center px-4 pb-20 pt-12 md:px-6">
      <AuthBackdrop />
      <div className="relative flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </main>
  );
}
