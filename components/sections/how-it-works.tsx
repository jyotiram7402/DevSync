import { Copy, MonitorSmartphone, Zap } from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const STEPS = [
  {
    icon: Copy,
    title: "Copy anything",
    description:
      "Text, code, a screenshot, a PDF, a link — from your phone, your laptop, or the browser extension.",
  },
  {
    icon: Zap,
    title: "Synced automatically",
    description:
      "It is encrypted in transit, written to your private workspace, and pushed out in real time. No button to press.",
  },
  {
    icon: MonitorSmartphone,
    title: "Available everywhere",
    description:
      "Open any device you are signed in on and it is already there — ready to copy, open, or download.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative overflow-hidden py-24">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[300px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand/10 blur-[120px]"
      />
      <Container className="flex flex-col gap-14">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps. Then never think about it again."
          description="No syncing rituals, no folders to manage, no sending yourself another email."
        />

        <ol className="relative grid gap-8 md:grid-cols-3">
          {/* Connecting line (desktop) */}
          <div
            aria-hidden="true"
            className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-brand/40 to-transparent md:block"
          />

          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title} className="relative flex flex-col items-center text-center">
                <div className="relative mb-5">
                  <span className="absolute inset-0 rounded-2xl bg-brand/30 motion-safe:animate-pulse-ring" />
                  <div className="relative flex size-14 items-center justify-center rounded-2xl border bg-card shadow-soft">
                    <Icon className="size-6 text-brand" aria-hidden="true" />
                  </div>
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-accent text-[10px] font-bold text-white">
                    {index + 1}
                  </span>
                </div>
                <h3 className="mb-2 text-base font-semibold">{step.title}</h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </li>
            );
          })}
        </ol>
      </Container>
    </section>
  );
}
