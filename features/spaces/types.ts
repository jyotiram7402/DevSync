/**
 * Spaces — CopyAnywhere's shared project rooms. People join a Space by a short
 * code, an invite link, or an email invite, and everything shared appears live
 * for every member. Rooms are permanent until the owner deletes them.
 */

/** In-room tab a shared item belongs to. */
export type SpaceCategory = "error" | "code" | "doc" | "file";

export const SPACE_CATEGORIES: readonly SpaceCategory[] = ["error", "code", "doc", "file"];

/** A shared room. */
export interface Space {
  id: string;
  code: string;
  name: string;
  createdBy: string;
  createdAt: string;
  /** Null for permanent rooms (the default). */
  expiresAt: string | null;
}

/** One shared entry inside a space (text, link, or file). */
export interface SpaceItem {
  id: string;
  spaceId: string;
  userId: string;
  kind: string;
  category: SpaceCategory;
  /** Text/link content, or the file name for attachments. */
  content: string;
  /** Storage path for file attachments (null for text/links). */
  path: string | null;
  mimeType: string | null;
  size: number | null;
  /** Friendly label for who shared it (e.g. email prefix). */
  author: string | null;
  createdAt: string;
  /** True if the current user shared this item. */
  mine: boolean;
}

/** A person in a room. */
export interface SpaceMember {
  userId: string;
  email: string | null;
  displayName: string | null;
  joinedAt: string;
  isOwner: boolean;
  /** True for the current user. */
  isYou: boolean;
}

/** Everything needed to render a room for the current user. */
export interface SpaceView {
  space: Space;
  items: SpaceItem[];
  members: SpaceMember[];
  isOwner: boolean;
  currentUserId: string;
}
