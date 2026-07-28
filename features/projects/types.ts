/**
 * Projects feature — domain types.
 *
 * The domain `Project` is the app-facing (camelCase) shape mapped from the
 * database row. Feature code depends on these types, never on raw DB rows.
 */
export type WorkspaceRole = "owner" | "admin" | "member" | "viewer";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  favorite: boolean;
  pinned: boolean;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string | null;
  updatedBy: string | null;
}

export type ProjectStatus = "active" | "archived";

export type ProjectSort = "name" | "updated" | "created" | "favorite";

export interface ProjectListParams {
  search?: string;
  status?: ProjectStatus;
  sort?: ProjectSort;
  page?: number;
  pageSize?: number;
}

export interface ProjectListResult {
  projects: Project[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  role: WorkspaceRole;
}
