"use client";

import { useContext } from "react";

import { RealtimeContext, type RealtimeContextValue } from "@/providers/realtime-provider";

/**
 * Access the realtime context (platform + connection status). Throws if used
 * outside <RealtimeProvider>.
 */
export function useRealtime(): RealtimeContextValue {
  const context = useContext(RealtimeContext);
  if (context === undefined) {
    throw new Error("useRealtime must be used within a <RealtimeProvider>.");
  }
  return context;
}
