import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

/**
 * Slim footer for the dashboard content area (scrolls with content). Tablet
 * and desktop only: on phones these links are in the More sheet.
 */
export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto hidden border-t border-border px-6 py-6 md:block lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">
        <p>
          © {year} {APP_NAME}
        </p>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/help" className="transition-colors hover:text-foreground">
            Help
          </Link>
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
        </div>
      </div>
    </footer>
  );
}
