"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/auth-card";
import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/hooks/use-supabase";
import { requestPasswordReset } from "@/lib/auth/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/schemas";

/** Supabase accepts one reset email per address per minute. */
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * "Forgot password" card. Asks for the email, then becomes a "Check your
 * email" card with send-again. The confirmation reads the same whether or not
 * an account exists, so it never reveals which emails are registered.
 */
export function ForgotPasswordForm({ initialError }: { initialError?: string | undefined }) {
  const supabase = useSupabase();
  const [formError, setFormError] = useState<string | null>(initialError ?? null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [resending, setResending] = useState(false);
  const [resendNote, setResendNote] = useState<string | null>(null);
  const [resendError, setResendError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    const result = await requestPasswordReset(supabase, values);
    if (!result.ok) {
      setFormError(result.error.message);
      return;
    }
    setSentTo(values.email);
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  async function handleResend() {
    if (!sentTo) return;
    setResending(true);
    setResendError(null);
    setResendNote(null);
    const result = await requestPasswordReset(supabase, { email: sentTo });
    setResending(false);
    if (!result.ok) {
      setResendError(result.error.message);
      return;
    }
    setResendNote("Sent again. It can take a few minutes to arrive.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  if (sentTo) {
    return (
      <AuthCard title="Check your email" description="Your reset link is on its way.">
        <div className="flex flex-col items-center gap-4 text-center text-sm">
          <span className="flex size-12 items-center justify-center rounded-full bg-wash text-primary-ink">
            <MailCheck className="size-6" aria-hidden="true" />
          </span>
          <p className="text-muted-foreground">
            If an account exists for{" "}
            <span className="font-medium text-foreground [overflow-wrap:anywhere]">{sentTo}</span>, we sent
            it a link to set a new password. It can take a few minutes, so check your spam folder too.
          </p>
          {resendError ? <FormError message={resendError} /> : null}
          <p role="status" className="text-muted-foreground empty:hidden">
            {resendNote}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Button asChild>
            <Link href="/login">Back to sign in</Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={handleResend}
            disabled={cooldown > 0}
            loading={resending}
          >
            {cooldown > 0 ? `Send again in ${cooldown}s` : "Send it again"}
          </Button>
        </div>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Forgot your password?"
      description="Enter your email and we'll send you a link to set a new one."
      footer={
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {formError ? <FormError message={formError} /> : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            enterKeyHint="send"
            aria-invalid={errors.email ? true : undefined}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email ? (
            <p id="email-error" role="alert" className="text-sm text-destructive">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Sending…" : "Send reset link"}
        </Button>
      </form>
    </AuthCard>
  );
}
