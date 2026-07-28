/**
 * ChannelManager — channel pooling and reuse (single responsibility).
 *
 * One channel per name, ref-counted, so many subscribers share a connection
 * (connection reuse). Removes a channel once its last reference is released and
 * tells the ConnectionManager to return to idle when none remain. Keeps the
 * metrics channel gauge current.
 */
import type { ConnectionManager } from "@/lib/realtime/connection";
import type { RealtimeLogger } from "@/lib/realtime/logger";
import type { MetricsCollector } from "@/lib/realtime/metrics";
import type { ChannelOptions, RealtimeChannel } from "@/lib/realtime/types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";

interface ChannelEntry {
  channel: RealtimeChannel;
  refCount: number;
}

export class ChannelManager {
  private readonly channels = new Map<string, ChannelEntry>();

  constructor(
    private readonly client: TypedSupabaseClient,
    private readonly connection: ConnectionManager,
    private readonly metrics: MetricsCollector,
    private readonly logger: RealtimeLogger,
  ) {}

  /**
   * Acquire a channel by name. Reuses an existing channel (incrementing its
   * ref count) or creates a new one. `isNew` tells the caller whether it must
   * configure handlers and subscribe.
   */
  acquire(name: string, options?: ChannelOptions): { channel: RealtimeChannel; isNew: boolean } {
    const existing = this.channels.get(name);
    if (existing) {
      existing.refCount += 1;
      return { channel: existing.channel, isNew: false };
    }

    const channel = options ? this.client.channel(name, options) : this.client.channel(name);
    this.channels.set(name, { channel, refCount: 1 });
    this.metrics.setChannelCount(this.channels.size);
    this.logger.debug("channel acquired", { name });
    return { channel, isNew: true };
  }

  get(name: string): RealtimeChannel | null {
    return this.channels.get(name)?.channel ?? null;
  }

  /** Release a reference; removes + unsubscribes the channel when none remain. */
  release(name: string): void {
    const entry = this.channels.get(name);
    if (!entry) return;

    entry.refCount -= 1;
    if (entry.refCount > 0) return;

    void this.client.removeChannel(entry.channel);
    this.channels.delete(name);
    this.metrics.setChannelCount(this.channels.size);
    this.logger.debug("channel released", { name });

    if (this.channels.size === 0) this.connection.notifyIdle();
  }

  removeAll(): void {
    for (const entry of this.channels.values()) {
      void this.client.removeChannel(entry.channel);
    }
    this.channels.clear();
    this.metrics.setChannelCount(0);
    this.connection.notifyIdle();
  }

  activeChannelCount(): number {
    return this.channels.size;
  }
}
