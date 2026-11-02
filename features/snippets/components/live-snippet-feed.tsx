"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { ArrivalFeed } from "@/components/items/arrival-feed";
import { SnippetRow } from "@/features/snippets/components/snippet-row";
import { onSavedSnippet } from "@/features/snippets/live-events";
import type { SnippetPermissions } from "@/features/snippets/permissions";
import { mapSnippetRow } from "@/features/snippets/services/snippet-mapper";
import type { Snippet, SnippetSort, SnippetStatus } from "@/features/snippets/types";
import {
  parseSnippetChange,
  snippetsChangeFilter,
} from "@/features/sync/services/realtime-sync-service";
import { useLiveChannel } from "@/hooks/use-live-channel";
import { workspaceChannel } from "@/lib/realtime/channels";
import type { RealtimeChannel } from "@/lib/realtime/types";
import { cn } from "@/utils/cn";

/**
 * A snippet list that updates in place. The page renders it with the rows it
 * loaded; after that, a save on any device reaches this list straight from the
 * live update (the row travels with the event), so it appears well under a
 * second later without re-rendering the page. A save on this device shows up
 * sooner still, from the saved row itself.
 *
 * The server is still asked for the page again a little later, in the
 * background, to settle counts, pages and anything an event didn't carry. The
 * list keeps what it already knows while that answer is on its way, and after
 * a reconnect, a return to the tab or the network coming back it asks at once,
 * because events sent meanwhile are gone for good.
 */

/** What the page's query asked for; a changed row only joins the list if it matches. */
export interface LiveListQuery {
  status: SnippetStatus;
  sort: SnippetSort;
  page: number;
  pageSize: number;
  projectId?: string | undefined;
  language?: string | undefined;
  search?: string | undefined;
  /** Code and text only (the Snippets views); library kinds have their own pages. */
  contentOnly: boolean;
}

/** A row that changed: its new state, or null when it left this list. */
interface Change {
  id: string;
  snippet: Snippet | null;
  at: number;
}

/** Changes younger than this are re-applied on top of fresh server rows (they may postdate the fetch). */
const RECENT_MS = 15_000;
/** Quiet time after the last change before the page is re-rendered from the server. */
const RECONCILE_MS = 2_000;
/** After a reconnect or a return to the tab, ask the server almost at once. */
const RESYNC_MS = 150;

