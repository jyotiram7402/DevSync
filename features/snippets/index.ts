/**
 * Snippets feature — public surface (client-safe). The server-only
 * SnippetService and the Server Actions are imported from their own paths.
 * SnippetEditor is intentionally not re-exported here (it is lazy-loaded
 * internally by SnippetForm/SnippetViewer so Monaco stays code-split).
 */
export * from "@/features/snippets/types";
export * from "@/features/snippets/schemas";
export * from "@/features/snippets/constants";
export * from "@/features/snippets/languages";
export { getSnippetPermissions, type SnippetPermissions } from "@/features/snippets/permissions";

export { SnippetCard } from "@/features/snippets/components/snippet-card";
export { SnippetGrid } from "@/features/snippets/components/snippet-grid";
export { SnippetList } from "@/features/snippets/components/snippet-list";
export { SnippetTable } from "@/features/snippets/components/snippet-table";
export { SnippetForm } from "@/features/snippets/components/snippet-form";
export { SnippetViewer } from "@/features/snippets/components/snippet-viewer";
export { SnippetPreview } from "@/features/snippets/components/snippet-preview";
export { SnippetHeader } from "@/features/snippets/components/snippet-header";
export { SnippetToolbar } from "@/features/snippets/components/snippet-toolbar";
export { SnippetActions } from "@/features/snippets/components/snippet-actions";
export { SnippetMenu } from "@/features/snippets/components/snippet-menu";
export { SnippetTags } from "@/features/snippets/components/snippet-tags";
export { LanguageSelector } from "@/features/snippets/components/language-selector";
export { CollectionSelector } from "@/features/snippets/components/collection-selector";
export { ProjectSelector } from "@/features/snippets/components/project-selector";
export { CopyButton } from "@/features/snippets/components/copy-button";
export { DownloadButton } from "@/features/snippets/components/download-button";
export { FavoriteButton } from "@/features/snippets/components/favorite-button";
export { PinButton } from "@/features/snippets/components/pin-button";
export { ArchiveDialog } from "@/features/snippets/components/archive-dialog";
export { RestoreDialog } from "@/features/snippets/components/restore-dialog";
export { DeleteDialog } from "@/features/snippets/components/delete-dialog";
export { BulkActionBar } from "@/features/snippets/components/bulk-action-bar";
export { SnippetSelectCheckbox } from "@/features/snippets/components/snippet-select-checkbox";
export { SnippetEmptyState } from "@/features/snippets/components/empty-state";
export { SnippetsLoadingSkeleton } from "@/features/snippets/components/loading-skeleton";
export { SnippetSearch } from "@/features/snippets/components/snippet-search";
export { SnippetSort } from "@/features/snippets/components/snippet-sort";
export { SnippetFilters } from "@/features/snippets/components/snippet-filters";
export { SnippetPagination } from "@/features/snippets/components/snippet-pagination";
