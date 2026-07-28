import { QueryClient } from "@tanstack/react-query";

/**
 * Shared React Query client. Conservative defaults suited to a mobile client on
 * variable connectivity; realtime invalidations keep data fresh, so staleness
 * can be generous.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export const QUERY_KEYS = {
  session: ["session"] as const,
  workspace: ["workspace"] as const,
  recentSnippets: (workspaceId: string) => ["snippets", "recent", workspaceId] as const,
  projects: (workspaceId: string) => ["projects", workspaceId] as const,
  collections: (workspaceId: string) => ["collections", workspaceId] as const,
  devices: ["devices"] as const,
  storageUsage: (workspaceId: string) => ["storage-usage", workspaceId] as const,
  search: (term: string) => ["search", term] as const,
};
