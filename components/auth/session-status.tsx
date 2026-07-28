"use client";

import { useAuth } from "@/hooks/use-auth";

/**
 * Compact, live-announced session indicator. Useful for debugging and small
 * status displays; reads only the auth context (safe even when Supabase is
 * unconfigured — it simply reports "Signed out").
 */
export function SessionStatus({ className }: { className?: string }) {
  const { isLoading, isAuthenticated, user } = useAuth();

  const label = isLoading
    ? "Checking session…"
    : isAuthenticated
      ? `Signed in as ${user?.displayName ?? user?.email ?? "your account"}`
      : "Signed out";

  return (
    <span className={className} aria-live="polite">
      {label}
    </span>
  );
}
