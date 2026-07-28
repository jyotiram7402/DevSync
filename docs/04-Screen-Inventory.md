# DevSync — Screen Inventory

**Version:** 1.0
**Last updated:** 2026-07-22

This document lists every application screen. Screens are grouped by phase. For each screen: **Purpose**, **Components**, **User Actions**, **Navigation**, and **Expected Behaviour**.

Screens marked **[MVP]** ship first. **[v1.1]**, **[v2]**, **[v3]** indicate later phases but are inventoried now so navigation and information architecture are designed with them in mind.

---

## A. Public / Unauthenticated Screens

### A1. Landing Page `[MVP]`
- **Purpose:** Communicate the value ("Copy Once. Debug Anywhere.") and convert visitors to sign-in.
- **Components:** Hero with tagline + one-line explainer; short "how it works" (3 steps); trust/security note; primary CTA (*Sign in with GitHub / Google*); footer (privacy, terms, contact).
- **User Actions:** Read; click a sign-in provider; open legal pages.
- **Navigation:** → OAuth flow → Dashboard (on success). Footer → legal pages.
- **Expected Behaviour:** Fast, static, marketing-grade. Single clear CTA. No feature bloat. Mobile-friendly.

### A2. OAuth Redirect / Callback Handler `[MVP]`
- **Purpose:** Complete the OAuth handshake and route the user in.
- **Components:** Minimal loading state ("Signing you in…").
- **User Actions:** None (automatic).
- **Navigation:** → Dashboard on success; → Landing with error message on failure/cancel.
- **Expected Behaviour:** Transient. Handles success, cancellation, and error distinctly. Never leaves the user stuck.

### A3. Shared Snippet (Public View) `[v1.1]`
- **Purpose:** Render a read-only snippet accessed via a share link, no account required.
- **Components:** Snippet title + content (read-only, syntax-styled), source-agnostic; a subtle DevSync brand + CTA ("Sync your own — try DevSync"); expiry indicator.
- **User Actions:** Read; copy content; follow CTA to sign up.
- **Navigation:** External link → this screen. CTA → Landing.
- **Expected Behaviour:** Shows content only if the link is valid and unexpired; otherwise a clean "no longer available" state with no content leak. Never exposes other snippets or account data.

### A4. Legal Pages (Privacy, Terms) `[MVP]`
- **Purpose:** Establish trust and meet basic legal obligations.
- **Components:** Static content.
- **User Actions:** Read.
- **Navigation:** From footer.
- **Expected Behaviour:** Accessible without auth; clear data-handling language (reinforces the trust posture).

---

## B. Core Authenticated Screens

### B1. Dashboard / Snippet Stream `[MVP]` — *the primary screen*
- **Purpose:** The home base: view, create, copy, and manage snippets for the active project, with live sync.
- **Components:**
  - Global top bar: project switcher, search entry, sync-status indicator, user menu.
  - *New snippet* action (button + keyboard shortcut).
  - Snippet list/stream: each item shows title (or content preview), type badge, source device, relative time, and a prominent *Copy* action; secondary actions (edit, delete, move, share[v1.1]) in a menu.
  - Empty state (guidance for first-time users).
  - Sync-status indicator (connected / reconnecting / offline).
- **User Actions:** Create; copy; open; edit; delete; move to project; switch project; search; observe incoming snippets.
- **Navigation:** Hub of the app → Snippet Detail, Search, Settings, Project views.
- **Expected Behaviour:** New/updated/deleted snippets reflect live without refresh; newly arrived snippets highlight briefly. *Copy* is one click. Always shows current sync state. Virtualized/paginated for large lists.

### B2. Snippet Detail / Editor `[MVP]`
- **Purpose:** View full content and edit metadata.
- **Components:** Full content view (scrollable, styled by type); metadata (title, type, project, source device, created/updated); actions: *Copy*, *Edit*, *Delete*, *Move*, *Share[v1.1]*, *Pin[v1.1]*.
- **User Actions:** Copy; edit title/type/project; delete; navigate back.
- **Navigation:** From Dashboard/Search → here → back.
- **Expected Behaviour:** Edits persist and sync live to other devices. Delete confirms, then propagates everywhere. Content is read-optimized (no accidental edits to content body in MVP unless explicitly editing).

### B3. Create Snippet (Modal or Panel) `[MVP]`
- **Purpose:** Capture new text with minimal friction.
- **Components:** Content field (large, auto-focused); optional title; optional type selector (with suggested type post-MVP); optional project selector (defaults to active); *Save* / *Cancel*.
- **User Actions:** Paste/type; set optional metadata; save.
- **Navigation:** Invoked from anywhere via button/shortcut → returns to context on save.
- **Expected Behaviour:** Only content is required. Save is instant and syncs immediately. Enforces size limit with a clear message. Offline → queues and indicates pending sync.

### B4. Search Results `[MVP]`
- **Purpose:** Find any past snippet quickly.
- **Components:** Search input (with live results); filters (project, type, date range); result list (highlighted matches); empty/no-results state.
- **User Actions:** Type query; apply/clear filters; open a result; copy directly from a result.
- **Navigation:** From global search entry → here → Snippet Detail.
- **Expected Behaviour:** Results update as the user types; filters combine logically; responsive even with large history (server-side full-text search + pagination).

### B5. Project View `[MVP]`
- **Purpose:** See and manage snippets scoped to a single project.
- **Components:** Project header (name, snippet count, settings menu); scoped snippet stream (same item design as Dashboard); project actions (rename, delete).
- **User Actions:** View scoped snippets; rename/delete project; create snippet into this project.
- **Navigation:** From project switcher → here.
- **Expected Behaviour:** Behaves like the Dashboard but filtered to one project. Deleting a project prompts for snippet disposition (move to inbox vs. delete; default move).

