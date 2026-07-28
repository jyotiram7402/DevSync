import { getSupabaseClient } from "@ext/shared/supabase-client";
import type { SessionMeta } from "@ext/types";

/**
 * Authentication — thin wrapper over Supabase Auth (the SAME auth backend the
 * web app uses). Session persistence + token refresh are handled by
 * supabase-js against the chrome.storage adapter; no auth logic is duplicated.
 */
function toSessionMeta(user: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): SessionMeta | null {
  if (!user) return null;
  const displayName =
    typeof user.user_metadata?.display_name === "string"
      ? (user.user_metadata.display_name as string)
      : typeof user.user_metadata?.full_name === "string"
        ? (user.user_metadata.full_name as string)
        : null;
  return { userId: user.id, email: user.email ?? null, displayName };
}

export async function getSessionMeta(): Promise<SessionMeta | null> {
  const { data } = await getSupabaseClient().auth.getSession();
  return toSessionMeta(data.session?.user ?? null);
}

export async function signInWithPassword(email: string, password: string): Promise<SessionMeta> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    throw new Error(error?.message ?? "Sign in failed.");
  }
  const meta = toSessionMeta(data.session.user);
  if (!meta) throw new Error("Sign in failed.");
  return meta;
}

export async function signOut(): Promise<void> {
  await getSupabaseClient().auth.signOut();
}

/** Subscribe to auth changes (sign-in, sign-out, token refresh, expiry). */
export function onAuthChange(listener: (meta: SessionMeta | null) => void): () => void {
  const { data } = getSupabaseClient().auth.onAuthStateChange((_event, session) => {
    listener(toSessionMeta(session?.user ?? null));
  });
  return () => data.subscription.unsubscribe();
}
