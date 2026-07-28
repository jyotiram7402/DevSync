import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

/** Placeholder stack trace shown in the decorative product mock. */
const TRACE = `Error: Cannot read properties of undefined (reading 'id')
    at getUser (auth.ts:42:17)
    at handler (route.ts:18:9)
    at process (server.ts:120:5)`;

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Decorative backdrop: faint grid, masked to fade at the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      {/* Decorative brand glow. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-brand/20 blur-[120px]"
      />

      <Container className="flex flex-col items-center gap-8 pb-16 pt-20 text-center sm:pt-28">
        <Badge variant="brand" className="animate-fade-up">
          <span className="inline-block size-1.5 rounded-full bg-brand" />
          Now in early access
        </Badge>

        <h1
          className="max-w-3xl text-balance text-4xl font-semibold tracking-tight animate-fade-up sm:text-6xl"
          style={{ animationDelay: "60ms" }}
        >
          Copy once. Debug <span className="text-brand">anywhere.</span>
        </h1>

        <p
          className="max-w-xl text-balance text-lg text-muted-foreground animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          DevSync instantly syncs your errors, logs, and snippets across every machine you code on.
          Copy on one device, paste into your AI assistant on another — no more emailing yourself
          stack traces.
        </p>

        <div
          className="flex flex-col items-center gap-3 animate-fade-up sm:flex-row"
          style={{ animationDelay: "180ms" }}
        >
          <Button asChild size="lg">
            <Link href="#get-started">
              Get started
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="#how-it-works">See how it works</Link>
          </Button>
        </div>

        {/* Decorative product mock. */}
        <div
          aria-hidden="true"
          className="mt-10 w-full max-w-4xl animate-scale-in"
          style={{ animationDelay: "240ms" }}
        >
          <div className="overflow-hidden rounded-xl border bg-card shadow-premium">
            <div className="flex items-center gap-2 border-b px-4 py-3">
              <span className="size-3 rounded-full bg-red-400" />
              <span className="size-3 rounded-full bg-amber-400" />
              <span className="size-3 rounded-full bg-emerald-400" />
              <span className="ml-3 font-mono text-xs text-muted-foreground">
                devsync — synced clipboard
              </span>
            </div>
            <div className="grid md:grid-cols-2">
              <div className="border-b p-5 text-left font-mono text-xs leading-relaxed md:border-b-0 md:border-r">
                <p className="mb-2 text-muted-foreground">{"// Machine A · copied"}</p>
                <pre className="whitespace-pre-wrap text-foreground/90">{TRACE}</pre>
              </div>
              <div className="p-5 text-left font-mono text-xs leading-relaxed">
                <p className="mb-2 text-muted-foreground">{"// Machine B · available instantly"}</p>
                <pre className="whitespace-pre-wrap text-foreground/90">{TRACE}</pre>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium text-foreground">
                  <Check className="size-3 text-brand" />
                  Synced · 3 devices
                </span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
