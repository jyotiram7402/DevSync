import Link from "next/link";

import { SyncDemo } from "@/components/sections/sync-demo";
import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/**
 * Hero: what CopyAnywhere does in one line, who it's for (any browser, even a
 * locked-down work laptop), one call to action, then the sync itself. The
 * heading and intro render straight away (they're the largest paint), with no
 * entrance animation.
 */
export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="border-b border-border">
      <Container className="grid gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)] lg:items-center lg:gap-12 lg:py-24">
        <div className="flex flex-col gap-5">
          <h1
            id="hero-title"
            className="text-balance text-4xl font-semibold leading-tight tracking-tight sm:text-5xl"
          >
            Copy on your laptop. Paste on your phone.
          </h1>
          <p className="text-pretty text-lg text-muted-foreground">
            Or the other way round. Text, code, links, photos and files arrive on your other devices in about a
            second. It&apos;s just a website, so it works even on a work computer where you can&apos;t install
            anything.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/signup">Get started free</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Free to use. Works in Chrome, Edge, Safari and Firefox, on any computer or phone.
          </p>
        </div>

        <SyncDemo />
      </Container>
    </section>
  );
}
