"use client";

import { useContext } from "react";

import type { TypedSupabaseClient } from "@/lib/supabase/types";
import { SupabaseContext } from "@/providers/supabase-provider";
import { SupabaseConfigError } from "@/utils/errors";

/**
 * Access the browser Supabase client from client components.
 *
 * Throws a clear error if used outside a configured SupabaseProvider (a
 * programming/configuration error), so misuse fails fast and legibly rather
 * than producing confusing null-client behavior.
 */
export function useSupabase(): TypedSupabaseClient {
  const client = useContext(SupabaseContext);

  if (!client) {
    throw new SupabaseConfigError(
      "useSupabase must be used within a configured <SupabaseProvider>. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
    );
  }

  return client;
}
