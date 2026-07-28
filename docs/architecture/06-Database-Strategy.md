# 06 — Database Strategy

**Version:** 1.0 · **Last updated:** 2026-07-22

This document designs the data model **conceptually**: tables, relationships, indexes, constraints, and the cross-cutting conventions (UUIDs, soft delete, timestamps, audit). **No SQL is written here** (per the task) — this is the specification a senior engineer implements as migrations in `supabase/`.

Database: **PostgreSQL on Supabase**, with **Row-Level Security** as the authorization backbone ([10](10-Security-Architecture.md)) and **native full-text search** for history search.

---

## 1. Modeling Principles

1. **Normalize the core, denormalize only with evidence.** Start normalized (clean relationships, no duplication); introduce denormalized/materialized reads only when a measured performance need appears ([15](15-Scalability-Plan.md)).
2. **Ownership is explicit on every row.** Every user-data row carries the owning account id — this is what RLS policies key on. Isolation is a column-level fact, not an application assumption.
3. **Everything is soft-deletable where recovery/propagation matters.** Deletes must propagate across devices predictably; soft delete gives us controlled, reversible, sync-friendly deletion.
4. **Consistent conventions everywhere.** UUID keys, standard timestamps, and audit columns are uniform across tables so tooling, RLS, and reasoning stay simple.
5. **Model for today's MVP, reserve for tomorrow.** Define MVP tables fully; note where future tables (collections, share links, teams) attach, without building them yet.

---

## 2. Core Entities & Tables (conceptual)

### 2.1 `profiles` (account)
- **Represents:** a DevSync account, 1:1 with a Supabase Auth user.
- **Key fields (conceptual):** account id (matches auth user id), display name, avatar URL, primary email, connected providers, preferences (theme, default project, default snippet type), timestamps.
- **Why a separate profile table** (rather than only the auth user): the auth schema is provider-owned; a `profiles` table is the app-owned home for product profile data and preferences, and the anchor other tables reference.

### 2.2 `devices`
- **Represents:** a machine/browser registered to an account (first-class per PRD multi-device).
- **Key fields:** device id, owner account id, friendly name, platform/user-agent summary, last-active timestamp, revoked flag/timestamp, created timestamp.
- **Relationships:** many devices → one account.
- **Why:** powers the device list, revoke, last-active, and "source device" on snippets.

### 2.3 `projects`
- **Represents:** the primary organizational container; every snippet lives in exactly one.
- **Key fields:** project id, owner account id, name, is-default (the Inbox) flag, timestamps, soft-delete columns.
- **Relationships:** many projects → one account; one project → many snippets.
- **Rules:** each account has exactly one default **Inbox** (cannot be deleted); deleting a project prompts snippet disposition (default: move to Inbox) — enforced in the service/action layer, backed by DB constraints where possible.

### 2.4 `snippets` (the center of gravity)
- **Represents:** a piece of developer text (error, trace, log, code, command, note).
- **Key fields:** snippet id, owner account id, project id, title (optional), content (text), type (enum: `error` | `stacktrace` | `log` | `code` | `command` | `text`), source device id, language hint (optional, for highlighting), pinned flag `[v1.1]`, timestamps, soft-delete columns, and a search vector (generated from title + content).
- **Relationships:** many snippets → one account, one project, one source device.
- **Why content as text (not files):** MVP is text-only; large-payload/file support (Supabase Storage) is future. A size limit is enforced (validation + DB check) to protect performance and free-tier limits.

### 2.5 Reserved / future tables (attach points, not built now)
- **`share_links` `[v1.1]`:** id, snippet id, owner account id, token (unguessable), expiry, revoked flag, created — powers read-only external sharing.
- **`collections` + `collection_snippets` `[v2]`:** many-to-many grouping across projects.
- **`teams`, `team_members`, `shared_collections` `[v3]`:** collaboration; introduces a workspace ownership axis alongside account ownership.
- **`audit_events` (see §9):** append-only significant-action log.

