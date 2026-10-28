import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { Hero } from "@/components/sections/hero";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Pains } from "@/components/sections/pains";
import { Privacy } from "@/components/sections/privacy";
import { PageWrapper } from "@/components/shared/page-wrapper";

/**
 * Landing page. Opens with the sync itself (a short demo of something pasted
 * on a laptop arriving on a phone), then the workarounds it replaces, how it
 * works, what you can send, privacy, questions, and one call to action.
 * Server-rendered; only the demo and the header menu run in the browser.
 */
export default function HomePage() {
  return (
    <PageWrapper>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <Pains />
        <HowItWorks />
        <Features />
        <Privacy />
        <FAQ />
        <CTA />
      </main>
      <SiteFooter />
    </PageWrapper>
  );
}
