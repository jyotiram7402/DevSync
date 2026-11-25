import { Courier_Prime, Libre_Franklin } from "next/font/google";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { CTA } from "@/components/sections/cta";
import { FAQ } from "@/components/sections/faq";
import { Hero } from "@/components/sections/hero";
import { Kinds } from "@/components/sections/kinds";
import { NoInstall } from "@/components/sections/no-install";
import { OldWay } from "@/components/sections/old-way";
import { Privacy } from "@/components/sections/privacy";
import { SpacesPreview } from "@/components/sections/spaces-preview";
import { PageWrapper } from "@/components/shared/page-wrapper";

// Landing page only. Franklin is the face printed forms are set in; Courier
// Prime is what someone typed onto one.
const fontLanding = Libre_Franklin({
  subsets: ["latin"],
  variable: "--font-landing",
  display: "swap",
});

const fontTyped = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-typed",
  display: "swap",
});

/**
 * Landing page, drawn as a duplicate pad ("Carbon copy", tokens in
 * styles/globals.css under `.landing`): the first screen is a white original
 * you can write on and the pink copy it presses through to. Then the
 * workarounds people use today, how it works with nothing to install, what
 * you can send, Spaces, privacy, questions and one call to action — each on
 * its own sheet. Server-rendered; only the pad and the header menu run in the
 * browser.
 */
export default function HomePage() {
  return (
    <PageWrapper className={`landing font-sans ${fontLanding.variable} ${fontTyped.variable}`}>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Hero />
        <OldWay />
        <NoInstall />
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
