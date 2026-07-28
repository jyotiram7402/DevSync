<div align="center">

# DevSync

### Copy Once. Debug Anywhere.

DevSync instantly syncs your errors, logs, and code snippets across all your devices — so you can copy on one machine and debug on another.

</div>

---

> **Status:** 🏗️ Foundation. The repository scaffold, toolchain, design system, and application shell are in place. Product features (auth, snippets, projects, realtime sync) arrive in subsequent sprints.

## Table of Contents

- [Overview](#overview)
- [Vision](#vision)
- [Technology Stack](#technology-stack)
- [Architecture Overview](#architecture-overview)
- [Folder Structure](#folder-structure)
- [Development Workflow](#development-workflow)
- [GitHub Workflow](#github-workflow)
- [Deployment Workflow](#deployment-workflow)
- [Contributing](#contributing)
- [Future Roadmap](#future-roadmap)
- [License](#license)

## Overview

Developers increasingly work across multiple machines and lean on AI assistants that often live on a different device than the one producing an error. Today the workflow is manual: hit an error on one machine, copy it, and ferry it to another (email-to-self, chat, notes) where the assistant or second IDE lives — repeated dozens of times a day.

DevSync removes that friction. Anything you copy on one authenticated device — an error, a stack trace, a log, a command, a snippet — is **instantly and privately available on all your others**, across any OS, with no install. It is a live wire between your machines, backed by a searchable history of everything you copy while building software.

## Vision

DevSync starts as clipboard sync for developers and grows into a **developer productivity workspace** — the connective tissue of a developer's multi-device life, where build-time knowledge (errors and their fixes, commands, prompts) is captured, organized, searchable, and safely shareable instead of thrown away. The long-term product, community, and monetization thinking lives in [`docs/`](docs/00-README.md).

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 15](https://nextjs.org) (App Router) + [React 19](https://react.dev) |
| Language | [TypeScript](https://www.typescriptlang.org) (strict, `exactOptionalPropertyTypes`) |
| Styling | [Tailwind CSS](https://tailwindcss.com) + [shadcn/ui](https://ui.shadcn.com) |
| Backend | [Supabase](https://supabase.com) — PostgreSQL, Auth, Realtime, Storage *(introduced in later sprints)* |
| Client state | [Zustand](https://zustand-demo.pmnd.rs) |
| Forms & validation | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Icons / Toasts | [Lucide](https://lucide.dev) / [Sonner](https://sonner.emilkowal.ski) |
| Editor / Highlight | [Monaco Editor](https://microsoft.github.io/monaco-editor/) + [Shiki](https://shiki.style) *(added with the Snippets sprint)* |
| Tooling | ESLint 9 (flat config), Prettier, TypeScript |
| Hosting / CI | [Vercel](https://vercel.com) (GitHub-integrated) |

## Architecture Overview

DevSync is a **web-first SaaS** built on a **thin, server-rendered Next.js frontend** talking to a **single managed backend (Supabase)** that provides database, auth, realtime, and storage — there is no separate custom backend service.

```
Client (React Server + Client Components)
        │ HTTPS (RSC / Server Actions)      │ WSS (realtime)
        ▼                                   ▼
Vercel (hosts Next.js: RSC, Server Actions, Route Handlers)
        │ Supabase JS client (server + browser)
        ▼
Supabase — PostgreSQL (+ Row-Level Security), Auth (OAuth), Realtime, Storage
```

Guiding principles: **server-first rendering**, **Postgres as the single source of truth**, **security enforced at the data layer (RLS)**, **persist-then-broadcast** sync, and **feature-based modularity**. The complete technical architecture is documented in [`docs/architecture/`](docs/architecture/00-README.md).

## Folder Structure

```
devsync/
├── app/            # Next.js App Router: routes, layouts, error/loading/not-found
├── components/     # Shared UI — ui/ (shadcn primitives), theme toggle
├── features/       # Feature modules (added per sprint)
├── hooks/          # Cross-feature React hooks
├── lib/            # Library setup, env loader, constants, feature flags
├── providers/      # App-level context providers (theme, toaster)
├── services/       # Data-access layer (only layer that talks to Supabase)
├── stores/         # Zustand global stores
├── styles/         # Global CSS + design tokens
├── supabase/       # Database as code (migrations, policies) — reserved
├── types/          # Shared, API, and database types
├── utils/          # Pure helpers (cn, date, clipboard, formatters, storage, validation)
├── public/         # Static assets
└── docs/           # Product + architecture documentation
```

Full structure and ownership rules: [`docs/architecture/02-Folder-Structure.md`](docs/architecture/02-Folder-Structure.md).

## Development Workflow

> This repository builds on Vercel via the GitHub integration. The commands below are for reference in environments where a local toolchain is available.

1. **Configure environment.** Copy `.env.example` to `.env.local`. Every variable is optional in the foundation; the app runs with none set.
2. **Install & run:**

   ```bash
   npm install
   npm run dev
   ```

3. Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint 9 (flat config) |
| `npm run lint:fix` | Lint and auto-fix |
| `npm run type-check` | Type-check without emitting |
| `npm run format` | Format with Prettier |
| `npm run format:check` | Verify formatting |

> **Note:** Linting is a CI/local quality gate, not a Vercel build gate (`eslint.ignoreDuringBuilds` is on). TypeScript errors, however, **do** fail the build — types are the correctness gate.

## GitHub Workflow

- **Trunk-based development.** `main` is always deployable. Work happens on short-lived branches: `feat/*`, `fix/*`, `chore/*`, `docs/*`, `refactor/*`.
- **Conventional Commits** (`feat(scope): summary`) drive changelogs and versioning.
- **Pull Requests** are required to reach `main` (no direct pushes). Each PR must pass CI (type-check, lint, format), produce a **successful Vercel preview build**, and receive review (two reviewers for auth/RLS/realtime/sharing changes).

Details: [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`docs/architecture/13-Git-Strategy.md`](docs/architecture/13-Git-Strategy.md).

## Deployment Workflow

```
push / merge → GitHub → Vercel
                         ├─ install dependencies
                         ├─ build Next.js (type-check + compile)
                         ├─ PR   → Preview deployment (isolated URL)
                         └─ main → Production deployment (global edge/CDN)
```

Environment variables are set in the Vercel project (never committed). Rollback = promote the previous immutable deployment. Full guide: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for coding standards, branching, commit conventions, and PR rules. In short: strict TypeScript (no `any`), Server Components by default, feature-first structure, and data access only through `services/`.

## Future Roadmap

| Phase | Focus |
|-------|-------|
| **MVP** | OAuth (GitHub/Google), devices, snippets CRUD, projects, near-real-time sync, history + search |
| **v1.1** | Share links (expiring, revocable), arrival notifications, pinning |
| **v2** | Collections, browser extension, personal analytics, advanced search |
| **v3** | Team workspaces, roles/permissions, public API + webhooks, native/desktop helper |
| **Long term** | AI enrichment, integration marketplace, enterprise SSO/audit |

Full roadmap: [`docs/02-Product-Roadmap.md`](docs/02-Product-Roadmap.md) and [`docs/11-Development-Roadmap.md`](docs/11-Development-Roadmap.md).

## License

[MIT](LICENSE) © 2026 DevSync
