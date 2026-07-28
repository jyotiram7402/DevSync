import type { StorageBucket } from "@/lib/storage/buckets";
import { validateFile } from "@/lib/storage/validation";
import type { TypedSupabaseClient } from "@/lib/supabase/types";
import type { ActionError, ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";

/**
 * Storage service abstractions over the Supabase Storage API.
 *
 * Every operation takes a Supabase client and returns the typed ActionResult
 * contract (never throwing across the boundary), so the same helpers work from
 * server and client. Uploads are validated against the bucket's rules first.
 * These do not depend on the generated database types.
 */
function readMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") return message;
  }
  return "Storage operation failed.";
}

function mapStorageError(error: unknown): ActionError {
  const message = readMessage(error);
  if (/not found|does not exist|no such/i.test(message)) {
    return { code: "NOT_FOUND", message: "File not found." };
  }
  if (/exceeded|too large|payload too large|maximum/i.test(message)) {
    return { code: "VALIDATION_FAILED", message: "File exceeds the allowed size." };
  }
  if (/unauthorized|forbidden|not allowed|violates|denied/i.test(message)) {
    return { code: "FORBIDDEN", message: "You do not have access to this file." };
  }
  // eslint-disable-next-line no-console
  console.error("[storage] Unhandled error:", message);
  return { code: "INTERNAL", message: "Storage operation failed. Please try again." };
}

export interface UploadOptions {
  bucket: StorageBucket;
  path: string;
  file: File | Blob;
  contentType?: string;
  upsert?: boolean;
}

export async function uploadFile(
  client: TypedSupabaseClient,
  options: UploadOptions,
): Promise<ActionResult<{ path: string }>> {
  const validation = validateFile(options.bucket, {
    size: options.file.size,
    type: options.file.type,
  });
  if (!validation.ok) {
    return validation;
  }

  const { data, error } = await client.storage.from(options.bucket).upload(options.path, options.file, {
    contentType: options.contentType ?? options.file.type,
    upsert: options.upsert ?? false,
  });

  if (error || !data) return err(mapStorageError(error));
  return ok({ path: data.path });
}

export async function downloadFile(
  client: TypedSupabaseClient,
  bucket: StorageBucket,
  path: string,
): Promise<ActionResult<Blob>> {
  const { data, error } = await client.storage.from(bucket).download(path);
  if (error || !data) return err(mapStorageError(error));
  return ok(data);
}

export async function deleteFiles(
  client: TypedSupabaseClient,
  bucket: StorageBucket,
  paths: string[],
): Promise<ActionResult> {
  const { error } = await client.storage.from(bucket).remove(paths);
  if (error) return err(mapStorageError(error));
  return ok(undefined);
}

/** Signed, time-limited URL for objects in PRIVATE buckets. */
export async function createSignedUrl(
  client: TypedSupabaseClient,
  bucket: StorageBucket,
  path: string,
  expiresInSeconds = 3600,
): Promise<ActionResult<{ signedUrl: string }>> {
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresInSeconds);
  if (error || !data) return err(mapStorageError(error));
  return ok({ signedUrl: data.signedUrl });
}

/** Public URL for objects in PUBLIC buckets (e.g. avatars). Synchronous. */
export function getPublicUrl(
  client: TypedSupabaseClient,
  bucket: StorageBucket,
  path: string,
): string {
  return client.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}
