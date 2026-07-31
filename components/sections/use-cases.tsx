import {
  Briefcase,
  Code2,
  GraduationCap,
  Megaphone,
  Palette,
  Scale,
  TrendingUp,
  Video,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const CASES: { title: string; description: string; icon: LucideIcon; tint: string }[] = [
  {
    title: "Developers",
    description: "Move stack traces, logs, and snippets between your work machine and your own.",
    icon: Code2,
    tint: "text-blue-500 bg-blue-500/10",
  },
  {
    title: "Students",
    description: "Send lecture photos from your phone straight to the laptop you write notes on.",
    icon: GraduationCap,
    tint: "text-emerald-500 bg-emerald-500/10",
  },
  {
    title: "Designers",
    description: "Shuttle references, exports, and screenshots without a single upload dialog.",
    icon: Palette,
    tint: "text-pink-500 bg-pink-500/10",
  },
  {
    title: "Marketing",
    description: "Collect copy, links, and assets in one place your whole workflow can reach.",
    icon: Megaphone,
    tint: "text-orange-500 bg-orange-500/10",
  },
  {
    title: "Content creators",
    description: "Drop clips and thumbnails from your phone into the machine you edit on.",
    icon: Video,
    tint: "text-violet-500 bg-violet-500/10",
  },
  {
    title: "Business teams",
    description: "Hand off documents between devices without another shared-folder scavenger hunt.",
    icon: Briefcase,
    tint: "text-cyan-500 bg-cyan-500/10",
  },
  {
    title: "Legal",
    description: "Move contracts and PDFs securely, with items that expire on their own.",
    icon: Scale,
    tint: "text-amber-500 bg-amber-500/10",
  },
  {
    title: "Sales",
    description: "Grab a deck or a link on mobile and have it ready on the laptop before the call.",
    icon: TrendingUp,
    tint: "text-rose-500 bg-rose-500/10",
  },
];

export function UseCases() {
  return (
    <section id="use-cases" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Who it is for"
          title="If you own more than one device, this is for you"
          description="The problem is universal. These are just the people who feel it most."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CASES.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="group rounded-2xl border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-premium"
              >
                <div
                  className={`mb-4 flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${item.tint}`}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-sm font-semibold">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
