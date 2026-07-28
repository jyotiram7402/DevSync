"use client";

import { useAuth } from "@/hooks/use-auth";

export interface SessionState {
  isLoading: boolean;
  isAuthenticated: boolean;
}

/** Convenience selector for session status without the user details. */
export function useSession(): SessionState {
  const { isLoading, isAuthenticated } = useAuth();
  return { isLoading, isAuthenticated };
}
