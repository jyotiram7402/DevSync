/**
 * Snippets feature — domain types (app-facing, camelCase). Designed so future
 * features (realtime, extensions, CLI, AI, sharing, versioning) can build on
 * these without schema or shape changes.
 */
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export type SnippetVisibility = "private" | "workspace" | "public";

export interface Snippet {
  id: string;
  workspaceId: string;
  projectId: string | null;
  title: string | null;
  content: string;
  language: string | null;
  type: string;
  tags: string[];
  collectionIds: string[];
  favorite: boolean;
  pinned: boolean;
  archived: boolean;
  visibility: SnippetVisibility;
  sourceDeviceId: string | null;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SnippetStatus = "active" | "archived";

export type SnippetSort = "updated" | "created" | "title" | "favorite";

export interface SnippetListParams {
  search?: string | undefined;
  status?: SnippetStatus | undefined;
  sort?: SnippetSort | undefined;
  projectId?: string | undefined;
  language?: string | undefined;
  page?: number | undefined;
  pageSize?: number | undefined;
}

export interface SnippetListResult {
  snippets: Snippet[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  role: WorkspaceRole;
}

export interface SelectOption {
  id: string;
  name: string;
}
