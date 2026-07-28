/**
 * Storage bucket registry — the typed single source of truth that mirrors the
 * SQL bucket definitions (supabase/migrations *_storage*.sql). Path scope
 * documents the folder convention the RLS policies enforce.
 */
export type StorageBucket = "avatars" | "workspace-assets" | "snippet-attachments" | "exports";

export type PathScope = "user" | "workspace";

export interface BucketDefinition {
  id: StorageBucket;
  public: boolean;
  maxSizeBytes: number;
  /** Allowed MIME types, or null to allow any type. */
  allowedMimeTypes: readonly string[] | null;
  pathScope: PathScope;
}

const MB = 1024 * 1024;

export const BUCKETS: Record<StorageBucket, BucketDefinition> = {
  avatars: {
    id: "avatars",
    public: true,
    maxSizeBytes: 2 * MB,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/gif"],
    pathScope: "user",
  },
  "workspace-assets": {
    id: "workspace-assets",
    public: false,
    maxSizeBytes: 5 * MB,
    allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "image/svg+xml"],
    pathScope: "workspace",
  },
  "snippet-attachments": {
    id: "snippet-attachments",
    public: false,
    maxSizeBytes: 10 * MB,
    allowedMimeTypes: null,
    pathScope: "workspace",
  },
  exports: {
    id: "exports",
    public: false,
    maxSizeBytes: 50 * MB,
    allowedMimeTypes: ["application/json", "application/x-ndjson", "text/csv", "application/zip"],
    pathScope: "workspace",
  },
};

export function getBucket(bucket: StorageBucket): BucketDefinition {
  return BUCKETS[bucket];
}
