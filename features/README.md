# `features/` — Feature Modules

The heart of the codebase. Each product capability is a **self-contained module** that owns everything used only by it. Features are added per sprint; the folder is empty by design in the foundation.

## Module shape

Each feature follows the same internal structure:

```
features/<feature>/
├── components/   # UI used only by this feature
├── hooks/        # Hooks used only by this feature
├── actions/      # Server Actions (mutations) for this feature
├── stores/       # Zustand store(s) local to this feature (if any)
├── schemas/      # Zod schemas for this feature's inputs
├── types.ts      # Types owned by this feature
└── index.ts      # Public surface — the ONLY thing other code may import
```

## Rules

1. A feature owns everything used only by it.
2. Features communicate **only** through their public `index.ts` — never deep-import another feature's internals.
3. Shared code is promoted to a global layer (`components/`, `hooks/`, `services/`, `types/`, `utils/`) only on real, second-use reuse.
4. Data access goes through `services/`, never the Supabase client inline.

## Planned modules (per the roadmap)

`auth` → `snippets` → `projects` → `search` → `devices` → `settings` → `sharing` (v1.1) → `collections` (v2) → `teams` (v3).

See `docs/architecture/02-Folder-Structure.md`.
