"use client";

import { useMemo } from "react";

import { useSubscription } from "@/hooks/use-subscription";
import type {
  ChannelBinding,
  ChannelOptions,
  SubscriptionPriority,
} from "@/lib/realtime/types";

export interface UseChannelOptions {
  /** Channel name (from lib/realtime/channels). Null disables. */
  name: string | null | undefined;
  /** Bindings to attach before subscribe. */
  bindings: ChannelBinding[];
  channelOptions?: ChannelOptions;
  priority?: SubscriptionPriority;
  onStatus?: (status: string) => void;
  enabled?: boolean;
}

/**
 * Convenience over useSubscription for the common "attach these bindings to a
 * named channel" case. The subscription key defaults to the channel name, so a
 * channel is shared across consumers with the same name.
 */
export function useChannel({
  name,
  bindings,
  channelOptions,
  priority,
  onStatus,
  enabled = true,
}: UseChannelOptions): void {
  const descriptor = useMemo(() => {
    if (!name) return null;
    return {
      key: name,
      channelName: name,
      bindings,
      ...(channelOptions ? { channelOptions } : {}),
      ...(priority ? { priority } : {}),
      ...(onStatus ? { onStatus } : {}),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useSubscription(descriptor, enabled);
}
