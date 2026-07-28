import { ArrowRight, Github } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { GITHUB_URL } from "@/lib/site-config";

export function CTA() {
  return (
    <section id="get-started" className="py-24">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border bg-card px-6 py-16 text-center shadow-premium sm:px-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-brand/10 blur-3xl"
          />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
              Start syncing your dev clipboard
            </h2>
            <p className="text-balance text-muted-foreground">
              DevSync is in early access and free to try. Bring your machines together and never
              email yourself a stack trace again.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                  Star on GitHub
                  <Github />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="#">
                  Read the docs
                  <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
