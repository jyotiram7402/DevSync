"use client";

import { useMemo } from "react";

import { useSupabase } from "@/hooks/use-supabase";
import type { StorageBucket } from "@/lib/storage/buckets";
import {
  createSignedUrl,
  deleteFiles,
  downloadFile,
  getPublicUrl,
  uploadFile,
  type UploadOptions,
} from "@/lib/storage/storage";
import type { ActionResult } from "@/types/api";

export interface StorageClient {
  upload: (options: UploadOptions) => Promise<ActionResult<{ path: string }>>;
  download: (bucket: StorageBucket, path: string) => Promise<ActionResult<Blob>>;
  remove: (bucket: StorageBucket, paths: string[]) => Promise<ActionResult>;
  createSignedUrl: (
    bucket: StorageBucket,
    path: string,
    expiresInSeconds?: number,
  ) => Promise<ActionResult<{ signedUrl: string }>>;
  getPublicUrl: (bucket: StorageBucket, path: string) => string;
}

/**
 * Client-side storage helpers bound to the browser Supabase client. Memoized
 * so consumers get a stable reference.
 */
export function useStorage(): StorageClient {
  const supabase = useSupabase();

  return useMemo<StorageClient>(
    () => ({
      upload: (options) => uploadFile(supabase, options),
      download: (bucket, path) => downloadFile(supabase, bucket, path),
      remove: (bucket, paths) => deleteFiles(supabase, bucket, paths),
      createSignedUrl: (bucket, path, expiresInSeconds) =>
        createSignedUrl(supabase, bucket, path, expiresInSeconds),
      getPublicUrl: (bucket, path) => getPublicUrl(supabase, bucket, path),
    }),
    [supabase],
  );
}
