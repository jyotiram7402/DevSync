import Link from "next/link";

import { APP_NAME } from "@/lib/constants";

/**
 * Slim footer for the dashboard content area (scrolls with content).
 */
export function DashboardFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t px-1 py-6">
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
