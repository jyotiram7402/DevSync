import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";

/**
 * The sign-off: the two shortcuts the whole product is built around, joined
 * by the logo's double chevron, then one call to action.
 */
export function CTA() {
  return (
    <section id="get-started" aria-labelledby="cta-title" className="scroll-mt-20">
      <Container className="flex flex-col items-center gap-8 px-4 py-20 text-center sm:px-6 lg:py-28">
        <div aria-hidden="true" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-4 sm:gap-x-8">
          <Shortcut letter="C" caption="on one device" />
          <svg
            viewBox="1.5 0 32 32"
            className="size-10 shrink-0 text-primary sm:size-12"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.75}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10 9 L17 16 L10 23" />
            <path d="M18 9 L25 16 L18 23" opacity={0.55} />
          </svg>
          <Shortcut letter="V" caption="on any other" />
        </div>

        <div className="flex max-w-xl flex-col gap-3">
          <h2 id="cta-title" className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            That&apos;s the whole idea.
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Sign up in a minute, then sign in on your other device.
          </p>
        </div>

        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href="/signup">Get started free</Link>
        </Button>
      </Container>
    </section>
  );
}

function Shortcut({ letter, caption }: { letter: string; caption: string }) {
  return (
    <span className="flex flex-col items-center gap-2">
      <span className="flex items-center gap-2">
        <Keycap>Ctrl</Keycap>
        <Keycap>{letter}</Keycap>
      </span>
      <span className="text-sm text-muted-foreground">{caption}</span>
    </span>
  );
}

/** A keyboard key: a raised surface with a deeper bottom edge. */
function Keycap({ children }: { children: string }) {
  return (
    <kbd className="inline-flex h-14 min-w-14 items-center justify-center rounded-lg border border-border bg-surface px-4 font-sans text-lg font-medium text-foreground shadow-[inset_0_-4px_0_rgb(var(--border))] sm:h-16 sm:min-w-16 sm:text-xl">
      {children}
    </kbd>
  );
}
