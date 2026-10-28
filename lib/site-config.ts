/**
 * Site configuration.
 *
 * Navigation, footer, and external-link content for the marketing surface.
 * Centralized here so structure and copy live in one typed place and components
 * stay presentational. Every href below resolves to a real section, route, or
 * address — no placeholder ("#") links. Section links start with "/" so they
 * also work from /privacy and /terms.
 */
export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Privacy", href: "/#privacy" },
  { label: "FAQ", href: "/#faq" },
];

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: readonly FooterLink[];
}

/** Support inbox surfaced in the footer "Contact" link. */
// TODO(owner): confirm this address (or point it at your real support inbox).
export const SUPPORT_EMAIL = "support@copyanywhere.com" as const;

export const FOOTER_SECTIONS: readonly FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how-it-works" },
      { label: "What you can send", href: "/#features" },
      { label: "FAQ", href: "/#faq" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Contact", href: `mailto:${SUPPORT_EMAIL}` },
    ],
  },
];

/**
 * Public source repository. Empty string hides the GitHub icon in the footer
 * (so we never ship a dead link). Set this to the real repo URL to show it.
 */
// TODO(owner): paste the real public repository URL here.
export const GITHUB_URL = "" as const;
