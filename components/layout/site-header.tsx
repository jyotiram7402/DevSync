"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useState } from "react";

import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useAuth } from "@/hooks/use-auth";
import { NAV_LINKS } from "@/lib/site-config";
import { cn } from "@/utils/cn";

/**
 * SiteHeader — sticky top bar for the public pages (home, privacy, terms).
 *
 * The sign-in buttons are laid out from the first paint and only revealed once
 * the session is known, so nothing pops in or shifts; signed-in visitors get
 * "Open app" in the same spot. The middle column keeps the links centered
 * whatever sits on the right. Phones get a menu panel (links, theme, sign-in);
 * Escape or choosing a link closes it.
 */
export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const { isLoading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!open) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header className="sticky top-0 z-nav w-full border-b border-border bg-background/95 pt-safe backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-toast focus:rounded-md focus:border focus:border-border focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-overlay"
      >
        Skip to content
      </a>

      <div className="mx-auto grid h-16 w-full max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] lg:px-8">
        <div className="flex min-w-0 items-center">
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex h-9 items-center rounded-md px-3 text-sm text-muted-foreground transition-colors duration-fast hover:bg-accent hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center justify-end gap-2">
          <ThemeToggle className="hidden lg:inline-flex" />
          <div className="hidden sm:block">
            <AuthActions isLoading={isLoading} isAuthenticated={isAuthenticated} />
          </div>
          <IconButton
            label={open ? "Close menu" : "Menu"}
            icon={open ? X : Menu}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
            className="md:hidden"
          />
        </div>
      </div>

      <div id={menuId} hidden={!open} className="border-t border-border md:hidden">
        <nav aria-label="Site" className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 sm:px-6">
          <ul className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex min-h-11 items-center rounded-md px-2 text-base text-foreground transition-colors duration-fast hover:bg-accent active:bg-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between gap-3 border-t border-border px-2 pt-3">
            <span className="text-sm text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
          <div className={cn("flex flex-col gap-2 pb-1 sm:hidden", isLoading && "invisible")}>
            {isAuthenticated ? (
              <Button asChild className="w-full">
                <Link href="/dashboard/home" onClick={() => setOpen(false)}>
                  Open app
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/signup" onClick={() => setOpen(false)}>
                    Get started free
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/login" onClick={() => setOpen(false)}>
                    Sign in
                  </Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

/**
 * Sign in + Get started (or Open app when signed in). While the session loads
 * the signed-out buttons hold their place invisibly.
 */
function AuthActions({ isLoading, isAuthenticated }: { isLoading: boolean; isAuthenticated: boolean }) {
  if (isAuthenticated) {
    return (
      <Button asChild size="sm">
        <Link href="/dashboard/home">Open app</Link>
      </Button>
    );
  }
  return (
    <div className={cn("flex items-center gap-2", isLoading && "invisible")}>
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">Sign in</Link>
      </Button>
      <Button asChild size="sm">
        <Link href="/signup">Get started</Link>
      </Button>
    </div>
  );
}
