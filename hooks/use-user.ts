"use client";

import { useAuth } from "@/hooks/use-auth";
import type { AuthUser } from "@/types/auth";

/** Convenience selector for the current authenticated user (or null). */
export function useUser(): AuthUser | null {
  return useAuth().user;
}
