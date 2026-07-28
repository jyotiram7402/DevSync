# DevSync — User Journey

**Version:** 1.0
**Last updated:** 2026-07-22

This document maps complete user flows. Each flow lists the trigger, the step-by-step path, the system's role, edge cases, and the emotional/UX intent. Flows marked **[Future]** describe post-MVP behavior and inform architecture without being built yet.

Notation: `U` = user action, `S` = system response, `→` = transition.

---

## 1. First-Time User

**Trigger:** A developer hears about DevSync ("copy once, debug anywhere") and lands on the marketing/landing page.

**Journey:**
1. `U` Lands on landing page → sees the tagline, a 15-second explanation, and a single primary CTA: *Sign in with GitHub / Google*.
2. `U` Clicks *Sign in with GitHub*.
3. `S` Redirects to GitHub OAuth consent → user approves → redirects back.
4. `S` Creates the account, registers **this** device with an auto-suggested name (e.g., "Chrome on Windows"), and lands the user in the app on an **empty-but-guiding** dashboard.
5. `S` Shows a lightweight, dismissible onboarding: *"Your snippets will sync here. Open DevSync on a second device to see the magic."* with a *Create your first snippet* action.
6. `U` Creates a first snippet (paste an error) → it appears in the list instantly.
7. `S` Nudges: *"Now open DevSync on another device and sign in — this snippet will already be there."*

**Emotional intent:** From zero to "aha" (first synced snippet) in under 3 minutes, with no configuration.

**Edge cases:**
- OAuth denied/cancelled → return to landing with a gentle retry message.
- No second device yet → the app is still useful as a single-device history; onboarding makes the multi-device payoff clear without blocking.

---

## 2. Returning User

**Trigger:** An authenticated user opens DevSync on a known device.

**Journey:**
1. `U` Opens the app.
2. `S` Restores session silently (no re-login), reconnects the realtime channel, and reconciles any snippets created while this device was away.
3. `S` Renders the most recent snippets first; the current/default project is selected.
4. `U` Continues working: creates, copies, searches, or manages snippets.

**Emotional intent:** Instant continuity — it should feel like the app never closed.

**Edge cases:**
- Session expired → transparent re-auth via OAuth, then resume where they were.
- Device was offline for a long time → a brief "syncing…" state, then full reconciliation with no duplicates or losses.

---

## 3. Authentication

**Trigger:** Any unauthenticated access to a protected area, or explicit sign-in.

**Journey (sign-in):**
1. `U` Chooses GitHub or Google.
2. `S` Redirects to provider → user consents → provider returns identity.
3. `S` Establishes a secure session; if the email matches an existing account across providers, the identity is unified; otherwise a new account is created.
4. `S` Registers the device if not already known.
5. `S` Routes to the dashboard.

**Journey (sign-out):**
1. `U` Chooses *Sign out*.
2. `S` Ends the session on this device only; other devices remain signed in. Realtime channel for this device closes.

**Emotional intent:** Zero password friction; sign-in is a formality, not a hurdle.

**Edge cases & rules:**
- Provider outage → clear message, suggest the alternate provider.
- Same person, two providers, same verified email → single unified account (avoids accidental data fragmentation).
- Same person, two providers, different emails → treated as separate accounts (documented limitation; account-linking is a future enhancement).

---

## 4. Creating Projects

**Trigger:** User wants to separate contexts (e.g., a new client or repo).

**Journey:**
1. `U` Opens the project switcher → *New project*.
2. `U` Names the project (e.g., "Acme API").
3. `S` Creates the project and makes it the active context.
4. `U` New snippets now default into this project until they switch context.

**Emotional intent:** Organization is optional and lightweight — never a prerequisite to being productive (the default inbox always exists).

**Edge cases:**
- Duplicate name → allowed but surfaced with a subtle warning, since projects are personal.
- Deleting a project → prompt for what to do with its snippets (move to inbox vs. delete); default is move-to-inbox to prevent accidental loss.

---

## 5. Creating Snippets

**Trigger:** The developer has text (error, trace, log, code, command) to move or keep.

**Journey (in-app):**
1. `U` Clicks *New snippet* (or uses a keyboard shortcut).
2. `U` Pastes/types content; optionally sets a title, type, and project.
3. `S` Detects a likely type as a suggestion (post-MVP heuristic); user can override.
4. `U` Saves.
5. `S` Persists durably, stamps source device + timestamp, and immediately broadcasts to the user's other devices.
6. `S` The snippet appears at the top of the list on **all** devices.

**Emotional intent:** Capture must be near-instant and forgiving — the fewer required fields, the better. Title/type/project are all optional.

**Edge cases:**
- Very large paste → enforce a reasonable size limit with a clear message; suggest trimming.
- Empty content → block save with inline guidance.
- Offline at creation → queue locally, show a "will sync" indicator, and flush on reconnect.

---

## 6. Synchronizing Snippets

**Trigger:** A snippet is created, edited, or deleted on any device.

