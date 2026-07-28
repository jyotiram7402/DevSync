import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CTA } from "@/components/sections/cta";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { TechStack } from "@/components/sections/tech-stack";
import { PageWrapper } from "@/components/shared/page-wrapper";

/**
 * Marketing landing page.
 *
 * A Server Component that composes the header, marketing sections, and footer.
 * Only the header and theme toggle opt into the client; everything else is
 * server-rendered for a fast, low-JS first paint.
 */
export default function HomePage() {
  return (
    <PageWrapper>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <Features />
        <HowItWorks />
        <TechStack />
        <CTA />
      </main>
      <SiteFooter />
    </PageWrapper>
  );
}
