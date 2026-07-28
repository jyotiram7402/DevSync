import { ClipboardCheck, Copy, Zap } from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const STEPS = [
  {
    icon: Copy,
    title: "Copy on any device",
    description: "Grab an error, a log, or a snippet on whichever machine hit the problem.",
  },
  {
    icon: Zap,
    title: "It syncs instantly",
    description: "DevSync privately pushes it to your other signed-in devices in real time.",
  },
  {
    icon: ClipboardCheck,
    title: "Paste where you debug",
    description: "Switch to the machine with your AI assistant or second IDE and paste — done.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="border-y border-border/60 bg-muted/30 py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="How it works"
          title="Three steps. Zero friction."
          description="The copy-paste-transfer loop, collapsed into a single action."
        />
        <ol className="grid gap-8 md:grid-cols-3">
          {STEPS.map(({ icon: Icon, title, description }, index) => (
            <li key={title} className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-brand/10 font-mono text-sm font-medium text-brand">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
