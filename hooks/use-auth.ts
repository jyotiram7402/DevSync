"use client";

import { useContext } from "react";

import { AuthContext, type AuthContextValue } from "@/providers/auth-provider";

/**
 * Access the current auth state. Throws if used outside <AuthProvider> so
 * misuse fails fast rather than silently returning a default.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return context;
}
