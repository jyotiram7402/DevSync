import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/** The one closing call to action, on the selection wash. */
export function CTA() {
  return (
    <section id="get-started" aria-labelledby="cta-title" className="scroll-mt-20 bg-wash">
      <Container className="flex flex-col gap-6 px-4 py-16 sm:px-6 sm:py-20 md:flex-row md:items-center md:justify-between">
        <div className="flex max-w-xl flex-col gap-2">
          <h2 id="cta-title" className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            Stop emailing yourself.
          </h2>
          <p className="text-pretty text-muted-foreground">
            Sign up in a minute, then sign in on your other device. That&apos;s it.
          </p>
        </div>
        <Button asChild size="lg" className="w-full shrink-0 sm:w-auto">
          <Link href="/signup">Get started free</Link>
        </Button>
      </Container>
    </section>
  );
}
