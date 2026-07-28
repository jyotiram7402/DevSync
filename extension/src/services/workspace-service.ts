import { getSupabaseClient } from "@ext/shared/supabase-client";
import type { WorkspaceInfo } from "@ext/types";

/**
 * Resolves the caller's active workspace (personal workspace for now, matching
 * the web app). RLS guarantees only workspaces the user may see are returned.
 */
export async function getActiveWorkspace(): Promise<WorkspaceInfo | null> {
  const client = getSupabaseClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;

  const { data, error } = await client
    .from("workspaces")
    .select("id,name")
    .eq("owner_id", user.id)
    .eq("is_personal", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return { id: data.id, name: data.name };
}
