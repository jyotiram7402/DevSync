import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "~/lib/supabase";

/**
 * Authentication — Supabase Auth (the SAME backend as web). Email/password,
 * magic link, and OAuth (Google/GitHub) via an in-app browser session with a
 * deep-link redirect. Session persistence + refresh are handled by supabase-js
 * against the encrypted SecureStore adapter. No auth logic is duplicated.
 */
const redirectTo = Linking.createURL("/auth-callback");

export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function signInWithPassword(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
}

export async function signInWithMagicLink(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: redirectTo },
  });
  if (error) throw new Error(error.message);
}

export async function signInWithOAuth(provider: "google" | "github"): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error || !data.url) throw new Error(error?.message ?? "Could not start sign in.");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== "success") throw new Error("Sign in was cancelled.");
  await createSessionFromUrl(result.url);
}

/** Exchange the deep-link callback URL for a session (OAuth / magic link). */
export async function createSessionFromUrl(url: string): Promise<Session | null> {
  const { params, errorCode } = Linking.parse(url) as {
    params: Record<string, string | undefined> | null;
    errorCode: string | null;
  };
  if (errorCode) throw new Error(errorCode);

  const code = params?.code;
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new Error(error.message);
    return data.session;
  }

  const access_token = params?.access_token;
  const refresh_token = params?.refresh_token;
  if (access_token && refresh_token) {
    const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (error) throw new Error(error.message);
    return data.session;
  }
  return null;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}
