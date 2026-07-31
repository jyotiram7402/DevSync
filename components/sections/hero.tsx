import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { RotatingWords } from "@/components/sections/rotating-words";
import { SyncVisual } from "@/components/sections/sync-visual";
import { Container } from "@/components/shared/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Faint grid, masked to fade at the edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-grid opacity-[0.35] [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]"
      />
      {/* Dual brand glow (primary + accent). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[460px] w-[900px] -translate-x-1/2 rounded-full bg-brand/20 blur-[130px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[62%] top-24 -z-10 h-[320px] w-[520px] -translate-x-1/2 rounded-full bg-brand-accent/15 blur-[120px]"
      />

      <Container className="flex flex-col items-center gap-7 pb-20 pt-20 text-center sm:pt-28">
        <Badge variant="brand" className="gap-1.5 animate-fade-up">
          <Sparkles className="size-3" aria-hidden="true" />
          Realtime sync across every device
        </Badge>

        <h1
          className="max-w-4xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight animate-fade-up sm:text-6xl lg:text-7xl"
          style={{ animationDelay: "60ms" }}
        >
          Move anything.
          <br />
          Access <RotatingWords words={["everywhere", "instantly", "anywhere"]} />
        </h1>

        <p
          className="max-w-2xl text-balance text-lg leading-relaxed text-muted-foreground animate-fade-up"
          style={{ animationDelay: "120ms" }}
        >
          CopyAnywhere instantly synchronizes text, code, images, documents, files and links across
          your devices in real time. From Android to web. From browser to desktop.{" "}
          <span className="text-foreground">Without emailing yourself again.</span>
        </p>

        <div
          className="flex w-full flex-col items-center gap-3 animate-fade-up sm:w-auto sm:flex-row"
          style={{ animationDelay: "180ms" }}
        >
          <Button asChild size="lg" className="w-full shadow-glow sm:w-auto">
            <Link href="/signup">
              Start free
              <ArrowRight />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="#how-it-works">See it in action</Link>
          </Button>
        </div>

        <p
          className="text-xs text-muted-foreground animate-fade-up"
          style={{ animationDelay: "220ms" }}
        >
          Free forever plan · No credit card · No install required
        </p>

        <div
          className="mt-8 flex w-full justify-center animate-scale-in"
          style={{ animationDelay: "260ms" }}
        >
          <SyncVisual />
        </div>
      </Container>
    </section>
  );
}
