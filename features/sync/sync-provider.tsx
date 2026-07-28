"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";

import { createSnippetAction } from "@/features/snippets/actions";
import { heartbeatAction, registerDeviceAction } from "@/features/sync/actions";
import { createSyncEvent, SyncEventDispatcher } from "@/features/sync/events";
import {
  readClipboardText,
  validateClipboardContent,
} from "@/features/sync/services/clipboard-sync-service";
import { isDuplicate } from "@/features/sync/services/conflict-resolver";
import { offlineQueue } from "@/features/sync/services/offline-queue-service";
import {
  normalizeSnippetChange,
  snippetsChangeFilter,
} from "@/features/sync/services/realtime-sync-service";
import { appendHistory } from "@/features/sync/services/sync-history-service";
import type {
  DevicePresence,
  SyncEvent,
  SyncEventType,
  SyncQueueItem,
  SyncStatus,
} from "@/features/sync/types";
import { useConnectionStatus } from "@/hooks/use-connection-status";
import { usePresence } from "@/hooks/use-presence";
import { useRealtime } from "@/hooks/use-realtime";
import { useRealtimeChannel } from "@/hooks/use-realtime-channel";
import { getDeviceMetadata } from "@/lib/device/device";
import { workspaceChannel } from "@/lib/realtime/channels";
import type { ConnectionStatus, PresencePayload, RealtimeChannel } from "@/lib/realtime/types";
import { isRecentLocalWrite, markLocalWrite } from "@/lib/sync/local-echo";
import type { DeviceMetadata } from "@/types/device";

/**
 * SyncProvider — orchestrates the clipboard synchronization engine on the
 * client:
 *   • registers this device and sends periodic heartbeats,
 *   • subscribes to the workspace's snippet changes (postgres_changes),
 *     filtering out duplicate deliveries and the echo of its own writes,
 *   • tracks live device presence,
 *   • reconciles server state via a debounced router.refresh (no client cache
 *     duplication, no infinite loops — a received change triggers a refetch,
 *     never another write),
 *   • captures the clipboard on demand and, when offline, queues the change for
 *     retry on reconnect.
 *
 * All realtime plumbing is delegated to the shared RealtimePlatform; this
 * module owns only sync semantics. Everything degrades gracefully when there is no
 * active workspace or Supabase is unconfigured (manager is null).
 */
const HEARTBEAT_INTERVAL_MS = 120_000;
const REFRESH_DEBOUNCE_MS = 400;
const SEEN_LIMIT = 1_000;

export interface SyncContextValue {
  status: SyncStatus;
  connectionStatus: ConnectionStatus;
  isOnline: boolean;
  lastSyncedAt: string | null;
  device: DeviceMetadata | null;
  devices: DevicePresence[];
  queue: SyncQueueItem[];
  history: SyncEvent[];
  dispatcher: SyncEventDispatcher;
  syncClipboard: () => Promise<void>;
  flushQueue: () => Promise<void>;
  clearHistory: () => void;
}

export const SyncContext = createContext<SyncContextValue | undefined>(undefined);

interface SyncProviderProps {
  workspaceId: string | null;
  userId: string | null;
  children: ReactNode;
}

