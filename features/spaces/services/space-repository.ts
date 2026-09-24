import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Database, Tables, TablesInsert } from "@/types/database";

/**
 * SpaceRepository — the only layer that issues space queries. Membership and
 * cross-user access are enforced by RLS + SECURITY DEFINER functions in the
 * database; this layer returns raw rows and throws on error.
 */

type MemberRow = Database["public"]["Functions"]["list_space_members"]["Returns"][number];

export async function resolveUser(
  client: TypedSupabaseClient,
): Promise<{ id: string; email: string | null } | null> {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? null };
}

/** Create a room (unique code + creator membership) via the DB function. */
export async function rpcCreateSpace(
  client: TypedSupabaseClient,
  name: string,
): Promise<Tables<"spaces">> {
  const { data, error } = await client.rpc("create_space", { p_name: name });
  if (error) throw error;
  if (!data) throw new Error("create_space returned no row");
  return data;
}

/** Join a room by its shared code via the DB function. */
export async function rpcJoinSpace(
  client: TypedSupabaseClient,
  code: string,
): Promise<Tables<"spaces">> {
  const { data, error } = await client.rpc("join_space_by_code", { p_code: code });
  if (error) throw error;
  if (!data) throw new Error("join_space_by_code returned no row");
  return data;
}

/** Roster with names/emails (members only — enforced in the DB function). */
export async function rpcListMembers(
  client: TypedSupabaseClient,
  spaceId: string,
): Promise<MemberRow[]> {
  const { data, error } = await client.rpc("list_space_members", { p_space_id: spaceId });
  if (error) throw error;
  return data ?? [];
}

/** Add an existing user by email. Returns 'added' or 'already_member'. */
export async function rpcAddMemberByEmail(
  client: TypedSupabaseClient,
  spaceId: string,
  email: string,
): Promise<string> {
  const { data, error } = await client.rpc("add_space_member_by_email", {
    p_space_id: spaceId,
    p_email: email,
  });
  if (error) throw error;
  return data ?? "added";
}

/** A single room the current user belongs to (RLS returns null otherwise). */
export async function getSpaceRow(
  client: TypedSupabaseClient,
  id: string,
): Promise<Tables<"spaces"> | null> {
  const { data, error } = await client.from("spaces").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

/** Rooms the current user belongs to (RLS scopes this to their memberships). */
export async function listMySpaceRows(client: TypedSupabaseClient): Promise<Tables<"spaces">[]> {
  const { data, error } = await client
    .from("spaces")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function listItemRows(
  client: TypedSupabaseClient,
  spaceId: string,
): Promise<Tables<"space_items">[]> {
  const { data, error } = await client
    .from("space_items")
    .select("*")
    .eq("space_id", spaceId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getItemRow(
  client: TypedSupabaseClient,
  id: string,
): Promise<Tables<"space_items"> | null> {
  const { data, error } = await client.from("space_items").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertItemRow(
  client: TypedSupabaseClient,
  values: TablesInsert<"space_items">,
): Promise<Tables<"space_items">> {
  const { data, error } = await client.from("space_items").insert(values).select("*").single();
  if (error) throw error;
  return data;
}

export async function deleteItemRow(client: TypedSupabaseClient, id: string): Promise<void> {
  const { error } = await client.from("space_items").delete().eq("id", id);
  if (error) throw error;
}

/** Remove one member (self = leave; owner may remove anyone — enforced by RLS). */
export async function deleteMemberRow(
  client: TypedSupabaseClient,
  spaceId: string,
  userId: string,
): Promise<void> {
  const { error } = await client
    .from("space_members")
    .delete()
    .eq("space_id", spaceId)
    .eq("user_id", userId);
  if (error) throw error;
}

/** Delete a whole room (owner only — enforced by RLS); cascades members/items. */
export async function deleteSpaceRow(client: TypedSupabaseClient, spaceId: string): Promise<void> {
  const { error } = await client.from("spaces").delete().eq("id", spaceId);
  if (error) throw error;
}
