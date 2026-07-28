/**
 * EventRegistry — the catalog of known event types, their current schema
 * version, and a validator. Enables typed dispatch, payload validation, and
 * schema evolution (an optional `upgrade` migrates older payloads forward).
 *
 * Business features register their events here; the platform stays generic.
 */
import { REALTIME_EVENTS } from "@/lib/realtime/events";

export interface EventDefinition {
  name: string;
  version: number;
  /** Validate a payload's shape. Reject anything malformed. */
  validate: (payload: unknown) => boolean;
  /** Optionally migrate a payload from an older version to the current one. */
  upgrade?: (payload: unknown, fromVersion: number) => unknown;
}

export class EventRegistry {
  private readonly definitions = new Map<string, EventDefinition>();

  register(definition: EventDefinition): void {
    this.definitions.set(definition.name, definition);
  }

  has(name: string): boolean {
    return this.definitions.has(name);
  }

  get(name: string): EventDefinition | null {
    return this.definitions.get(name) ?? null;
  }

  /**
   * Validate (and upgrade) a payload for a registered event. Unregistered
   * events are permitted but not upgraded — the platform is open by default;
   * strictness is a per-consumer choice.
   */
  validate(name: string, payload: unknown, version: number): { ok: boolean; payload: unknown } {
    const definition = this.definitions.get(name);
    if (!definition) return { ok: true, payload };

    const upgraded =
      version < definition.version && definition.upgrade
        ? definition.upgrade(payload, version)
        : payload;

    return { ok: definition.validate(upgraded), payload: upgraded };
  }

  size(): number {
    return this.definitions.size;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function hasStringField(value: unknown, field: string): boolean {
  return isRecord(value) && typeof value[field] === "string";
}

/**
 * A registry pre-seeded with the app's known realtime events (definitions from
 * lib/realtime/events). Validators check identifier fields only — payloads
 * carry ids, never records, so consumers re-fetch RLS-scoped state.
 */
export function createDefaultRegistry(): EventRegistry {
  const registry = new EventRegistry();

  const requireFields =
    (...fields: string[]) =>
    (payload: unknown): boolean =>
      fields.every((field) => hasStringField(payload, field));

  registry.register({
    name: REALTIME_EVENTS.snippetCreated,
    version: 1,
    validate: requireFields("snippetId", "workspaceId"),
  });
  registry.register({
    name: REALTIME_EVENTS.snippetUpdated,
    version: 1,
    validate: requireFields("snippetId", "workspaceId"),
  });
  registry.register({
    name: REALTIME_EVENTS.snippetDeleted,
    version: 1,
    validate: requireFields("snippetId", "workspaceId"),
  });
  registry.register({
    name: REALTIME_EVENTS.clipboardChanged,
    version: 1,
    validate: requireFields("workspaceId", "deviceId", "contentHash"),
  });
  registry.register({
    name: REALTIME_EVENTS.deviceConnected,
    version: 1,
    validate: requireFields("deviceId", "userId"),
  });
  registry.register({
    name: REALTIME_EVENTS.deviceDisconnected,
    version: 1,
    validate: requireFields("deviceId", "userId"),
  });
  registry.register({
    name: REALTIME_EVENTS.workspaceUpdated,
    version: 1,
    validate: requireFields("workspaceId"),
  });
  registry.register({
    name: REALTIME_EVENTS.userPresenceChanged,
    version: 1,
    validate: requireFields("workspaceId", "userId", "status"),
  });

  return registry;
}