**Journey (the core loop):**
1. `U` (Device A) creates/edits/deletes a snippet.
2. `S` Writes the change durably.
3. `S` Emits a realtime change event scoped to the user's channel.
4. `S` (Device B, C, …) receive the event and update their local view within ~1 second.
5. `U` (Device B) sees the change without refreshing.

**Emotional intent:** The sync should feel like telepathy between the user's own machines — no button, no refresh, no wait.

**Edge cases (critical to reliability):**
- Simultaneous edits on two devices → last-write-wins on a field basis, with the losing edit recoverable from history (post-MVP versioning); for MVP, last-write-wins on the whole snippet with clear timestamps.
- Device offline during the change → on reconnect, the device pulls the authoritative state (reconciliation) so it never misses or duplicates a snippet.
- Realtime channel drops → automatic reconnect with a state re-sync; a subtle "reconnecting…" indicator maintains trust.

---

## 7. Receiving Snippets

**Trigger:** A snippet created elsewhere arrives on the current device.

**Journey:**
1. `S` Receives the realtime event.
2. `S` Inserts the snippet at the top of the list with a brief highlight animation.
3. `S` `[v1.1]` Shows a lightweight arrival indicator/toast ("New snippet from *Work Laptop*").
4. `U` Clicks *Copy* → content is on the clipboard → pastes into the AI assistant/IDE.

**Emotional intent:** The received snippet should be immediately actionable — the *Copy* action is the hero of this screen.

**Edge cases:**
- Multiple snippets arrive in quick succession → batch the highlight/notification to avoid noise.
- Clipboard permission denied by browser → fall back to a select-all + explicit copy affordance with guidance.

---

## 8. Searching History

**Trigger:** User needs a snippet they created earlier.

**Journey:**
1. `U` Opens search (keyboard shortcut or search bar).
2. `U` Types a query (matches content and title).
3. `S` Returns ranked results in real time as they type.
4. `U` Narrows with filters: project, type, date range.
5. `U` Selects a result → views full content → copies or edits.

**Emotional intent:** "I know I saw that error last week" should resolve in seconds.

**Edge cases:**
- No results → suggest broadening filters; offer to search all projects.
- Huge history → paginate/virtualize; keep search responsive.

---

## 9. Sharing Snippets **[v1.1]**

**Trigger:** User wants to hand a snippet to someone outside their account (e.g., a client or classmate).

**Journey:**
1. `U` Opens a snippet → *Share*.
2. `U` Chooses an expiry (e.g., 1 hour / 1 day / 7 days) → *Generate link*.
3. `S` Creates a read-only, unguessable link with the chosen expiry.
4. `U` Copies and sends the link.
5. Recipient opens the link → sees a clean, read-only view of the snippet content (no account required).
6. `U` Can revoke the link at any time before expiry.

**Emotional intent:** Sharing is easy but *safe by default* — expiry is required, access is read-only, and revocation is one click.

**Edge cases:**
- Expired/revoked link opened → a clear "this link is no longer available" page (no content leak).
- Sensitive content warning → optional nudge before sharing snippets that look like they contain secrets (heuristic; future).

---

## 10. Managing Devices

**Trigger:** User wants to review or control which devices have access.

**Journey:**
1. `U` Opens *Settings → Devices*.
2. `S` Lists all registered devices: name, platform, last-active time, and which one is "this device."
3. `U` Renames a device for clarity.
4. `U` Revokes a device (e.g., an old or lost machine).
5. `S` Immediately invalidates that device's access and closes its realtime channel; the change reflects on the device list across the user's other devices.

**Emotional intent:** Full, obvious control over access — essential for trusting the product with sensitive text.

**Edge cases:**
- Revoking the current device → confirm, then sign out here.
- A revoked device tries to sync → access denied cleanly; it must re-authenticate to return.

---

## 11. Future Team Collaboration **[v3]**

**Trigger:** A team lead wants shared error/fix knowledge across the team.

**Journey (illustrative, informs architecture):**
1. `U` (Lead) creates a **team workspace** and invites members by email.
2. Members accept → gain access to shared **collections** within the workspace.
3. A member shares a snippet into a shared collection → all members see it in real time.
4. Roles govern who can create/edit/delete/share (e.g., admin vs. member).
5. `S` Maintains an activity/audit trail of shared actions.
6. Personal snippets remain strictly private; only explicitly shared items enter team space.

**Emotional intent:** Team value without compromising the sanctity of personal, private snippets.

**Edge cases (design-forward):**
- Member removed from team → loses access to shared collections immediately; their personal snippets are unaffected.
- Ownership transfer when a member leaves → shared items owned by the workspace, not the individual, to prevent knowledge loss.

---

## Cross-Cutting UX Principles

1. **The core loop is keyboard-first:** create, copy, and search are all reachable without a mouse.
2. **Copy is always one action away** on any snippet — it is the product's most important button.
3. **Never block on organization:** projects, tags, and titles are optional.
4. **Always show sync state:** connected / reconnecting / offline is subtly but always visible, because trust depends on it.
5. **Fail safe, never silent:** any error surfaces clearly; the product never pretends a sync happened when it didn't.

---

*End of User Journey.*
