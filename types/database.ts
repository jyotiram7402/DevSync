/**
 * Supabase database types.
 *
 * IMPORTANT: This file mirrors the SQL migrations in `supabase/migrations`. It
 * is authored by hand ONLY because the Supabase type generator cannot run in
 * this environment; it should be replaced by the generator's output when
 * tooling is available (`supabase gen types typescript`). It currently covers
 * the tables consumed by typed queries so far; add tables here as features
 * begin querying them. Storage, Realtime, and Auth APIs are schema-independent
 * and do not require entries here.
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      workspaces: {
        Row: {
          id: string;
          name: string;
          slug: string;
          owner_id: string;
          is_personal: boolean;
          plan: string;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          owner_id: string;
          is_personal?: boolean;
          plan?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          owner_id?: string;
          is_personal?: boolean;
          plan?: string;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      workspace_members: {
        Row: {
          id: string;
          workspace_id: string;
          user_id: string;
          role: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          user_id: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          user_id?: string;
          role?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          icon: string | null;
          color: string | null;
          is_default: boolean;
          is_favorite: boolean;
          is_pinned: boolean;
          is_archived: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          is_favorite?: boolean;
          is_pinned?: boolean;
          is_archived?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          icon?: string | null;
          color?: string | null;
          is_default?: boolean;
          is_favorite?: boolean;
          is_pinned?: boolean;
          is_archived?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      devices: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          os: string | null;
          browser: string | null;
          client_type: string;
          client_version: string | null;
          last_seen_at: string | null;
          revoked_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          os?: string | null;
          browser?: string | null;
          client_type?: string;
          client_version?: string | null;
          last_seen_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          os?: string | null;
          browser?: string | null;
          client_type?: string;
          client_version?: string | null;
          last_seen_at?: string | null;
          revoked_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          workspace_id: string;
          name: string;
          description: string | null;
          color: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          name: string;
          description?: string | null;
          color?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          name?: string;
          description?: string | null;
          color?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      snippets: {
        // NOTE: the generated `search_vector` column is intentionally omitted;
        // it is never selected by the app.
        Row: {
          id: string;
          workspace_id: string;
          project_id: string | null;
          title: string | null;
          content: string;
          language: string | null;
          type: string;
          tags: string[];
          pinned: boolean;
          favorite: boolean;
          archived: boolean;
          visibility: string;
          source_device_id: string | null;
          created_by: string | null;
          updated_by: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          workspace_id: string;
          project_id?: string | null;
          title?: string | null;
          content: string;
          language?: string | null;
          type?: string;
          tags?: string[];
          pinned?: boolean;
          favorite?: boolean;
          archived?: boolean;
          visibility?: string;
          source_device_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          workspace_id?: string;
          project_id?: string | null;
          title?: string | null;
          content?: string;
          language?: string | null;
          type?: string;
          tags?: string[];
          pinned?: boolean;
          favorite?: boolean;
          archived?: boolean;
          visibility?: string;
          source_device_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      snippet_collections: {
        Row: {
          snippet_id: string;
          collection_id: string;
          workspace_id: string;
          added_at: string;
        };
        Insert: {
          snippet_id: string;
          collection_id: string;
          workspace_id: string;
          added_at?: string;
        };
        Update: {
          snippet_id?: string;
          collection_id?: string;
          workspace_id?: string;
          added_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/** Convenience accessors mirroring the Supabase generator's helpers. */
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
