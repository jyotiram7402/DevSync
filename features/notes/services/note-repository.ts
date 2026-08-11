import type { NoteListParams } from "@/features/notes/types";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

/**
 * NoteRepository — the only layer that issues note queries. Returns raw rows
 * and throws on DB errors; the service converts throws to ActionResult. Every
 * query is user-scoped (RLS is the real boundary).
 */
const SELECT =
  "id,user_id,title,content,status,priority,due_date,due_time,tags,pinned,archived,completed_at,created_at,updated_at" as const;

export async function resolveUserId(client: TypedSupabaseClient): Promise<string | null> {
  const {
    data: { user },
  } = await client.auth.getUser();
  return user?.id ?? null;
}

export async function listNoteRows(
  client: TypedSupabaseClient,
  userId: string,
  params: NoteListParams,
): Promise<Tables<"notes">[]> {
  let query = client.from("notes").select(SELECT).eq("user_id", userId);

  const status = params.status ?? "active";
  if (status === "archived") {
    query = query.eq("archived", true);
  } else {
    query = query.eq("archived", false);
    if (status === "completed") query = query.eq("status", "completed");
    else if (status === "active") query = query.eq("status", "pending");
  }

  if (params.priority) query = query.eq("priority", params.priority);
  if (params.tag) query = query.contains("tags", [params.tag]);

  const today = new Date().toISOString().slice(0, 10);
  if (params.due === "today") query = query.eq("due_date", today);
  else if (params.due === "overdue") query = query.lt("due_date", today).eq("status", "pending");
  else if (params.due === "upcoming") query = query.gt("due_date", today);

  // Pinned always float to the top, then the chosen sort.
  query = query.order("pinned", { ascending: false });
  switch (params.sort) {
    case "created":
      query = query.order("created_at", { ascending: false });
      break;
    case "updated":
      query = query.order("updated_at", { ascending: false });
      break;
    case "priority":
      // high → low via text ordering fallback then recency.
      query = query.order("priority", { ascending: true }).order("updated_at", { ascending: false });
      break;
    case "due":
    default:
      query = query.order("due_date", { ascending: true, nullsFirst: false });
      query = query.order("updated_at", { ascending: false });
      break;
  }

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Lean fetch used by the dashboard widget: active notes with a due date. */
export async function listActiveNoteRows(
  client: TypedSupabaseClient,
  userId: string,
  limit = 100,
): Promise<Tables<"notes">[]> {
  const { data, error } = await client
    .from("notes")
    .select(SELECT)
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("status", "pending")
    .order("pinned", { ascending: false })
    .order("due_date", { ascending: true, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function countCompleted(client: TypedSupabaseClient, userId: string): Promise<number> {
  const { count, error } = await client
    .from("notes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("status", "completed");
  if (error) throw error;
  return count ?? 0;
}

export async function findNoteRow(
  client: TypedSupabaseClient,
  userId: string,
  id: string,
): Promise<Tables<"notes"> | null> {
  const { data, error } = await client
    .from("notes")
    .select(SELECT)
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function insertNoteRow(
  client: TypedSupabaseClient,
  values: TablesInsert<"notes">,
): Promise<Tables<"notes">> {
  const { data, error } = await client.from("notes").insert(values).select(SELECT).single();
  if (error) throw error;
  return data;
}

export async function updateNoteRow(
  client: TypedSupabaseClient,
  userId: string,
  id: string,
  patch: TablesUpdate<"notes">,
): Promise<Tables<"notes">> {
  const { data, error } = await client
    .from("notes")
    .update(patch)
    .eq("user_id", userId)
    .eq("id", id)
    .select(SELECT)
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNoteRow(
  client: TypedSupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  const { error } = await client.from("notes").delete().eq("user_id", userId).eq("id", id);
  if (error) throw error;
}