export function SyncProvider({ workspaceId, userId, children }: SyncProviderProps) {
  const router = useRouter();
  const { platform } = useRealtime();
  const { status: connectionStatus, isOnline } = useConnectionStatus();

  const [device, setDevice] = useState<DeviceMetadata | null>(null);
  const [devicesState, setDevicesState] = useState<DevicePresence[]>([]);
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [history, setHistory] = useState<SyncEvent[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  const dispatcherRef = useRef<SyncEventDispatcher | null>(null);
  if (dispatcherRef.current === null) dispatcherRef.current = new SyncEventDispatcher();
  const dispatcher = dispatcherRef.current;

  const seenRef = useRef<Set<string>>(new Set());
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleChangeRef = useRef<(payload: unknown) => void>(() => {});
  const wasOnlineRef = useRef(isOnline);

  // Emit a sync event: dispatch to subscribers and append to session history
  // (heartbeats are dispatched but kept out of history to avoid noise).
  const emit = useCallback(
    (type: SyncEventType, message: string, entityId?: string) => {
      const event = createSyncEvent(type, message, entityId);
      if (type !== "heartbeat.received") {
        setHistory((prev) => appendHistory(prev, event));
      }
      dispatcher.emit(event);
    },
    [dispatcher],
  );

  // Debounced reconciliation: coalesce bursts of remote changes into one refetch.
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    refreshTimerRef.current = setTimeout(() => {
      router.refresh();
    }, REFRESH_DEBOUNCE_MS);
  }, [router]);

  // --- Device registration + heartbeat ------------------------------------
  useEffect(() => {
    const metadata = getDeviceMetadata();
    setDevice(metadata);

    let cancelled = false;
    void registerDeviceAction(metadata).then((result) => {
      if (!cancelled && result.ok) {
        emit("device.connected", `${metadata.name} connected`, metadata.deviceId);
      }
    });

    const interval = setInterval(() => {
      void heartbeatAction(metadata.deviceId).then((result) => {
        if (result.ok) emit("heartbeat.received", "Heartbeat", metadata.deviceId);
      });
    }, HEARTBEAT_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [emit]);

  // --- Device presence ------------------------------------------------------
  const self = useMemo<PresencePayload | null>(() => {
    if (!device || !userId) return null;
    return {
      userId,
      deviceId: device.deviceId,
      displayName: device.name,
      onlineAt: new Date().toISOString(),
    };
  }, [device, userId]);

  const presence = usePresence({
    workspaceId,
    self,
    enabled: Boolean(workspaceId && self),
  });

  useEffect(() => {
    setDevicesState(
      presence.members.map((member) => ({
        deviceId: typeof member.deviceId === "string" ? member.deviceId : "unknown",
        userId: member.userId,
        name:
          typeof member.displayName === "string" && member.displayName.length > 0
            ? member.displayName
            : "Unknown device",
        os: null,
        browser: null,
        onlineAt: member.onlineAt,
      })),
    );
  }, [presence.members]);

  // --- Incoming snippet changes (postgres_changes) --------------------------
  const handleChange = useCallback(
    (payload: unknown) => {
      const change = normalizeSnippetChange(payload);
      if (!change || !change.id) return; // reject malformed / unidentifiable events

      if (seenRef.current.size > SEEN_LIMIT) seenRef.current.clear();
      const key = `${change.id}:${change.commitTimestamp}`;
      if (isDuplicate(seenRef.current, key)) return; // idempotent delivery
      if (isRecentLocalWrite(change.id)) return; // ignore echo of our own write

      const type: SyncEventType =
        change.action === "create"
          ? "snippet.created"
          : change.action === "update"
            ? "snippet.updated"
            : "snippet.deleted";
      const verb =
        change.action === "create" ? "created" : change.action === "update" ? "updated" : "deleted";

      emit(type, `A snippet was ${verb} on another device`, change.id);
      setLastSyncedAt(new Date().toISOString());
      scheduleRefresh();
    },
    [emit, scheduleRefresh],
  );

  useEffect(() => {
    handleChangeRef.current = handleChange;
  }, [handleChange]);

  const workspaceName = workspaceId ? workspaceChannel(workspaceId) : null;

  const configureWorkspace = useCallback(
    (channel: RealtimeChannel) => {
      if (!workspaceId) return;
      channel.on("postgres_changes", snippetsChangeFilter(workspaceId), (payload: unknown) => {
        handleChangeRef.current(payload);
      });
    },
    [workspaceId],
  );

  useRealtimeChannel({
    name: workspaceName,
    configure: configureWorkspace,
    enabled: Boolean(workspaceName && platform),
  });

  // --- Offline queue --------------------------------------------------------
  const flushQueue = useCallback(async () => {
    const items = offlineQueue.list();
    if (items.length === 0) return;

    setIsSyncing(true);
    emit("sync.started", `Retrying ${items.length} queued ${items.length === 1 ? "change" : "changes"}`);

    for (const item of items) {
      const values = {
        content: item.payload.content,
        ...(item.payload.title ? { title: item.payload.title } : {}),
        ...(item.payload.language ? { language: item.payload.language } : {}),
      };
      // Sequential on purpose: preserves order and avoids a write burst.
      // eslint-disable-next-line no-await-in-loop
      const result = await createSnippetAction(values);
      if (result.ok) {
        markLocalWrite(result.data.id);
        offlineQueue.remove(item.id);
        emit("sync.completed", "Queued change synced", result.data.id);
      } else {
        offlineQueue.recordAttempt(item.id);
        emit("sync.failed", result.error.message, item.id);
      }
    }

    setQueue(offlineQueue.list());
    setIsSyncing(false);
    setLastSyncedAt(new Date().toISOString());
    scheduleRefresh();
  }, [emit, scheduleRefresh]);

  // Hydrate the queue and attempt a flush on mount (client only).
  useEffect(() => {
    setQueue(offlineQueue.list());
    if (typeof navigator !== "undefined" && navigator.onLine) void flushQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Flush automatically when the network comes back.
  useEffect(() => {
    if (isOnline && !wasOnlineRef.current) void flushQueue();
    wasOnlineRef.current = isOnline;
  }, [isOnline, flushQueue]);

  // --- Manual clipboard sync ------------------------------------------------
  const syncClipboard = useCallback(async () => {
    const validation = validateClipboardContent(await readClipboardText());
    if (!validation.ok || !validation.content) {
      toast.error(validation.message ?? "Nothing to sync.");
      return;
    }
    const content = validation.content;
    emit("clipboard.copied", "Clipboard captured");

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setQueue(offlineQueue.enqueue({ kind: "create-snippet", payload: { content } }));
      emit("sync.failed", "Offline — change queued for retry");
      toast.info("You're offline — queued to sync when you reconnect.");
      return;
    }

    setIsSyncing(true);
    emit("sync.started", "Syncing clipboard");
    const result = await createSnippetAction({ content });
    setIsSyncing(false);

    if (!result.ok) {
      setQueue(offlineQueue.enqueue({ kind: "create-snippet", payload: { content } }));
      emit("sync.failed", result.error.message);
      toast.error(result.error.message);
      return;
    }

    markLocalWrite(result.data.id);
    setLastSyncedAt(new Date().toISOString());
    emit("sync.completed", "Clipboard synced", result.data.id);
    toast.success("Clipboard synced");
    scheduleRefresh();
  }, [emit, scheduleRefresh]);

  const clearHistory = useCallback(() => setHistory([]), []);

  // Clean up the pending refresh timer on unmount.
  useEffect(
    () => () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    },
    [],
  );

  const status: SyncStatus = useMemo(() => {
    if (!isOnline) return "offline";
    if (isSyncing) return "syncing";
    if (connectionStatus === "error") return "error";
    if (lastSyncedAt) return "synced";
    return "idle";
  }, [isOnline, isSyncing, connectionStatus, lastSyncedAt]);

  const value = useMemo<SyncContextValue>(
    () => ({
      status,
      connectionStatus,
      isOnline,
      lastSyncedAt,
      device,
      devices: devicesState,
      queue,
      history,
      dispatcher,
      syncClipboard,
      flushQueue,
      clearHistory,
    }),
    [
      status,
      connectionStatus,
      isOnline,
      lastSyncedAt,
      device,
      devicesState,
      queue,
      history,
      dispatcher,
      syncClipboard,
      flushQueue,
      clearHistory,
    ],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
