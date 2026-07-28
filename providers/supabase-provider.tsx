"use client";

import { createContext, useState, type ReactNode } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TypedSupabaseClient } from "@/lib/supabase/types";

/**
 * Provides a single, stable browser Supabase client to the client component
 * tree. The client is created once per mount (useState initializer). When
 * Supabase is not configured the context value is `null`, so the app renders
 * without configuration; `useSupabase` surfaces a clear error if it is then
 * consumed.
 *
 * Route protection and auth flows are added in later sprints — this only wires
 * the client so those can build on it.
 */
export const SupabaseContext = createContext<TypedSupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: ReactNode }) {
  const [client] = useState<TypedSupabaseClient | null>(() =>
    isSupabaseConfigured ? createBrowserSupabaseClient() : null,
  );

  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}
