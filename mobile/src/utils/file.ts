/** File helpers for uploads (URI → name/Blob). */
export function fileNameFromUri(uri: string): string {
  const withoutQuery = uri.split("?")[0] ?? uri;
  const name = withoutQuery.split("/").pop() ?? "file";
  try {
    return decodeURIComponent(name) || "file";
  } catch {
    return name || "file";
  }
}

/**
 * Read a content/file URI into a Blob (for reuse of the shared uploadFile).
 * Suitable for small/medium files; very large media should stream via
 * expo-file-system in a later iteration to bound memory.
 */
export async function blobFromUri(uri: string): Promise<Blob> {
  const response = await fetch(uri);
  return response.blob();
}
