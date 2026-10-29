import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Page not found",
};

/**
 * 404 for addresses outside the app. Offers the app (which sends signed-out
 * people to sign in) and the home page.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <Logo />
      <div className="flex max-w-md flex-col gap-2">
        <p className="font-mono text-sm text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-sm text-muted-foreground">
          The link may be old or mistyped. Your snippets and files are safe in your account.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild>
          <Link href="/dashboard/home">Open CopyAnywhere</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Home page</Link>
        </Button>
      </div>
    </main>
  );
}
