"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import { toAuthUser } from "@/lib/auth/user";
import { SupabaseContext } from "@/providers/supabase-provider";
import type { AuthUser } from "@/types/auth";

/**
 * Client-side auth state.
 *
 * Subscribes to Supabase `onAuthStateChange` (which emits INITIAL_SESSION on
 * mount and updates on sign-in/out and token refresh), keeping the UI reactive
 * without a page reload. When Supabase is not configured the context resolves
 * to a signed-out, non-loading state so the app still renders.
 */
export interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useContext(SupabaseContext);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? toAuthUser(session.user) : null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isLoading, isAuthenticated: user !== null }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
