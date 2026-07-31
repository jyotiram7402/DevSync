import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Comparison } from "@/components/sections/comparison";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Security } from "@/components/sections/security";
import { TrustBar } from "@/components/sections/trust-bar";
import { UseCases } from "@/components/sections/use-cases";
import { PageWrapper } from "@/components/shared/page-wrapper";

/**
 * Marketing landing page.
 *
 * A Server Component composing the header, marketing sections, and footer.
 * Only the hero's rotating headline and sync animation opt into the client;
 * everything else is server-rendered for a fast, low-JS first paint.
 */
export default function HomePage() {
  return (
    <PageWrapper>
      <SiteHeader />
      <main id="main" className="flex-1">
        <Hero />
        <TrustBar />
        <Features />
        <HowItWorks />
        <UseCases />
        <Comparison />
        <Security />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </PageWrapper>
  );
}
