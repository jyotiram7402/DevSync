import type { ReactNode } from "react";

import { Logo } from "@/components/shared/logo";

/**
 * Centered layout shell for the authentication pages. Renders the page's
 * <main> landmark with the brand mark above the card slot.
 */
export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex justify-center">
          <Logo />
        </div>
        {children}
      </div>
    </main>
  );
}
