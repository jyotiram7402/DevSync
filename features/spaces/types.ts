/**
 * Spaces — CopyAnywhere's cross-user shared rooms. People join a Space by a
 * short code and everything shared appears live for every member. Ephemeral by
 * design (rooms auto-expire).
 */

/** A shared room. */
export interface Space {
  id: string;
  code: string;
  name: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
}

/** One shared entry inside a space (text, link, or file). */
export interface SpaceItem {
  id: string;
  spaceId: string;
  userId: string;
  kind: string;
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

/** Everything needed to render a room for the current user. */
export interface SpaceView {
  space: Space;
  items: SpaceItem[];
  memberCount: number;
  isOwner: boolean;
  currentUserId: string;
}