---

## 3. Relationships (ER overview)

```
                         ┌──────────────┐
                         │   profiles   │ (1:1 with auth user)
                         └──────┬───────┘
              ┌─────────────────┼───────────────────┐
              │ 1:N             │ 1:N               │ 1:N
              ▼                 ▼                   ▼
        ┌──────────┐      ┌──────────┐        ┌──────────┐
        │ devices  │      │ projects │        │ snippets │
        └────┬─────┘      └────┬─────┘        └────┬─────┘
             │ (source device)  │ 1:N              │
             └──────────────────┼──────────────────┘
                                ▼
                        each snippet → 1 project, 1 account, 1 source device

Future:
  snippets ─1:N─ share_links [v1.1]
  snippets ─M:N─ collections (via collection_snippets) [v2]
  profiles ─M:N─ teams (via team_members) → shared_collections [v3]
```

**Referential integrity:** foreign keys enforce that a snippet's project/account/device exist. Deletion behavior is governed by soft delete + disposition rules (see §5), not hard cascade, to avoid accidental data loss.

---

## 4. UUID Strategy

- **All primary keys are UUIDs** (database-generated, using a modern UUID scheme — a time-ordered variant such as UUIDv7-style is preferred where available for better index locality; otherwise standard random UUIDv4).
- **Why UUIDs, not auto-increment integers:**
  1. **No enumeration/leakage:** sequential integer ids leak volume and allow guessing; UUIDs don't (important for a privacy-sensitive product and for share/route ids).
  2. **Client-generatable if needed:** enables optimistic creation with a stable id before the server round-trip (helps offline creation + dedupe, [07](07-Realtime-Architecture.md)).
  3. **Merge/scale friendly:** no cross-shard/sequence coordination if the system ever grows.
- **Trade-off (index size/locality):** mitigated by choosing a time-ordered UUID variant so inserts remain index-friendly.

---

## 5. Soft Delete Strategy

- **Approach:** user-facing entities (`projects`, `snippets`, and future shareables) carry a **`deleted_at` timestamp** (null = live). "Deleting" sets `deleted_at`; queries filter it out by default.
- **Why soft delete:**
  1. **Sync correctness:** a delete becomes an *update* event that propagates cleanly to all devices (they hide the row) — consistent with the realtime model, and reversible if needed.
  2. **Accident recovery:** protects against accidental bulk loss (project deletion), supporting the PRD "never silent data loss" stance.
  3. **Audit/analytics:** deleted rows remain analyzable until purged.
- **Hard-delete path:** a **purge** process (scheduled/administrative) permanently removes rows soft-deleted beyond a retention window, and account deletion performs a full hard delete of the user's data (privacy requirement). Purge respects free-tier storage limits.
- **RLS + soft delete:** policies still scope by owner; application queries add the `deleted_at IS NULL` filter. Deletion is honored end-to-end (device caches remove the row on the propagated event).

---

## 6. Timestamp Strategy

