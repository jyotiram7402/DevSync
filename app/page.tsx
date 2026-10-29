import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Inbox } from "@/components/sections/inbox";
import { Kinds } from "@/components/sections/kinds";
import { Privacy } from "@/components/sections/privacy";
import { SpacesPreview } from "@/components/sections/spaces-preview";
import { WorkLaptop } from "@/components/sections/work-laptop";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { SITE_URL } from "@/lib/constants";

/** This site's address, as shown in the illustrated browser window. */
function siteHost(): string {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return "copyanywhere.app";
  }
}

/**
 * Landing page. It starts from the gesture the product is built on — the
 * headline is a text selection — and a try-it-yourself paste demo, then shows
 * the problem (an inbox of notes to yourself), the work laptop that won't
 * install anything, what you can send, Spaces, privacy, questions and one
 * call to action. Server-rendered; only the demo and the header menu run in
 * the browser.
 */
export default function HomePage() {
  return (
    <PageWrapper>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <Inbox />
        <WorkLaptop host={siteHost()} />
        <Kinds />
        <SpacesPreview />
        <Privacy />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </PageWrapper>
  );
}
