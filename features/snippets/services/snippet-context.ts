import "server-only";

import { cache } from "react";

import { resolveContext } from "@/features/snippets/services/snippet-repository";

/**
 * The signed-in user's workspace and role, looked up once per request. Home
 * alone needs it from three services; without this each one asked Supabase
 * again (a user check plus a workspace query every time).
 */
export const resolveSnippetContext = cache(resolveContext);
