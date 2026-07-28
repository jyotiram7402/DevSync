# `supabase/` — Database as Code

Home for all version-controlled Supabase artifacts: migrations, RLS policies, triggers, views, and storage configuration.

## Structure

```
supabase/
└── migrations/
    ├── 20260723120001_init_extensions_and_functions.sql   # generic set_updated_at()
    ├── 20260723120002_core_schema.sql                     # tables, constraints, indexes
    ├── 20260723120003_functions_and_triggers.sql          # membership helpers, provisioning, audit
    ├── 20260723120004_rls_policies.sql                    # RLS enable + policies + grants
    ├── 20260723120005_views.sql                           # read-only views (security_invoker)
    └── 20260723120006_storage.sql                         # storage buckets + object policies
```

Migrations are **forward-only** and ordered by their timestamp prefix.

## Data model (workspace-centric)

Every content row belongs to a **workspace**; access is governed by
**`workspace_members`** and a role (`owner` > `admin` > `member` > `viewer`).
Each user is auto-provisioned a **personal workspace** on signup, so solo and
team usage share one schema — no future redesign.

```
auth.users 1─1 profiles
profiles 1─N workspaces (owner)         workspaces 1─N workspace_members N─1 profiles
workspaces 1─N projects, collections, snippets, sync_events, prompt_history, api_keys, audit_logs
projects 1─N snippets                   snippets N─M collections (snippet_collections)
profiles 1─N devices                    snippets N─1 devices (source)
```

## Key decisions

- **UUID PKs**, soft deletes (`deleted_at`), UTC timestamps with a trigger-maintained `updated_at`.
- **RLS on every table**, default-deny. Membership/role checks are `SECURITY DEFINER` helpers (`is_workspace_member`, `has_workspace_role`, `shares_workspace_with`) to prevent cross-workspace access and avoid RLS recursion.
- **Provisioning triggers**: `handle_new_user` (profile + personal workspace + Inbox) and `handle_new_workspace` (owner membership).
- **Append-only `audit_logs`**, written only by `SECURITY DEFINER` triggers; readable by workspace admins and by each actor for their own events.
- **`api_keys`** stores only a hash, hidden from client roles via column-level grants; keys are minted server-side (service role).
- **Public sharing** via `snippets.visibility = 'public'` (readable by `anon`).
- **Realtime publication is intentionally deferred** to the realtime sprint; RLS is now in place to make enabling it safe.

## Applying migrations

Per the project's environment constraints, migrations are authored here and
applied by the operator through Supabase tooling (SQL editor or CLI) — this
repository never executes CLIs during the build.

## Type generation

`types/database.ts` is a placeholder until regenerated from this schema with the
Supabase type generator. Regenerate it **before** building typed data-access
services (next sprint); do not hand-edit the generated output.

See `docs/architecture/06-Database-Strategy.md` and `docs/architecture/10-Security-Architecture.md`.
