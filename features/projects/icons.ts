import {
  Box,
  Bug,
  Cloud,
  Code2,
  Database,
  Folder,
  Layers,
  Rocket,
  Terminal,
  Zap,
  type LucideIcon,
} from "lucide-react";

/**
 * Project icon registry. Icons are stored by stable key on the project row and
 * resolved to Lucide components here. `folder` is the default fallback.
 */
export const PROJECT_ICONS = {
  folder: Folder,
  code: Code2,
  database: Database,
  cloud: Cloud,
  bug: Bug,
  terminal: Terminal,
  rocket: Rocket,
  box: Box,
  layers: Layers,
  zap: Zap,
} as const satisfies Record<string, LucideIcon>;

export type ProjectIconKey = keyof typeof PROJECT_ICONS;

export const PROJECT_ICON_KEYS = Object.keys(PROJECT_ICONS) as ProjectIconKey[];

export const DEFAULT_PROJECT_ICON: ProjectIconKey = "folder";

function isIconKey(key: string): key is ProjectIconKey {
  return key in PROJECT_ICONS;
}

/** Resolve an icon key (possibly null/unknown) to a Lucide component. */
export function getProjectIcon(key: string | null | undefined): LucideIcon {
  if (key && isIconKey(key)) {
    return PROJECT_ICONS[key];
  }
  return PROJECT_ICONS[DEFAULT_PROJECT_ICON];
}
