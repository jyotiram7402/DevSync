import { BUCKETS, type StorageBucket } from "@/lib/storage/buckets";
import type { ActionResult } from "@/types/api";
import { err, ok } from "@/types/api";
import { formatBytes } from "@/utils/formatters";

/** Minimal shape needed to validate a file (File and Blob both satisfy it). */
export interface ValidatableFile {
  size: number;
  type: string;
}

/**
 * Validate a file against its target bucket's size and MIME-type rules.
 * Returns the typed ActionResult contract (VALIDATION_FAILED on rejection).
 */
export function validateFile(bucket: StorageBucket, file: ValidatableFile): ActionResult {
  const definition = BUCKETS[bucket];

  if (file.size <= 0) {
    return err({ code: "VALIDATION_FAILED", message: "The file is empty." });
  }

  if (file.size > definition.maxSizeBytes) {
    return err({
      code: "VALIDATION_FAILED",
      message: `File exceeds the ${formatBytes(definition.maxSizeBytes)} limit.`,
    });
  }

  if (definition.allowedMimeTypes && !definition.allowedMimeTypes.includes(file.type)) {
    return err({
      code: "VALIDATION_FAILED",
      message: `File type "${file.type || "unknown"}" is not allowed for this bucket.`,
    });
  }

  return ok(undefined);
}
