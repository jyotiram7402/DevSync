import type { AuthUser } from "@/types/auth";

/**
 * Permission primitives (foundation).
 *
 * A minimal, extensible authorization surface. Today the only capability is
 * "authenticated"; role/team-based permissions layer onto this model later
 * without changing call sites. Authorization is ALWAYS additionally enforced
 * at the data layer via RLS — these checks are UX/guard conveniences, not the
 * security boundary.
 */
export type Permission = "authenticated";

export function isAuthenticated(user: AuthUser | null): user is AuthUser {
  return user !== null;
}

export function can(user: AuthUser | null, permission: Permission): boolean {
  switch (permission) {
    case "authenticated":
      return isAuthenticated(user);
    default: {
      // Exhaustiveness guard — a new Permission must be handled above.
      const _exhaustive: never = permission;
      return _exhaustive;
    }
  }
}
