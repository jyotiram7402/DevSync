import Link from "next/link";

import { confirmEmailLink } from "@/app/auth/confirm/actions";
import { AuthCard } from "@/components/auth/auth-card";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthUnavailable } from "@/components/auth/auth-unavailable";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { EMAIL_LINK_COPY, isEmailOtpType } from "@/lib/auth/email-links";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata = {
  title: "Confirm",
  robots: { index: false, follow: false },
};

/**
 * Landing page for links in our emails (sign-up confirmation, password reset,
 * magic link, email change). Opening the page changes nothing; the button
 * verifies the link (see ./actions.ts), so email scanners that pre-open links
 * can't use it up.
 */
export default async function ConfirmEmailLinkPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const tokenHash = typeof params.token_hash === "string" ? params.token_hash : "";
  const type = typeof params.type === "string" ? params.type : "";
  const next = typeof params.next === "string" ? params.next : "";

  if (!tokenHash || !isEmailOtpType(type)) {
    return (
      <AuthLayout>
        <AuthCard
          title="This link doesn't work"
          description="It may have been cut off. Use the button in the latest email from us, or ask for a new email."
          footer={
            <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
              Back to sign in
            </Link>
          }
        >
          <Button asChild variant="outline">
            <Link href="/forgot-password">Send a new password reset email</Link>
          </Button>
        </AuthCard>
      </AuthLayout>
    );
  }

  const copy = EMAIL_LINK_COPY[type];

  return (
    <AuthLayout>
      <AuthCard title={copy.title} description={copy.description}>
        {isSupabaseConfigured ? (
          <form action={confirmEmailLink} className="flex flex-col gap-4">
            <input type="hidden" name="token_hash" value={tokenHash} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="next" value={next} />
            <SubmitButton pendingLabel={copy.pending}>{copy.action}</SubmitButton>
          </form>
        ) : (
          <AuthUnavailable />
        )}
      </AuthCard>
    </AuthLayout>
  );
}
