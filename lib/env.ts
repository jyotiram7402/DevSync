import { z } from "zod";

import { EnvironmentError } from "@/utils/errors";

/**
 * Environment variable loader & validator.
 *
 * Validates the public (NEXT_PUBLIC_) variables the app reads on both server
 * and client. In this foundation sprint every variable is OPTIONAL, so the app
 * boots with none configured; the loader still centralizes access and applies
 * safe defaults. When Supabase is introduced, the relevant variables become
 * required here and validation fails fast on misconfiguration.
 *
 * Only NEXT_PUBLIC_ variables belong in this module because it may be imported
 * from client components. Server-only secrets are loaded in a dedicated
 * server-only module in the sprint that needs them.
 */
// `.catch(undefined)` means a malformed value degrades to "unset" (and its
// default) instead of throwing and taking down the entire build/deploy. A
// misconfigured public env var should never be able to break the app — worst
// case it falls back and the app reports "not configured".
const clientEnvSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().catch(undefined),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]).optional().catch(undefined),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional().catch(undefined),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional().catch(undefined),
});

// Reference variables explicitly so the Next.js compiler can inline them.
const parsed = clientEnvSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
});

if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  throw new EnvironmentError(
    "Invalid environment variables. See .env.example for the required shape.",
  );
}

const raw = parsed.data;

export const env = {
  siteUrl: raw.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  appEnv: raw.NEXT_PUBLIC_APP_ENV ?? "development",
  supabaseUrl: raw.NEXT_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: raw.NEXT_PUBLIC_SUPABASE_ANON_KEY,
} as const;

export type Env = typeof env;
