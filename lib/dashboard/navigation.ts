import {
  Code2,
  FileText,
  Files,
  FolderKanban,
  Home,
  Image,
  LifeBuoy,
  Link2,
  ListTodo,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Dashboard navigation config — the single source of truth for the sidebar,
 * the phone bottom bar and the "More" sheet (label + href + icon), plus a
 * route→label map used by the breadcrumbs and the phone page title. Pure data
 * (icon component references only, no JSX).
 *
 * Collections and Billing are deliberately left out of navigation until they
 * do something real; their routes still work for anyone who has a link.
 */
export interface DashboardNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_HOME: DashboardNavItem = { label: "Home", href: "/dashboard/home", icon: Home };
export const NAV_SNIPPETS: DashboardNavItem = { label: "Snippets", href: "/dashboard/snippets", icon: Code2 };
export const NAV_NOTES: DashboardNavItem = { label: "Quick Notes", href: "/dashboard/notes", icon: ListTodo };
export const NAV_SPACES: DashboardNavItem = { label: "Spaces", href: "/dashboard/spaces", icon: Users };
export const NAV_PROJECTS: DashboardNavItem = {
  label: "Projects",
  href: "/dashboard/projects",
  icon: FolderKanban,
};
export const NAV_SEARCH: DashboardNavItem = { label: "Search", href: "/dashboard/search", icon: Search };
export const NAV_SETTINGS: DashboardNavItem = {
  label: "Settings",
  href: "/dashboard/settings",
  icon: Settings,
};
export const NAV_HELP: DashboardNavItem = { label: "Help", href: "/dashboard/help", icon: LifeBuoy };

/** Library views, grouped under "Library" (there is no Library index page). */
export const LIBRARY_NAV: readonly DashboardNavItem[] = [
  { label: "Images", href: "/dashboard/library/images", icon: Image },
  { label: "Links", href: "/dashboard/library/links", icon: Link2 },
  { label: "Docs", href: "/dashboard/library/docs", icon: FileText },
  { label: "Files", href: "/dashboard/library/files", icon: Files },
];

/** Sidebar, top to bottom: main items, Library group, Spaces (+ rooms), Projects; footer items. */
export const SIDEBAR_MAIN: readonly DashboardNavItem[] = [NAV_HOME, NAV_SNIPPETS, NAV_NOTES];
export const SIDEBAR_FOOTER: readonly DashboardNavItem[] = [NAV_SETTINGS, NAV_HELP];

/** Phone "More" sheet: everything that isn't in the bottom bar. */
export const MORE_NAV: readonly DashboardNavItem[] = [NAV_NOTES, NAV_PROJECTS, NAV_SEARCH, NAV_SETTINGS, NAV_HELP];

/** True when `pathname` is `href` or a page under it. */
export function isNavActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Human labels for path segments (breadcrumbs). Falls back to the segment. */
export const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  home: "Home",
  projects: "Projects",
  snippets: "Snippets",
  notes: "Quick Notes",
  spaces: "Spaces",
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
  share: "Share",
  new: "New",
  edit: "Edit",
};
