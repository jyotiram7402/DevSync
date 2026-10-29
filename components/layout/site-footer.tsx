import { Github } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { APP_NAME } from "@/lib/constants";
import { FOOTER_SECTIONS, GITHUB_URL } from "@/lib/site-config";

/** http(s) and mailto links render as plain anchors, not next/link. */
function isExternalHref(href: string): boolean {
  return /^(https?:|mailto:|tel:)/.test(href);
}

const LINK_CLASS =
  "inline-flex items-center rounded-sm py-1 text-sm text-muted-foreground transition-colors duration-fast hover:text-foreground pointer-coarse:min-h-11";

/**
 * SiteFooter — what CopyAnywhere is in a line, the link columns, the theme
 * control, and the copyright. Server component; the year is computed at render.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();
  const githubUrl: string = GITHUB_URL;

  return (
    <footer className="border-t border-border pb-safe">
      <Container className="flex flex-col gap-10 px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3 sm:col-span-2">
            <Logo />
            <p className="max-w-sm text-sm text-muted-foreground">
              Copy on one device, paste on another. Text, code, links, photos and files, in any browser.
            </p>
            {githubUrl ? (
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub repository"
                className="inline-flex size-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors duration-fast hover:text-foreground pointer-coarse:size-11"
              >
                <Github className="size-4" aria-hidden="true" />
              </a>
            ) : null}
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <nav key={section.title} aria-labelledby={`footer-${section.title}`} className="flex flex-col gap-2">
              <h2 id={`footer-${section.title}`} className="text-sm font-medium text-foreground">
                {section.title}
              </h2>
              <ul className="flex flex-col gap-1">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {isExternalHref(link.href) ? (
                      <a href={link.href} className={LINK_CLASS}>
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className={LINK_CLASS}>
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            © {year} {APP_NAME}
          </p>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Theme</span>
            <ThemeToggle />
          </div>
        </div>
      </Container>
    </footer>
  );
}
