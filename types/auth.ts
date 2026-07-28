/**
 * Shared authenticated user model.
 *
 * A minimal, presentation-ready shape derived from the Supabase auth user.
 * Deliberately free of application-specific profile fields — those arrive with
 * the profiles/database sprint.
 */
export type OAuthProvider = "google" | "github";

export type AuthProviderName = OAuthProvider | "email";

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  provider: string | null;
  createdAt: string;
}