function time(value: string): number {
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

/** Newest first; ties broken on the raw text so the order is stable. */
function newestFirst(a: string, b: string): number {
  const diff = time(b) - time(a);
  if (diff !== 0) return diff;
  return a < b ? 1 : a > b ? -1 : 0;
}

/** Mirrors the order the repository asks the database for. */
function compare(a: Snippet, b: Snippet, sort: SnippetSort): number {
  if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
  switch (sort) {
    case "created":
      return newestFirst(a.createdAt, b.createdAt);
    case "title":
      if (a.title === null || b.title === null) {
        if (a.title === b.title) return 0;
        return a.title === null ? 1 : -1;
      }
      return a.title.localeCompare(b.title);
    case "favorite":
      if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;
      return newestFirst(a.updatedAt, b.updatedAt);
    default:
      return newestFirst(a.updatedAt, b.updatedAt);
  }
}

/** Same cleanup as the repository's search, so a live row is judged like a fetched one. */
function searchTerm(search: string): string {
  return search.replace(/[,()*%]/g, " ").trim().toLowerCase();
}

function matches(snippet: Snippet, query: LiveListQuery): boolean {
  if (snippet.archived !== (query.status === "archived")) return false;
  if (query.projectId && snippet.projectId !== query.projectId) return false;
  if (query.language && snippet.language !== query.language) return false;
  if (query.contentOnly) {
    const kind = snippet.metadata.kind;
    if (kind !== undefined && kind !== null && kind !== "text" && kind !== "code") return false;
  }
  if (query.search) {
    const term = searchTerm(query.search);
    if (
      term.length > 0 &&
      !(snippet.title ?? "").toLowerCase().includes(term) &&
      !snippet.content.toLowerCase().includes(term)
    ) {
      return false;
    }
  }
  return true;
}

function applyChange(list: Snippet[], change: Change, query: LiveListQuery): Snippet[] {
  const rest = list.filter((item) => item.id !== change.id);
  if (!change.snippet || !matches(change.snippet, query)) {
    return rest.length === list.length ? list : rest;
  }
  return [...rest, change.snippet].sort((a, b) => compare(a, b, query.sort)).slice(0, query.pageSize);
}

/** Fresh server rows, with the changes that may have arrived after they were fetched put back on top. */
function replay(base: Snippet[], recent: Map<string, Change>, query: LiveListQuery): Snippet[] {
  const cutoff = Date.now() - RECENT_MS;
  const changes = [...recent.values()]
    .filter((change) => change.at >= cutoff)
    .sort((a, b) => a.at - b.at);
  return changes.reduce((list, change) => applyChange(list, change, query), base);
}

export function LiveSnippetFeed({
  initial,
  workspaceId,
  permissions,
  query,
  label,
  resetKey,
  className,
  selectable = true,
  empty,
}: {
  /** The rows the page loaded. A new array (after a refresh) replaces the list. */
  initial: Snippet[];
  workspaceId: string;
  permissions: SnippetPermissions;
  query: LiveListQuery;
  /** Accessible name of the list, e.g. "Snippets". */
  label: string;
  resetKey?: string;
  className?: string;
  selectable?: boolean;
  /** Shown instead of the list while it is empty. */
  empty: ReactNode;
}) {
  const router = useRouter();
  const [prevInitial, setPrevInitial] = useState(initial);
  const [snippets, setSnippets] = useState(initial);
  const recentRef = useRef<Map<string, Change>>(new Map());
  const queryRef = useRef(query);
  const reconcileTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [instance] = useState(() => Math.random().toString(36).slice(2, 10));

  // The server answered (a refresh): start from its rows, keep what arrived since.
  if (prevInitial !== initial) {
    setPrevInitial(initial);
    setSnippets(replay(initial, recentRef.current, query));
  }

  useEffect(() => {
    queryRef.current = query;
  }, [query]);

  const scheduleReconcile = useCallback(
    (delay: number = RECONCILE_MS) => {
      if (reconcileTimer.current) clearTimeout(reconcileTimer.current);
      reconcileTimer.current = setTimeout(() => {
        reconcileTimer.current = null;
        router.refresh();
      }, delay);
    },
    [router],
  );

  const apply = useCallback((change: Change) => {
    const recent = recentRef.current;
    const cutoff = Date.now() - RECENT_MS;
    for (const [id, entry] of recent) {
      if (entry.at < cutoff) recent.delete(id);
    }
    recent.set(change.id, change);
    setSnippets((current) => applyChange(current, change, queryRef.current));
  }, []);

  // A change from the live update: the event carries the row (INSERT/UPDATE)
  // or its id (DELETE). Pages after the first are left to the server, which
  // alone knows what belongs on them.
  const handleRemote = useCallback(
    (payload: unknown) => {
      const change = parseSnippetChange(payload);
      if (!change || !change.id) return;
      if (queryRef.current.page <= 1) {
        if (change.action === "delete") {
          apply({ id: change.id, snippet: null, at: Date.now() });
        } else if (change.row) {
          const snippet = change.row.deleted_at === null ? mapSnippetRow(change.row) : null;
          apply({ id: change.id, snippet, at: Date.now() });
        }
      }
      scheduleReconcile();
    },
    [apply, scheduleReconcile],
  );
  const remoteRef = useRef(handleRemote);
  useEffect(() => {
    remoteRef.current = handleRemote;
  }, [handleRemote]);

  const configure = useCallback(
    (channel: RealtimeChannel) => {
      channel.on("postgres_changes", snippetsChangeFilter(workspaceId), (payload: unknown) => {
        remoteRef.current(payload);
      });
    },
    [workspaceId],
  );

  useLiveChannel({
    name: `${workspaceChannel(workspaceId)}:feed-${instance}`,
    configure,
    onResync: () => scheduleReconcile(RESYNC_MS),
  });

  // A save made on this device: show it right away.
  useEffect(
    () =>
      onSavedSnippet((snippet) => {
        if (snippet.workspaceId !== workspaceId) return;
        if (queryRef.current.page <= 1) apply({ id: snippet.id, snippet, at: Date.now() });
        scheduleReconcile();
      }),
    [workspaceId, apply, scheduleReconcile],
  );

  useEffect(
    () => () => {
      if (reconcileTimer.current) clearTimeout(reconcileTimer.current);
    },
    [],
  );

  return (
    <>
      {snippets.length === 0 ? empty : null}
      {/* Kept mounted while empty so the first arrival still slides in. */}
      <ArrivalFeed
        label={label}
        resetKey={resetKey}
        className={cn(className, snippets.length === 0 && "hidden")}
        entries={snippets.map((snippet) => ({
          id: snippet.id,
          node: <SnippetRow snippet={snippet} permissions={permissions} selectable={selectable} />,
        }))}
      />
    </>
  );
}
