/**
 * Item kinds — one display vocabulary for everything a user can save.
 *
 * Maps the raw values the data already uses (snippet `type`, synced-file
 * `metadata.kind`, Space categories, MIME types and file extensions) onto a
 * small set of display kinds, each with a label and a color tone. This is
 * presentation only: no new kinds are stored. Icons live in
 * components/ui/kind-badge.tsx.
 */
export type ItemKind =
  | "text"
  | "code"
  | "command"
  | "error"
  | "stacktrace"
  | "log"
  | "link"
  | "image"
  | "doc"
  | "file"
  | "archive"
  | "audio"
  | "video"
  | "note";

/** Matches the `kind-*` color tokens. */
export type KindTone = "neutral" | "code" | "command" | "error" | "link" | "image" | "doc" | "note";

export const ITEM_KINDS: Record<ItemKind, { label: string; tone: KindTone }> = {
  text: { label: "Text", tone: "neutral" },
  code: { label: "Code", tone: "code" },
  command: { label: "Command", tone: "command" },
  error: { label: "Error", tone: "error" },
  stacktrace: { label: "Stack trace", tone: "error" },
  log: { label: "Log", tone: "error" },
  link: { label: "Link", tone: "link" },
  image: { label: "Image", tone: "image" },
  doc: { label: "Document", tone: "doc" },
  file: { label: "File", tone: "neutral" },
  archive: { label: "Archive", tone: "neutral" },
  audio: { label: "Audio", tone: "neutral" },
  video: { label: "Video", tone: "neutral" },
  note: { label: "Note", tone: "note" },
};

// Maps (not object literals) so values like "constructor" never hit Object.prototype.
const RAW_KINDS = new Map<string, ItemKind>([
  ["text", "text"],
  ["code", "code"],
  ["command", "command"],
  ["error", "error"],
  ["stacktrace", "stacktrace"],
  ["log", "log"],
  ["url", "link"],
  ["link", "link"],
  ["image", "image"],
  ["pdf", "doc"],
  ["office", "doc"],
  ["doc", "doc"],
  ["file", "file"],
  ["archive", "archive"],
  ["audio", "audio"],
  ["video", "video"],
  ["note", "note"],
]);

/** Display kind for a stored value (snippet type, metadata.kind, Space category). */
export function resolveItemKind(raw: string | null | undefined, fallback: ItemKind = "text"): ItemKind {
  if (!raw) return fallback;
  return RAW_KINDS.get(raw.toLowerCase()) ?? fallback;
}

const EXTENSION_KINDS = new Map<string, ItemKind>([
  ["pdf", "doc"],
  ["doc", "doc"],
  ["docx", "doc"],
  ["odt", "doc"],
  ["rtf", "doc"],
  ["xls", "doc"],
  ["xlsx", "doc"],
  ["ods", "doc"],
  ["csv", "doc"],
  ["ppt", "doc"],
  ["pptx", "doc"],
  ["odp", "doc"],
  ["key", "doc"],
  ["zip", "archive"],
  ["rar", "archive"],
  ["7z", "archive"],
  ["tar", "archive"],
  ["gz", "archive"],
  ["tgz", "archive"],
  ["mp3", "audio"],
  ["wav", "audio"],
  ["m4a", "audio"],
  ["aac", "audio"],
  ["ogg", "audio"],
  ["flac", "audio"],
  ["mp4", "video"],
  ["mov", "video"],
  ["webm", "video"],
  ["mkv", "video"],
  ["avi", "video"],
  ["png", "image"],
  ["jpg", "image"],
  ["jpeg", "image"],
  ["gif", "image"],
  ["webp", "image"],
  ["svg", "image"],
  ["heic", "image"],
  ["avif", "image"],
]);

/** Lower-case extension without the dot ("" when there is none). */
export function fileExtension(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 && dot < name.length - 1 ? name.slice(dot + 1).toLowerCase() : "";
}

/** Display kind for a file, from its MIME type and then its extension. */
export function kindFromFile(name: string, mimeType?: string | null): ItemKind {
  const mime = (mimeType ?? "").toLowerCase();
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (
    mime === "application/pdf" ||
    mime.includes("word") ||
    mime.includes("excel") ||
    mime.includes("spreadsheet") ||
    mime.includes("presentation") ||
    mime.includes("officedocument")
  ) {
    return "doc";
  }
  if (mime.includes("zip") || mime.includes("compressed") || mime.includes("x-tar")) return "archive";
  return EXTENSION_KINDS.get(fileExtension(name)) ?? "file";
}
