import { Command, FolderKanban, MonitorSmartphone, Search, ShieldCheck, Zap } from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { Card } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant sync",
    description: "Copy on one device and it appears on the others in about a second. No refresh, no button.",
  },
  {
    icon: MonitorSmartphone,
    title: "Every platform",
    description: "Works in the browser across Windows, macOS, and Linux — nothing to install on locked-down machines.",
  },
  {
    icon: Search,
    title: "Searchable history",
    description: "Every snippet you copy is kept and full-text searchable, so last week's stack trace is seconds away.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "Your snippets are isolated to your account at the database layer and never shared without your say-so.",
  },
  {
    icon: FolderKanban,
    title: "Organized by project",
    description: "Keep client and side-project contexts cleanly separated so nothing ever gets crossed.",
  },
  {
    icon: Command,
    title: "Keyboard-first",
    description: "Create, copy, and search without leaving the keyboard — built for the way developers actually work.",
  },
] as const;

export function Features() {
  return (
    <section id="features" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Features"
          title="Everything you copy, everywhere you work"
          description="A focused set of primitives that make moving text between your machines effortless."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <Card
              key={title}
              className="animate-fade-up p-6 transition-colors hover:border-foreground/20"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-secondary text-foreground">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
