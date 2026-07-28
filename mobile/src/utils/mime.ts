import type { ContentKind } from "~/types";

/** Classify a MIME type into a coarse content kind for icons + snippet typing. */
export function kindFromMime(mimeType: string, isUrl = false): ContentKind {
  if (isUrl) return "url";
  const type = mimeType.toLowerCase();
  if (type.startsWith("image/")) return "image";
  if (type.startsWith("audio/")) return "audio";
  if (type.startsWith("video/")) return "video";
  if (type === "application/pdf") return "pdf";
  if (type === "application/zip" || type === "application/x-zip-compressed") return "archive";
  if (
    type.includes("word") ||
    type.includes("excel") ||
    type.includes("spreadsheet") ||
    type.includes("presentation") ||
    type.includes("powerpoint") ||
    type.includes("officedocument")
  ) {
    return "office";
  }
  if (type.startsWith("text/") || type === "application/json" || type === "application/xml") {
    return "text";
  }
  return "file";
}

const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

export function looksLikeUrl(value: string): boolean {
  return URL_PATTERN.test(value.trim());
}

/** Best-effort language id for text content (drives snippet type/highlighting). */
export function languageFromName(name: string): string | null {
  const ext = name.split(".").pop()?.toLowerCase();
  if (!ext) return null;
  const map: Record<string, string> = {
    ts: "typescript",
    tsx: "tsx",
    js: "javascript",
    jsx: "jsx",
    json: "json",
    py: "python",
    java: "java",
    go: "go",
    rs: "rust",
    rb: "ruby",
    php: "php",
    sql: "sql",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    sh: "shell",
    html: "html",
    css: "css",
    xml: "xml",
    csv: "csv",
  };
  return map[ext] ?? null;
}
