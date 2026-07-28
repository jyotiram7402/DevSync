/**
 * EventBus — a typed, low-latency, in-memory pub/sub.
 *
 * The application layer subscribes here rather than touching channels. Events
 * carry a scope (local | remote | internal) so consumers can distinguish an
 * optimistic local action from a confirmed remote change or a platform signal.
 *
 * Dispatch is synchronous and allocation-light: a Map of name → Set<handler>,
 * plus a wildcard set. Unsubscribe is O(1) via the returned disposer.
 */
import { EVENT_SCOPES } from "@/lib/realtime/constants";
import type { BusEvent, EventScope } from "@/lib/realtime/types";

export type BusHandler<T = unknown> = (event: BusEvent<T>) => void;

const WILDCARD = "*";

export class EventBus {
  private readonly handlers = new Map<string, Set<BusHandler>>();

  /**
   * Subscribe to a named event, or to every event with `"*"`. Returns a
   * disposer; call it to unsubscribe (idempotent).
   */
  on<T = unknown>(name: string, handler: BusHandler<T>): () => void {
    const existing = this.handlers.get(name);
    const set = existing ?? new Set<BusHandler>();
    if (!existing) this.handlers.set(name, set);
    set.add(handler as BusHandler);

    return () => {
      const current = this.handlers.get(name);
      if (!current) return;
      current.delete(handler as BusHandler);
      if (current.size === 0) this.handlers.delete(name);
    };
  }

  /** Subscribe for a single delivery, then auto-unsubscribe. */
  once<T = unknown>(name: string, handler: BusHandler<T>): () => void {
    const off = this.on<T>(name, (event) => {
      off();
      handler(event);
    });
    return off;
  }

  /** Dispatch a fully-formed event to name-specific and wildcard listeners. */
  emit<T = unknown>(event: BusEvent<T>): void {
    const named = this.handlers.get(event.name);
    if (named) {
      for (const handler of named) handler(event as BusEvent);
    }
    const wildcard = this.handlers.get(WILDCARD);
    if (wildcard) {
      for (const handler of wildcard) handler(event as BusEvent);
    }
  }

  /** Build and emit an event with the given scope. */
  publish<T = unknown>(name: string, payload: T, scope: EventScope, version = 1): void {
    this.emit<T>({
      name,
      payload,
      scope,
      version,
      at: new Date().toISOString(),
    });
  }

  publishLocal<T = unknown>(name: string, payload: T, version = 1): void {
    this.publish(name, payload, EVENT_SCOPES.local, version);
  }

  publishRemote<T = unknown>(name: string, payload: T, version = 1): void {
    this.publish(name, payload, EVENT_SCOPES.remote, version);
  }

  publishInternal<T = unknown>(name: string, payload: T, version = 1): void {
    this.publish(name, payload, EVENT_SCOPES.internal, version);
  }

  /** Number of distinct event names with at least one listener. */
  listenerNames(): number {
    return this.handlers.size;
  }

  clear(): void {
    this.handlers.clear();
  }
}
