/**
 * Type-based library views. Each nav item maps to a set of `metadata.kind`
 * values produced by the capture/upload flows.
 */
export type LibraryType = "images" | "links" | "docs" | "files";

export const LIBRARY_KINDS: Record<LibraryType, readonly string[]> = {
  images: ["image"],
  links: ["url"],
  docs: ["pdf", "office"],
  files: ["file", "archive", "audio", "video"],
};

export const LIBRARY_META: Record<LibraryType, { title: string; description: string }> = {
  images: { title: "Images", description: "Every image you've synced, newest first." },
  links: { title: "Links", description: "URLs saved from any of your devices." },
  docs: { title: "Documents", description: "PDFs and office documents." },
  files: { title: "Files", description: "Archives, audio, video, and other files." },
};

export function isLibraryType(value: string): value is LibraryType {
  return value === "images" || value === "links" || value === "docs" || value === "files";
}

/** Friendly label for the originating platform (metadata.source). */
export function sourceLabel(source: string | null): string | null {
  if (source === "web") return "Web";
  if (source === "mobile") return "Android";
  if (source === "extension") return "Extension";
  return null;
}
