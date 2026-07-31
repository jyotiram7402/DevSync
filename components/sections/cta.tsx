import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

export function CTA() {
  return (
    <section id="get-started" className="py-24">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-20 text-center shadow-premium sm:px-16">
          {/* Animated brand gradient wash */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,hsl(var(--brand)/0.16),transparent_40%,hsl(var(--accent-brand)/0.16))] bg-[length:200%_200%] motion-safe:animate-gradient-pan"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 left-1/2 size-[420px] -translate-x-1/2 rounded-full bg-brand/20 blur-[110px]"
          />

          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="text-balance text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Stop sending files to yourself.
            </h2>
            <p className="text-balance text-lg text-muted-foreground">
              Copy once. Access anywhere. Free to start, nothing to install, works on every device
              you already use.
            </p>
            <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <Button asChild size="lg" className="w-full shadow-glow sm:w-auto">
                <Link href="/signup">
                  Start free
                  <ArrowRight />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              No credit card · No install · Free forever plan
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
