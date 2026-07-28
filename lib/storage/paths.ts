/**
 * Storage path builders. The first folder segment encodes the owning scope
 * (user id or workspace id), which the storage RLS policies check. Filenames
 * are sanitized to prevent path traversal and to keep object keys clean.
 */
export function sanitizeFileName(fileName: string): string {
  const base = fileName.split(/[\\/]/).pop() ?? fileName;
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 128);
  return cleaned.length > 0 ? cleaned : "file";
}

/** avatars/<userId>/<file> */
export function avatarPath(userId: string, fileName: string): string {
  return `${userId}/${sanitizeFileName(fileName)}`;
}

/** workspace-assets/<workspaceId>/<file> */
export function workspaceAssetPath(workspaceId: string, fileName: string): string {
  return `${workspaceId}/${sanitizeFileName(fileName)}`;
}

/** snippet-attachments/<workspaceId>/<snippetId>/<file> */
export function snippetAttachmentPath(
  workspaceId: string,
  snippetId: string,
  fileName: string,
): string {
  return `${workspaceId}/${snippetId}/${sanitizeFileName(fileName)}`;
}

/** exports/<workspaceId>/<file> */
export function exportPath(workspaceId: string, fileName: string): string {
  return `${workspaceId}/${sanitizeFileName(fileName)}`;
}