---

## C. Account, Settings & Device Screens

### C1. Settings — Overview `[MVP]`
- **Purpose:** Entry point to account/device/preferences.
- **Components:** Sectioned navigation (Profile, Devices, Preferences, Data & Privacy, Billing[future]).
- **User Actions:** Navigate to sub-sections.
- **Navigation:** From user menu.
- **Expected Behaviour:** Clear, sectioned, safe. Destructive actions clearly separated.

### C2. Settings — Devices `[MVP]`
- **Purpose:** Review and control connected devices.
- **Components:** Device list (name, platform, last active, "this device" marker); rename control; revoke action.
- **User Actions:** Rename device; revoke device.
- **Navigation:** From Settings.
- **Expected Behaviour:** Revoking a device instantly invalidates its access and closes its realtime channel; the list updates live across the user's devices. Revoking the current device confirms then signs out.

### C3. Settings — Profile `[MVP]`
- **Purpose:** View identity (from OAuth) and manage basic profile.
- **Components:** Avatar/name/email (from provider), connected providers list.
- **User Actions:** View; (future) link additional provider.
- **Navigation:** From Settings.
- **Expected Behaviour:** Read-mostly at MVP; provider linking is future. Clearly shows which providers are connected.

### C4. Settings — Preferences `[MVP]`
- **Purpose:** Personal preferences.
- **Components:** Theme (light/dark/system); default project; default snippet type; keyboard-shortcut reference.
- **User Actions:** Toggle preferences.
- **Navigation:** From Settings.
- **Expected Behaviour:** Preferences persist per account and apply across devices.

### C5. Settings — Data & Privacy `[MVP]`
- **Purpose:** Give users control and reinforce trust.
- **Components:** Export data (future); delete-all-snippets action; delete-account action; links to privacy policy.
- **User Actions:** Delete snippets in bulk; delete account.
- **Navigation:** From Settings.
- **Expected Behaviour:** Destructive actions require explicit confirmation; deletion is honored across all devices/replicas. Account deletion removes all associated data.

### C6. Settings — Billing `[Future / v3]`
- **Purpose:** Manage subscription/plan.
- **Components:** Plan info, usage vs. limits, payment management (delegated to a payment provider).
- **User Actions:** Upgrade/downgrade; manage payment method (handled by provider UI, never entering raw card data into DevSync).
- **Navigation:** From Settings.
- **Expected Behaviour:** Placeholder in MVP; fully realized when monetization launches.

---

## D. Collaboration Screens `[v3]`

### D1. Team Workspace Dashboard `[v3]`
- **Purpose:** Shared space for a team's collections/snippets.
- **Components:** Workspace switcher; shared collections; member list; activity feed.
- **User Actions:** Switch workspace; open shared collection; view activity.
- **Navigation:** From workspace switcher.
- **Expected Behaviour:** Shows only shared content; personal snippets remain private.

### D2. Team Members & Roles `[v3]`
- **Purpose:** Manage membership and permissions.
- **Components:** Member list with roles; invite control; role editor.
- **User Actions:** Invite; change role; remove member.
- **Navigation:** From workspace settings.
- **Expected Behaviour:** Role changes take effect immediately; removed members lose shared access at once.

### D3. Shared Collection View `[v3]`
- **Purpose:** A collection visible to the workspace.
- **Components:** Collection header; scoped snippet stream; sharing/permission controls.
- **User Actions:** Add/remove snippets (per role); copy.
- **Navigation:** From Team Workspace Dashboard.
- **Expected Behaviour:** Realtime updates for all members; respects roles.

---

## E. System & Utility Screens

### E1. Empty States (per list screen) `[MVP]`
- **Purpose:** Guide users when there is no data yet.
- **Components:** Friendly illustration/text + a primary action (e.g., *Create your first snippet*).
- **Expected Behaviour:** Every list has a purposeful empty state, never a blank void.

### E2. Error / Offline / Reconnecting States `[MVP]`
- **Purpose:** Maintain trust when things go wrong.
- **Components:** Inline banners/toasts for offline, reconnecting, sync failure, and permission errors.
- **Expected Behaviour:** Always visible, never alarming; explains what happened and what the user can do. Never hides a failed sync.

### E3. 404 / Not Found `[MVP]`
- **Purpose:** Handle bad routes and gone/expired resources gracefully.
- **Components:** Message + link home.
- **Expected Behaviour:** No data leak; friendly recovery path.

### E4. Notifications Center `[v1.1 → v2]`
- **Purpose:** Surface arrival notifications and (later) team activity.
- **Components:** List of recent notifications; mark-as-read; settings link.
- **Expected Behaviour:** Starts as lightweight in-app arrivals (v1.1), grows into a richer center (v2+).

### E5. Personal Analytics Dashboard `[v2]`
- **Purpose:** Show the user their usage patterns.
- **Components:** Snippets synced over time, top types, busiest projects, device activity.
- **Expected Behaviour:** Read-only insights derived from the user's own data; sets up value-based conversations for monetization.

---

## Screen Map (summary)

```
Public:  Landing ─▶ OAuth Callback ─▶ [Dashboard]
         Shared Snippet (public)          │
         Legal                            │
                                          ▼
Auth:    Dashboard ◀──▶ Snippet Detail ◀──▶ Create Snippet
            │  │  │
            │  │  └─▶ Search Results
            │  └────▶ Project View
            └───────▶ Settings ─▶ Devices / Profile / Preferences / Data&Privacy / Billing
                                └─▶ Notifications Center [v1.1+]
                                └─▶ Analytics [v2]
Team[v3]: Team Dashboard ─▶ Members&Roles / Shared Collection
```

---

*End of Screen Inventory.*
