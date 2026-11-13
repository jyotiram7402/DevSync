# Auth emails from your own Gmail (Supabase)

How to make sign-up confirmation, password reset and sign-in link emails work
in a Supabase project, for free, without owning a domain.

Do Part 1 once. Do Parts 2–4 for each project.

**Why this is needed:** Supabase's built-in email sender only delivers to your
own team's addresses, and only a few emails an hour. Real users need your own
sender ("custom SMTP").

**You need:** a Gmail account made just for app emails, and access to the
project's Supabase dashboard. About 15 minutes.

---

## Part 1: Gmail (once, for all projects)

1. Create a new Gmail account just for app emails, for example
   `yourname.apps@gmail.com`.
   - Pick a short, neutral name. It shows under the app name in every email.
   - Don't use your work email or your personal inbox.
2. Open **Google Account → Security** and turn on **2-Step Verification**.
   App passwords need it.
3. Go to **myaccount.google.com/apppasswords** and create an app password named
   after the project, for example "MyApp Supabase".
4. Copy the 16-letter password. Google shows it only once.

Create **one app password per project**, so you can cancel one without breaking
the others.

> **Keep the app password secret.** Don't put it in code, `.env` files, chats
> or documents. Type it straight into Supabase.

---

## Part 2: Supabase settings (each project)

### A. Email sender

**Authentication → Emails → SMTP Settings** → turn on **Enable custom SMTP**,
then fill in:

