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
import { fileExtension, ITEM_KINDS, kindFromFile } from "@/lib/item-kinds";
import { cn } from "@/utils/cn";

/**
 * FileIcon — a tinted tile that tells file types apart at a glance (document,
 * spreadsheet, slides, archive, audio, video, image, code). Its accessible
 * label is the file type, e.g. "PDF file".
 */
const EXTENSION_ICONS: Record<string, LucideIcon> = {
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  ods: FileSpreadsheet,
  csv: FileSpreadsheet,
  ppt: Presentation,
  pptx: Presentation,
  odp: Presentation,
  key: Presentation,
  js: FileCode,
  jsx: FileCode,
  ts: FileCode,
  tsx: FileCode,
  json: FileCode,
  py: FileCode,
  java: FileCode,
  kt: FileCode,
  go: FileCode,
  rs: FileCode,
  rb: FileCode,
  php: FileCode,
  cs: FileCode,
  c: FileCode,
  cpp: FileCode,
  h: FileCode,
  sh: FileCode,
  sql: FileCode,
  yml: FileCode,
  yaml: FileCode,
  xml: FileCode,
  html: FileCode,
  css: FileCode,
};

const KIND_FILE_ICONS: Partial<Record<string, LucideIcon>> = {
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
  const Icon = EXTENSION_ICONS[extension] ?? KIND_FILE_ICONS[kind] ?? GenericFile;
  const tone = EXTENSION_ICONS[extension] === FileCode ? "code" : ITEM_KINDS[kind].tone;
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
