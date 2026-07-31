import { Github } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Logo } from "@/components/shared/logo";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";
import { FOOTER_SECTIONS, GITHUB_URL } from "@/lib/site-config";

/**
 * SiteFooter — marketing footer with the brand block and link columns.
 * Server component; the copyright year is computed at render time.
 */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border/60">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="flex flex-col gap-4 md:col-span-2 lg:col-span-2">
            <Logo />
            <p className="max-w-xs text-sm text-muted-foreground">
              {APP_TAGLINE} Realtime sync for text, code, images, documents and files across every
              device you use.
            </p>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub repository"
              className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Github className="size-4" />
            </Link>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title} className="flex flex-col gap-3">
              <h3 className="text-sm font-medium">{section.title}</h3>
              <ul className="flex flex-col gap-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/60 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} {APP_NAME}. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Tailwind CSS, and Supabase.
          </p>
        </div>
      </Container>
    </footer>
  );
}
