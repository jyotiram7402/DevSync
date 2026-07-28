import "server-only";

import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Resolves the caller's active workspace (personal workspace until workspace
 * switching is wired). Used by the dashboard layout to scope the sync channel.
 */
export async function getActiveWorkspace(): Promise<{ userId: string; workspaceId: string } | null> {
  const client = await createServerSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client
    .from("workspaces")
    .select("id")
    .eq("owner_id", user.id)
    .eq("is_personal", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { userId: user.id, workspaceId: data.id };
}
