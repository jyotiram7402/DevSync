/**
 * Projects feature — public surface.
 *
 * Client-safe exports only (types, permissions, schemas, and components). The
 * server-only ProjectService and Server Actions are imported from their own
 * paths by server components / client callers respectively, so this barrel can
 * be safely imported anywhere without pulling server-only code.
 */
export * from "@/features/projects/types";
export * from "@/features/projects/schemas";
export { getProjectPermissions, type ProjectPermissions } from "@/features/projects/permissions";
export { PROJECTS_PURPOSE, parseProjectView, type ProjectView } from "@/features/projects/constants";

export { ProjectCard } from "@/features/projects/components/project-card";
export { ProjectGrid } from "@/features/projects/components/project-grid";
export { ProjectList } from "@/features/projects/components/project-list";
export { ProjectForm } from "@/features/projects/components/project-form";
export { ProjectDialog } from "@/features/projects/components/project-dialog";
export { ProjectHeader } from "@/features/projects/components/project-header";
export { ProjectActions } from "@/features/projects/components/project-actions";
export { ProjectMenu } from "@/features/projects/components/project-menu";
export { ProjectFilters } from "@/features/projects/components/project-filters";
export { ProjectSearch } from "@/features/projects/components/project-search";
export { ProjectSort } from "@/features/projects/components/project-sort";
export { ProjectPagination } from "@/features/projects/components/project-pagination";
export { ProjectEmptyState } from "@/features/projects/components/project-empty-state";
export { ProjectIconPicker } from "@/features/projects/components/project-icon-picker";
export { ProjectColorPicker } from "@/features/projects/components/project-color-picker";
export { DeleteDialog } from "@/features/projects/components/delete-dialog";
export { CreateProjectButton } from "@/features/projects/components/create-project-button";
export {
  ProjectDetailSkeleton,
  ProjectFormSkeleton,
  ProjectsLoadingSkeleton,
} from "@/features/projects/components/loading-skeleton";