| Field | Value |
|---|---|
| Sender email | your app Gmail address (the same as Username) |
| Sender name | the app's name, for example `MyApp` |
| Host | `smtp.gmail.com` |
| Port | `587` (if it doesn't work, try `465`) |
| Username | your app Gmail address, in full |
| Password | this project's 16-letter app password, without spaces |

Click **Save**.

Every project can use the same Gmail. People see the **sender name**, so each
app's emails look like they come from that app.

### B. Addresses

**Authentication → URL Configuration**

- **Site URL:** the live address, for example `https://myapp.vercel.app`.
  Email links are built from it.
- **Redirect URLs:** add `https://myapp.vercel.app/**`. For local testing, also
  add `http://localhost:3000/**`.

### C. Email limit

**Authentication → Rate Limits** → set **emails per hour** to 30–100.

### D. Email confirmation

**Authentication → Sign In / Providers → Email** → keep **Confirm email** on.
Without it, anyone can sign up with an address they don't own.

---

## Part 3: Test

1. Sign up with an address you can open. The email should come from "MyApp"
   with your Gmail address.
2. Tap the link. You should end up signed in.
3. Use **Forgot password**, tap the link, and choose a new password.
4. If an email doesn't arrive, check spam and mark it **Not spam**.

Emails now work with Supabase's own templates. Part 4 is optional, but
recommended.

---

## Part 4: Links that work on any device (recommended)

With the usual Next.js setup (`@supabase/ssr`), Supabase's default links only
work in the same browser that asked for the email. Some company email scanners
also open links before the person does, which uses them up.

The fix: the email link opens a page in your app, and the person taps
**Continue**. The page checks the link on the server with `verifyOtp`, which
works in any browser.

> **Order matters:** deploy the page first. Change the email templates only
> after it's live, or the links will open a missing page.

### 4a. The page (Next.js App Router)

`app/auth/confirm/page.tsx`

```tsx
import { confirmEmailLink } from "./actions";

/**
 * Opening this page changes nothing. The button checks the link, so email
 * scanners that open links can't use them up.
 */
export default async function ConfirmPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : "";
  const type = typeof params.type === "string" ? params.type : "";
  const next = typeof params.next === "string" ? params.next : "";

  if (!tokenHash || !type) {
    return <p>This link doesn&apos;t work. Ask for a new email.</p>;
  }

  return (
    <form action={confirmEmailLink}>
      <input type="hidden" name="token_hash" value={tokenHash} />
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="next" value={next} />
      <button type="submit">Continue</button>
    </form>
  );
}
```

`app/auth/confirm/actions.ts`

```ts
"use server";

import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

// Your project's server-side Supabase client (from @supabase/ssr).
import { createClient } from "@/lib/supabase/server";

const LINK_TYPES: readonly string[] = ["signup", "invite", "magiclink", "recovery", "email_change", "email"];

/** Only paths on this site, like "/dashboard". Never another site, like "//evil.com". */
function safePath(value: FormDataEntryValue | null, fallback: string): string {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}

export async function confirmEmailLink(formData: FormData): Promise<void> {
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");

  if (typeof tokenHash !== "string" || !tokenHash || typeof type !== "string" || !LINK_TYPES.includes(type)) {
    redirect("/login?error=invalid_link");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ type: type as EmailOtpType, token_hash: tokenHash });

  if (error) {
    redirect(type === "recovery" ? "/forgot-password?error=link_expired" : "/login?error=link_expired");
  }

  // Password reset links always go to the "choose a new password" page.
  redirect(type === "recovery" ? "/reset-password" : safePath(formData.get("next"), "/dashboard"));
}
```

Also:

- If your middleware sends signed-out people to the login page, let
  `/auth/confirm` through.
- After a password reset link, the person is signed in and lands on
  `/reset-password`. That page calls `supabase.auth.updateUser({ password })`.
- Other frameworks: same idea. A page with a button that calls
  `supabase.auth.verifyOtp({ type, token_hash })` on the server, then redirects.

### 4b. Email templates

**Authentication → Emails → Templates.** Replace each template's subject and
body. Change `MyApp` and the paths after `next=` to fit your app.

Links always open the **Site URL**, so test them on the live site.

**Confirm signup**. Subject: `Confirm your email`

```html
<h2>Confirm your email</h2>
<p>Tap the button to finish creating your MyApp account.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">Confirm my email</a></p>
```

**Reset password**. Subject: `Reset your password`

```html
<h2>Reset your password</h2>
<p>Tap the button to choose a new password. If you didn't ask for this, ignore this email.</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Choose a new password</a></p>
```

**Magic link**. Subject: `Your sign-in link`

```html
<h2>Your sign-in link</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/dashboard">Sign in to MyApp</a></p>
```

**Change email address**. Subject: `Confirm your new email`

```html
<h2>Confirm your new email</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change&next=/settings">Confirm new email</a></p>
```

**Invite user** (only if the app sends invites). Subject: `You're invited to MyApp`

```html
<h2>You're invited to MyApp</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite&next=/dashboard">Accept the invite</a></p>
```

---

## If something goes wrong

| Problem | What to check |
|---|---|
| "Error sending confirmation email" (or recovery email) | Username and Sender email are the full Gmail address. Make a new app password and paste it again without spaces. Try port `465`. |
| Emails go to spam | Common at first for Gmail senders. Mark them **Not spam**. Keep templates short and plain. |
| "Email rate limit exceeded" | Raise **emails per hour** (Part 2C). |
| "Link expired" the moment you click it, especially from a work email | The email still uses Supabase's default link (`{{ .ConfirmationURL }}`). Company mail scanners (Outlook Safe Links and others) open every link before you do, which uses it up. Do Part 4: the link then opens your own page, and nothing happens until the person presses the button. |
| The link says it's invalid or expired | Only the **newest** email's link works; asking again cancels the earlier one, so open the latest email. Each link works once and expires after about an hour (**Authentication → Sign In / Providers → Email → Email OTP Expiration**; keep it at 3600). Check that the template was saved. |
| The link opens the wrong site (for example localhost) | Fix **Site URL** (Part 2B). |
| Sending suddenly stopped | Changing your Google password or turning off 2-Step Verification deletes app passwords. Make a new one and update Supabase. |
| Emails stop late in the day | Gmail's daily limit (see below). |

---

## Limits, and when to move on

- Gmail sends about **500 emails a day**, shared by every project that uses
  that Gmail. That's plenty for small apps.
- When an app grows or gets its own domain, switch to an email service such as
  Resend. It's the same SMTP screen; only the host, port, username and password
  change. Send from an address on your own domain, so fewer emails land in spam.

---

## Checklist for a new project

- [ ] App password created for this project (Part 1)
- [ ] SMTP settings saved, sender name = app name (Part 2A)
- [ ] Site URL and Redirect URLs set (Part 2B)
- [ ] Email rate limit raised (Part 2C)
- [ ] Confirm email on (Part 2D)
- [ ] Sign-up and password reset tested (Part 3)
- [ ] Optional: `/auth/confirm` page live, then templates changed (Part 4)
