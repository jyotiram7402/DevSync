import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Supabase shared types.
 *
 * A single typed-client alias used across the browser, server, and middleware
 * factories so every client is bound to our generated `Database` schema. As
 * tables are added and `types/database.ts` is regenerated, this alias
 * automatically carries the full, typed schema everywhere.
 */
export type TypedSupabaseClient = SupabaseClient<Database>;
