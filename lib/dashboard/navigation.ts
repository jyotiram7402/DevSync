import {
  Code2,
  CreditCard,
  FileText,
  Files,
  FolderKanban,
  Home,
  Image,
  Library,
  LifeBuoy,
  Link2,
  Search,
  Settings,
  type LucideIcon,
} from "lucide-react";

/**
 * Dashboard navigation config — the single source of truth for sidebar and
 * mobile-drawer items (label + href + icon), plus a route→label map used by
 * the breadcrumbs. Pure data (icon component references only, no JSX).
 */
export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const DASHBOARD_PRIMARY_NAV: readonly DashboardNavItem[] = [
  { label: "Home", href: "/dashboard/home", icon: Home },
  { label: "Projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "Snippets", href: "/dashboard/snippets", icon: Code2 },
  { label: "Collections", href: "/dashboard/collections", icon: Library },
  { label: "Search", href: "/dashboard/search", icon: Search },
  { label: "Images", href: "/dashboard/library/images", icon: Image },
  { label: "Links", href: "/dashboard/library/links", icon: Link2 },
  { label: "Docs", href: "/dashboard/library/docs", icon: FileText },
  { label: "Files", href: "/dashboard/library/files", icon: Files },
];

export const DASHBOARD_SECONDARY_NAV: readonly DashboardNavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
  { label: "Help", href: "/dashboard/help", icon: LifeBuoy },
];

/** Human labels for path segments (breadcrumbs). Falls back to the segment. */
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  home: "Home",
  projects: "Projects",
  snippets: "Snippets",
  collections: "Collections",
  search: "Search",
  library: "Library",
  images: "Images",
  links: "Links",
  docs: "Documents",
  files: "Files",
  settings: "Settings",
  profile: "Profile",
  billing: "Billing",
  help: "Help",
};
