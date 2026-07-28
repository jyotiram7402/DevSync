import type { ProjectListParams, WorkspaceRole } from "@/features/projects/types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

/**
 * ProjectRepository — the ONLY layer that issues project queries. Given a
 * Supabase client (RLS applies as the caller), it returns raw rows and throws
 * on database errors; the service turns throws into the typed ActionResult.
 */

export interface ProjectContext {
  userId: string;
  workspaceId: string;
  role: WorkspaceRole;
}

/**
 * Resolve the caller's active workspace. Until workspace switching is wired,
 * this is the user's personal workspace (which they own).
 */
export async function resolveContext(client: TypedSupabaseClient): Promise<ProjectContext | null> {
  const { data: userData } = await client.auth.getUser();
  const user = userData.user;
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

  if (error) throw error;
  if (!data) return null;

  return { userId: user.id, workspaceId: data.id, role: "owner" };
}

interface ListRowsArgs extends Required<Pick<ProjectListParams, "status" | "sort">> {
  workspaceId: string;
  search: string | undefined;
  from: number;
  to: number;
}

export async function listProjectRows(
  client: TypedSupabaseClient,
  args: ListRowsArgs,
): Promise<{ rows: Tables<"projects">[]; count: number }> {
  let filtered = client
    .from("projects")
    .select("*", { count: "exact" })
    .eq("workspace_id", args.workspaceId)
    .is("deleted_at", null)
    .eq("is_archived", args.status === "archived");

  if (args.search) {
    filtered = filtered.ilike("name", `%${args.search}%`);
  }

  // Pinned first, then the chosen sort.
  let ordered = filtered.order("is_pinned", { ascending: false });
  switch (args.sort) {
    case "name":
      ordered = ordered.order("name", { ascending: true });
      break;
    case "created":
      ordered = ordered.order("created_at", { ascending: false });
      break;
    case "favorite":
      ordered = ordered.order("is_favorite", { ascending: false }).order("updated_at", {
        ascending: false,
      });
      break;
    case "updated":
    default:
      ordered = ordered.order("updated_at", { ascending: false });
      break;
  }

  const { data, error, count } = await ordered.range(args.from, args.to);
  if (error) throw error;
  return { rows: data ?? [], count: count ?? 0 };
}

export async function findProjectRow(
  client: TypedSupabaseClient,
  workspaceId: string,
  id: string,
): Promise<Tables<"projects"> | null> {
  const { data, error } = await client
    .from("projects")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function insertProjectRow(
  client: TypedSupabaseClient,
  values: TablesInsert<"projects">,
): Promise<Tables<"projects">> {
  const { data, error } = await client.from("projects").insert(values).select("*").single();
  if (error) throw error;
  return data;
}

export async function updateProjectRow(
  client: TypedSupabaseClient,
  workspaceId: string,
  id: string,
  patch: TablesUpdate<"projects">,
): Promise<Tables<"projects">> {
  const { data, error } = await client
    .from("projects")
    .update(patch)
    .eq("workspace_id", workspaceId)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProjectRow(
  client: TypedSupabaseClient,
  workspaceId: string,
  id: string,
): Promise<void> {
  const { error } = await client
    .from("projects")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("id", id);

  if (error) throw error;
}
