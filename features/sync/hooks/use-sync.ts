"use client";

import { useContext } from "react";

import { SyncContext, type SyncContextValue } from "@/features/sync/sync-provider";

/**
 * Access the sync engine context. Throws if used outside <SyncProvider>.
 */
export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error("useSync must be used within a <SyncProvider>.");
  }
  return context;
}
