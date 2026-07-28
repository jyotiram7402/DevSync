"use client";

import { useEffect, useState } from "react";

import { useRealtime } from "@/hooks/use-realtime";
import { presenceChannel } from "@/lib/realtime/channels";
import type { PresencePayload } from "@/lib/realtime/types";

export interface UsePresenceOptions {
  /** Workspace whose presence to track; null disables. */
  workspaceId: string | null | undefined;
  /** The current user's presence payload; null disables (nothing to track). */
  self: PresencePayload | null;
  enabled?: boolean;
}

export interface PresenceState {
  members: PresencePayload[];
  count: number;
}

/**
 * Tracks who is present in a workspace via the platform's presence helper.
 * Joins on subscribe, syncs on presence events, and cleans up on unmount.
 * Read-only infrastructure — no business logic.
 */
export function usePresence({ workspaceId, self, enabled = true }: UsePresenceOptions): PresenceState {
  const { platform } = useRealtime();
  const [members, setMembers] = useState<PresencePayload[]>([]);

  useEffect(() => {
    if (!platform || !workspaceId || !self || !enabled) {
      setMembers([]);
      return;
    }

    const dispose = platform.createPresence(presenceChannel(workspaceId), self, setMembers);
    return dispose;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, workspaceId, enabled, self?.userId]);

  return { members, count: members.length };
}
