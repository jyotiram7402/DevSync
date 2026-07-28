import { supabase } from "~/lib/supabase";
import type { WorkspaceInfo } from "~/types";

/** Active (personal) workspace — RLS-scoped, matching web + extension. */
export async function getActiveWorkspace(): Promise<WorkspaceInfo | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
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
