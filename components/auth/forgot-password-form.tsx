"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/hooks/use-supabase";
import { requestPasswordReset } from "@/lib/auth/auth";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/auth/schemas";

export function ForgotPasswordForm() {
  const supabase = useSupabase();
  const [formError, setFormError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

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
    // Always show a generic confirmation to avoid leaking which emails exist.
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div role="status" className="flex flex-col gap-3 text-center text-sm">
        <p className="text-muted-foreground">
          If an account exists for that email, we have sent a link to reset your password.
        </p>
        <Link href="/login" className="font-medium underline-offset-4 hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
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

      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? "Sending…" : "Send reset link"}
      </Button>
    </form>
  );
}
