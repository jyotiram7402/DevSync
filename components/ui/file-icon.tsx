import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  File as GenericFile,
  Presentation,
  type LucideIcon,
} from "lucide-react";

import { KIND_TONE_TILE } from "@/components/ui/kind-badge";
import { fileExtension, ITEM_KINDS, kindFromFile, type ItemKind } from "@/lib/item-kinds";
import { cn } from "@/utils/cn";

/**
 * FileIcon — a tinted tile that tells file types apart at a glance (document,
 * spreadsheet, slides, archive, audio, video, image, code). Its accessible
 * label is the file type, e.g. "PDF file".
 */
const SPREADSHEET_EXTENSIONS = ["xls", "xlsx", "ods", "csv"];
const SLIDES_EXTENSIONS = ["ppt", "pptx", "odp", "key"];
const CODE_EXTENSIONS = [
  "js",
  "jsx",
  "ts",
  "tsx",
  "json",
  "py",
  "java",
  "kt",
  "go",
  "rs",
  "rb",
  "php",
  "cs",
  "c",
  "cpp",
  "h",
  "sh",
  "sql",
  "yml",
  "yaml",
  "xml",
  "html",
  "css",
];

// A Map (not an object literal) so names like "x.constructor" never hit Object.prototype.
const EXTENSION_ICONS = new Map<string, LucideIcon>([
  ...SPREADSHEET_EXTENSIONS.map((extension): [string, LucideIcon] => [extension, FileSpreadsheet]),
  ...SLIDES_EXTENSIONS.map((extension): [string, LucideIcon] => [extension, Presentation]),
  ...CODE_EXTENSIONS.map((extension): [string, LucideIcon] => [extension, FileCode]),
]);

const KIND_FILE_ICONS: Partial<Record<ItemKind, LucideIcon>> = {
  image: FileImage,
  doc: FileText,
  archive: FileArchive,
  audio: FileAudio,
  video: FileVideo,
};

const SIZES = {
  sm: "size-8 [&_svg]:size-4",
  md: "size-10 [&_svg]:size-5",
  lg: "size-12 [&_svg]:size-6",
} as const;

interface FileIconProps {
  name: string;
  mimeType?: string | null;
  size?: keyof typeof SIZES;
  className?: string;
}

export function FileIcon({ name, mimeType, size = "md", className }: FileIconProps) {
  const extension = fileExtension(name);
  const kind = kindFromFile(name, mimeType);
  const extensionIcon = EXTENSION_ICONS.get(extension);
  const Icon = extensionIcon ?? KIND_FILE_ICONS[kind] ?? GenericFile;
  const tone = extensionIcon === FileCode ? "code" : ITEM_KINDS[kind].tone;
  const label = extension ? `${extension.toUpperCase()} file` : ITEM_KINDS[kind].label;

  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md",
        KIND_TONE_TILE[tone],
        SIZES[size],
        className,
      )}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}
