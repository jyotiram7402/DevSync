# DevSync — Product Blueprint

> **Tagline:** Copy Once. Debug Anywhere.

This directory is the official product blueprint for **DevSync**. It is the single source of truth that a senior engineering team can use to build the product without needing further clarification.

These documents are **product and architecture planning only**. They deliberately contain **no application code, no database schemas, no API contracts, and no configuration files**. Implementation begins only after this blueprint is approved.

---

## Document Index

| # | Document | Purpose |
|---|----------|---------|
| 01 | [Product Requirements Document (PRD)](01-PRD.md) | The definitive "what and why" of DevSync. |
| 02 | [Product Roadmap](02-Product-Roadmap.md) | Feature sequencing from MVP to long-term vision. |
| 03 | [User Journey](03-User-Journey.md) | End-to-end flows for every key user path. |
| 04 | [Screen Inventory](04-Screen-Inventory.md) | Every screen, its purpose, components, and behavior. |
| 05 | [Information Architecture](05-Information-Architecture.md) | The logical structure of the application. |
| 06 | [Data Flow](06-Data-Flow.md) | How information travels through the system. |
| 07 | [MVP Definition](07-MVP-Definition.md) | Must / Should / Nice-to-have / Out-of-scope. |
| 08 | [Product Naming Review](08-Product-Naming-Review.md) | Evaluation of the name "DevSync". |
| 09 | [Competitor Analysis](09-Competitor-Analysis.md) | Market landscape and differentiation. |
| 10 | [Future Monetization](10-Future-Monetization.md) | Business models and pricing strategy. |
| 11 | [Development Roadmap](11-Development-Roadmap.md) | Engineering sprints with deliverables. |
| 12 | [Risks](12-Risks.md) | Technical, security, scaling, business, operational. |
| 13 | [Future Vision](13-Future-Vision.md) | DevSync three years out. |

---

## How to Read This Blueprint

1. **Start with the PRD (01).** It frames the entire product.
2. **Read the MVP Definition (07)** to understand what ships first.
3. **Use the Development Roadmap (11)** to plan sprints.
4. Everything else provides the supporting detail that removes ambiguity.

---

## Guiding Principles

The following principles were used to make every decision in this blueprint. When a future decision is ambiguous, defer to these:

1. **Free-tier first.** The MVP must run entirely on free tiers (Vercel, Supabase, GitHub). Every architectural choice is validated against this constraint.
2. **Scale without rewrite.** The architecture must support thousands of users and a future paid tier without a fundamental redesign.
3. **Friction removal is the product.** DevSync's core promise is eliminating the manual copy-paste-transfer loop. Any feature that does not serve this (or the broader "developer workspace" vision) is deprioritized.
4. **Security by default.** Developers paste secrets, tokens, and proprietary code. Trust is the product's foundation.
5. **Boringly reliable sync.** Realtime sync must feel instantaneous and never silently lose data.

---

## Technology Direction (Confirmed)

| Layer | Technology | Rationale (summary) |
|-------|-----------|---------------------|
| Frontend | Next.js, React, TypeScript | Industry standard, first-class Vercel support, SSR + edge. |
| Styling | Tailwind CSS, shadcn/ui | Fast, consistent, accessible component system. |
| Backend / DB | Supabase (PostgreSQL) | Managed Postgres, auth, realtime, storage in one free tier. |
| Realtime | Supabase Realtime | Postgres change streams over WebSockets — no extra infra. |
| Auth | GitHub OAuth, Google OAuth | Developer-native identity; no password management burden. |
| Hosting | Vercel | Zero-config Next.js deploys, generous free tier, GitHub CI. |
| Repository | GitHub | Source control + CI trigger for Vercel. |

> **Environment note:** This project is developed on a restricted corporate machine. All builds happen on Vercel (GitHub → Vercel pipeline). Every file must be production-ready on first build because Vercel is the first environment where the code is ever compiled.

---

*Document owner: Product & Architecture. Status: Draft v1.0. Last updated: 2026-07-22.*
