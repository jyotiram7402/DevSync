import type { User } from "@supabase/supabase-js";

import type { AuthUser } from "@/types/auth";

/**
 * Maps a Supabase auth user into the app's shared AuthUser model.
 *
 * Pure and client-safe (used by both the client AuthProvider and server-side
 * session helpers). Reads display name / avatar from provider user_metadata,
 * tolerating the varying keys different providers use.
 */
function readString(source: Record<string, unknown>, key: string): string | null {
  const value = source[key];
  return typeof value === "string" && value.length > 0 ? value : null;
}

export function toAuthUser(user: User): AuthUser {
  const metadata: Record<string, unknown> = user.user_metadata ?? {};

  const displayName =
    readString(metadata, "full_name") ??
    readString(metadata, "name") ??
    readString(metadata, "user_name") ??
    null;

  const avatarUrl = readString(metadata, "avatar_url") ?? readString(metadata, "picture") ?? null;

  return {
    id: user.id,
    email: user.email ?? null,
    displayName,
    avatarUrl,
    provider: user.app_metadata?.provider ?? null,
    createdAt: user.created_at,
  };
}
