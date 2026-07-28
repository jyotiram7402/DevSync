/**
 * EventRouter — the bridge between raw channel messages and the typed EventBus.
 *
 * Incoming broadcast messages are deserialized, validated (and version-upgraded)
 * against the EventRegistry, then republished onto the bus as `remote` events.
 * Invalid, unauthorized, or malformed messages are dropped and counted — never
 * forwarded. Duplicate detection is keyed by an optional id+timestamp.
 */
import { deserialize } from "@/lib/realtime/deserializer";
import type { EventBus } from "@/lib/realtime/event-bus";
import type { EventRegistry } from "@/lib/realtime/event-registry";
import type { RealtimeLogger } from "@/lib/realtime/logger";
import type { MetricsCollector } from "@/lib/realtime/metrics";
import { REALTIME_LIMITS } from "@/lib/realtime/constants";

export class EventRouter {
  private readonly seen = new Set<string>();

  constructor(
    private readonly bus: EventBus,
    private readonly registry: EventRegistry,
    private readonly metrics: MetricsCollector,
    private readonly logger: RealtimeLogger,
  ) {}

  /**
   * Route one incoming broadcast message. `fallbackName` handles bare payloads
   * from pre-envelope senders; `dedupeKey` (if provided) drops replays.
   */
  routeIncoming(raw: unknown, fallbackName?: string, dedupeKey?: string): void {
    const message = deserialize(raw, fallbackName);
    if (!message) {
      this.metrics.incrementDropped();
      this.logger.warn("dropped malformed message");
      return;
    }

    if (dedupeKey !== undefined) {
      if (this.seen.has(dedupeKey)) {
        this.metrics.incrementDuplicate();
        return;
      }
      if (this.seen.size > REALTIME_LIMITS.maxSeenEvents) this.seen.clear();
      this.seen.add(dedupeKey);
    }

    const { ok, payload } = this.registry.validate(message.name, message.payload, message.version);
    if (!ok) {
      this.metrics.incrementDropped();
      this.logger.warn("dropped invalid payload", { name: message.name });
      return;
    }

    this.bus.publishRemote(message.name, payload, message.version);
  }

  reset(): void {
    this.seen.clear();
  }
}