Every table carries standard timestamps:
- **`created_at`** — set on insert (DB default, UTC).
- **`updated_at`** — updated on every modification (via trigger, so it can't be forgotten by application code).
- **`deleted_at`** — nullable soft-delete marker (§5).
- Domain-specific timestamps where meaningful (e.g., devices' `last_active_at`, share links' `expires_at`).

**Conventions:**
- **All timestamps are UTC** (`timestamptz`); presentation-layer converts to local/relative time (`RelativeTime` component).
- `updated_at` is maintained by a **database trigger**, not application code — guarantees correctness regardless of which layer writes, and makes it reliable for conflict reasoning (last-write-wins uses these timestamps, [07](07-Realtime-Architecture.md)).

---

## 7. Constraints & Data Integrity

- **Primary keys:** UUID on every table.
- **Foreign keys:** enforce ownership/relationship validity (snippet→project, snippet→account, snippet→device, etc.).
- **Not-null:** on ownership columns (account id), content-critical fields, and timestamps.
- **Enums/checks:** snippet `type` constrained to the allowed set; content length bounded by a **check constraint** (defense-in-depth alongside Zod validation, [08](08-API-Strategy.md)).
- **Uniqueness:** one default Inbox per account (partial unique constraint); unguessable-token uniqueness on share links.
- **Defaults:** timestamps, `deleted_at` null, sensible flag defaults.
- **Why enforce at the DB, not only in app code:** the database is the last line of defense; constraints guarantee integrity even if a bug bypasses application validation. This mirrors the "security/integrity at the data layer" principle.

---

## 8. Index Strategy

Indexes are designed around the **actual query patterns** (list, filter, search, sync):

| Index | On | Serves |
|-------|----|--------|
| Owner + recency | `snippets(account_id, created_at desc)` (filtered `deleted_at IS NULL`) | The default reverse-chronological stream, per user. |
| Owner + project + recency | `snippets(account_id, project_id, created_at desc)` | Project-scoped views. |
| Full-text search | GIN index on the snippet **search vector** (title+content) | History full-text search ([11](11-Performance-Strategy.md)). |
| Type filter | `snippets(account_id, type)` (composite w/ recency as needed) | Filter-by-type. |
| Devices by owner | `devices(account_id)` | Device list. |
| Projects by owner | `projects(account_id)` (filtered live) | Project switcher/list. |
| Share token lookup `[v1.1]` | unique index on `share_links(token)` | O(1) public link resolution. |

**Principles:**
1. **Index to match RLS + query shape:** since every query is owner-scoped, composite indexes lead with `account_id`.
2. **Partial indexes** exclude soft-deleted rows to keep hot indexes small.
3. **Add on evidence:** beyond the known-hot indexes above, additional indexes are added based on observed slow queries, not speculation (avoids write-amplification and free-tier bloat).
4. **GIN for search:** Postgres full-text with a maintained `tsvector` + GIN index gives us search without a separate service.

---

## 9. Audit Strategy

Two complementary mechanisms:

1. **Row-level audit columns** (`created_at`, `updated_at`, `deleted_at`, and source/actor where relevant) on every table — the lightweight, always-on audit trail sufficient for MVP reasoning (who/when for the row's lifecycle).
2. **`audit_events` append-only log** (introduced with sharing/teams, `[v1.1+]`): records **significant, security-relevant actions** — device revocation, share-link creation/revocation, account deletion, and (v3) team membership/role changes. Fields: event id, account id, actor, event type, target reference, metadata, timestamp. Append-only (no updates/deletes) so it is trustworthy.

**Why two tiers:** row columns are cheap and universal; a dedicated append-only event log is where security/compliance value lives and is a prerequisite for enterprise audit ([16](16-Risks.md), Future Vision). Building the heavy log only when sharing/teams arrive keeps the MVP lean.

---

## 10. RLS Alignment (summary; full detail in [10](10-Security-Architecture.md))

- Every user-data table has RLS **enabled** with policies that restrict rows to `account_id = auth.uid()` (the authenticated user).
- Realtime respects RLS, so change streams only deliver a user's own rows ([07](07-Realtime-Architecture.md)).
- Future team tables introduce workspace-scoped policies (membership-based access) layered on the same model.
- **The data model is designed so that RLS policies are simple and auditable** — a single owning-account column per row is the linchpin.

---

## 11. Free-Tier & Growth Considerations

- **Text-only + size limits** bound row/storage growth.
- **Retention on free tier** (recent history) + **purge of soft-deleted rows** keep storage within limits ([15](15-Scalability-Plan.md), [16](16-Risks.md) SC1).
- **Read scaling path:** read replicas / higher Supabase tiers as the user base grows — no schema redesign, just capacity.
- **Partitioning (future):** if `snippets` grows very large, time- or account-based partitioning is a contained, forward-compatible optimization enabled by the UUID + timestamp conventions.

---

*End of Database Strategy.*
