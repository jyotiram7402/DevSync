"use client";

import { useEffect, useRef } from "react";

import { useRealtime } from "@/hooks/use-realtime";
import type { RealtimeChannel } from "@/lib/realtime/types";

export interface UseRealtimeChannelOptions {
  /** Channel name (from lib/realtime/channels). Null/undefined disables the subscription. */
  name: string | null | undefined;
  /** Register handlers on the channel. Called once, before subscribe, on first acquire. */
  configure: (channel: RealtimeChannel) => void;
  /** Set false to temporarily disable without unmounting. */
  enabled?: boolean;
  /**
   * Raw subscribe-status updates ("SUBSCRIBED", "CHANNEL_ERROR", "TIMED_OUT",
   * "CLOSED"), including the "SUBSCRIBED" that follows a reconnect. Only the
   * mount that created the channel receives them.
   */
  onStatus?: ((status: string) => void) | undefined;
}

/**
 * Generic subscription lifecycle: acquires a (reused, ref-counted) channel from
 * the platform, configures + subscribes on first acquire, and releases on
 * cleanup. The subscribe-status string is fed to the connection layer to drive
 * aggregate status. Handlers passed to `configure` should be stable.
 */
export function useRealtimeChannel({
  name,
  configure,
  enabled = true,
  onStatus,
}: UseRealtimeChannelOptions): void {
  const { platform } = useRealtime();
  const onStatusRef = useRef(onStatus);

  useEffect(() => {
    onStatusRef.current = onStatus;
  }, [onStatus]);

  useEffect(() => {
    if (!platform || !name || !enabled) return;

    const { channel, isNew } = platform.channels.acquire(name);
    if (isNew) {
      configure(channel);
      channel.subscribe((status: string) => {
        platform.connection.reportChannelStatus(status);
        onStatusRef.current?.(status);
      });
    }

    return () => platform.channels.release(name);
    // `configure` is intentionally omitted; `name`/`enabled` drive the lifecycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platform, name, enabled]);
}
