import { ExternalLink } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@ext/popup/components/ui";
import type { SignInResult } from "@ext/hooks/use-popup-state";

/**
 * Popup sign-in — email + password against the shared Supabase Auth backend,
 * plus a link to sign in on the web (for OAuth providers). Fully labelled and
 * keyboard-operable.
 */
export function SignIn({
  onSignIn,
  onOpenWeb,
}: {
  onSignIn: (email: string, password: string) => Promise<SignInResult>;
  onOpenWeb: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    const result = await onSignIn(email.trim(), password);
    setSubmitting(false);
    if (!result.ok) setError(result.error ?? "Sign in failed.");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4" noValidate>
      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-xs font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-xs font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={submitting} aria-busy={submitting}>
        {submitting ? "Signing in…" : "Sign in"}
      </Button>

      <Button type="button" variant="ghost" onClick={onOpenWeb} className="text-xs">
        <ExternalLink className="size-3.5" aria-hidden="true" />
        Sign in on the web
      </Button>
    </form>
  );
}
