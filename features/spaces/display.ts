import type { SpaceItem } from "@/features/spaces/types";
import { kindFromFile, type ItemKind } from "@/lib/item-kinds";

/**
 * Display helpers for Spaces (presentation only; nothing here is stored).
 */

/** Files by their type, links as links, text by the tab it was shared to. */
export function spaceItemKind(item: SpaceItem): ItemKind {
  if (item.path) return kindFromFile(item.content, item.mimeType);
  if (item.kind === "url") return "link";
  return item.category === "error" ? "error" : "code";
}

/** Who shared it: "You", or the sharer's short name. */
export function spaceItemAuthor(item: SpaceItem): string {
  return item.mine ? "You" : (item.author ?? "Someone");
}

/**
 * Where an invite link points. The code is part of the path (not the query
 * string) so it survives the trip through sign-in for someone signed out.
 */
export function joinPath(code: string): string {
  return `/dashboard/spaces/join/${encodeURIComponent(code)}`;
}

function decode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * The room code in whatever was pasted: the code itself (any case, with
 * spaces or dashes), or a whole invite link, new style or old.
 */
export function normalizeRoomCode(input: string): string {
  const value = input.trim();
  const fromLink = /\/join\/([^/?#\s]+)/i.exec(value)?.[1] ?? /[?&]join=([^&#\s]+)/i.exec(value)?.[1];
  return (fromLink ? decode(fromLink) : value).replace(/[\s-]+/g, "").toUpperCase();
}
