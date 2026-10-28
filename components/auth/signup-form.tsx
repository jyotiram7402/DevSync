"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-error";
import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/hooks/use-supabase";
import { resendSignupConfirmation, signUpWithPassword } from "@/lib/auth/auth";
import { signupSchema, type SignupInput } from "@/lib/auth/schemas";

/** Supabase accepts one confirmation email per address per minute. */
const RESEND_COOLDOWN_SECONDS = 60;

export function SignupForm() {
  const supabase = useSupabase();
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
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
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: { email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: SignupInput) {
    setFormError(null);
    const result = await signUpWithPassword(supabase, values);
    if (!result.ok) {
      if (result.error.code === "CONFLICT") {
        setError("email", { message: result.error.message });
      } else {
        setFormError(result.error.message);
      }
      return;
    }
    if (result.data.needsEmailConfirmation) {
      setSentTo(values.email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      return;
    }
    router.push("/dashboard/home");
    router.refresh();
  }

  async function handleResend() {
    if (!sentTo) return;
    setResending(true);
    setResendError(null);
    setResendNote(null);
    const result = await resendSignupConfirmation(supabase, sentTo);
    setResending(false);
    if (!result.ok) {
      setResendError(result.error.message);
      return;
    }
    setResendNote("Sent again. It can take a few minutes to arrive.");
    setCooldown(RESEND_COOLDOWN_SECONDS);
  }

  function changeEmail() {
    setSentTo(null);
    setResendNote(null);
    setResendError(null);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col gap-4 text-center text-sm">
        <div className="flex flex-col gap-2">
          <p className="font-medium text-foreground">Check your email</p>
          <p className="text-muted-foreground">
            We sent a confirmation link to{" "}
            <span className="font-medium text-foreground [overflow-wrap:anywhere]">{sentTo}</span>. Open it
            on any device to finish creating your account.
          </p>
          <p className="text-muted-foreground">
            Nothing after a few minutes? Check your spam folder, or send it again.
          </p>
        </div>

        {resendError ? <FormError message={resendError} /> : null}
        <p role="status" className="text-muted-foreground empty:hidden">
          {resendNote}
        </p>

        <Button
          type="button"
          variant="outline"
          onClick={handleResend}
          disabled={resending || cooldown > 0}
          aria-busy={resending}
        >
          {resending ? "Sending…" : cooldown > 0 ? `Send again in ${cooldown}s` : "Send the email again"}
        </Button>
        <button
          type="button"
          onClick={changeEmail}
          className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <OAuthButtons />

      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">or</span>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        {formError ? <FormError message={formError} /> : null}

        <div className="flex flex-col gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
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

        <div className="flex flex-col gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={errors.password ? "password-error" : undefined}
            {...register("password")}
          />
          {errors.password ? (
            <p id="password-error" role="alert" className="text-sm text-destructive">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={errors.confirmPassword ? true : undefined}
            aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
            {...register("confirmPassword")}
          />
          {errors.confirmPassword ? (
            <p id="confirmPassword-error" role="alert" className="text-sm text-destructive">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
