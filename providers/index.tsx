"use client";

import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_THEME, THEME_STORAGE_KEY } from "@/lib/theme";
import { AuthProvider } from "@/providers/auth-provider";
import { RealtimeProvider } from "@/providers/realtime-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";
import { ThemeProvider } from "@/providers/theme-provider";

/**
 * Composes every app-level client provider in one place, mounted once in the
 * root layout. Server-rendered `children` are passed through untouched, so
 * wrapping them in this client component does not turn the tree into client
 * components. New global providers (auth, realtime) are added here in later
 * sprints.
 */
export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme={DEFAULT_THEME}
      enableSystem
      disableTransitionOnChange
      storageKey={THEME_STORAGE_KEY}
    >
      <SupabaseProvider>
        <AuthProvider>
          <RealtimeProvider>{children}</RealtimeProvider>
        </AuthProvider>
      </SupabaseProvider>
      <Toaster />
    </ThemeProvider>
  );
}
