/**
 * Site configuration.
 *
 * Placeholder navigation, footer, and external-link content for the marketing
 * surface. Centralized here so structure and copy live in one typed place and
 * components stay presentational. Replace hrefs/labels as real pages land.
 */
export interface NavLink {
  label: string;
  href: string;
}

export const NAV_LINKS: readonly NavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Tech stack", href: "#tech" },
];

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterSection {
  title: string;
  links: readonly FooterLink[];
}

export const FOOTER_SECTIONS: readonly FooterSection[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "How it works", href: "#how-it-works" },
      { label: "Roadmap", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "#" },
      { label: "Changelog", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Contact", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "#" },
      { label: "Terms", href: "#" },
    ],
  },
];

/** External project link (placeholder — update to the real repository). */
export const GITHUB_URL = "https://github.com/your-org/devsync" as const;
