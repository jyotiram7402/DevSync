import Link from "next/link";

import { DISPLAY } from "@/components/sections/landing-type";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/** The sign-off: the last sheet of the pad, torn along the dashed line, with one call to action. */
export function CTA() {
  return (
    <section
      id="get-started"
      aria-labelledby="cta-title"
      className="sheet-canary scroll-mt-20 border-t-2 border-dashed border-foreground/40"
    >
      <Container className="flex flex-col gap-10 px-4 py-20 sm:px-6 sm:py-28 lg:flex-row lg:items-end lg:justify-between">
        <div className="flex flex-col gap-5">
          <h2 id="cta-title" className={DISPLAY}>
            Save it once.
            <br />
            Copy it anywhere.
          </h2>
          <p className="text-lg sm:text-xl">
            Sign up in a minute, then sign in on your other device.
          </p>
        </div>
        <Button asChild size="lg" className="h-14 w-full px-8 text-lg sm:w-auto">
          <Link href="/signup">Get started free</Link>
        </Button>
      </Container>
    </section>
  );
}
