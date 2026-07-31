import {
  Clipboard,
  FolderKanban,
  Library,
  Search,
  ShieldCheck,
  Upload,
  WifiOff,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";
import { cn } from "@/utils/cn";

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
  gradient: string;
  span?: string;
}

const FEATURES: Feature[] = [
  {
    title: "Universal clipboard",
    description:
      "Copy on your phone, paste on your laptop. Text, code, and links move the moment you save them.",
    icon: Clipboard,
    gradient: "from-blue-500 to-indigo-500",
    span: "lg:col-span-2",
  },
  {
    title: "Sync any file",
    description: "Images, PDFs, Word, Excel, ZIP, audio, video. If you can share it, it syncs.",
    icon: Upload,
    gradient: "from-violet-500 to-purple-500",
  },
  {
    title: "Realtime by default",
    description: "Changes appear on every signed-in device in about a second. No refresh button.",
    icon: Zap,
    gradient: "from-amber-400 to-orange-500",
  },
  {
    title: "Projects",
    description: "Group related content so work, side projects, and study stay separate.",
    icon: FolderKanban,
    gradient: "from-emerald-400 to-teal-500",
  },
  {
    title: "Collections",
    description: "Curate reusable sets of snippets and files you reach for again and again.",
    icon: Library,
    gradient: "from-pink-500 to-rose-500",
  },
  {
    title: "Search everything",
    description:
      "Full-text search across text, code, filenames and tags — with instant results as you type.",
    icon: Search,
    gradient: "from-cyan-400 to-sky-500",
    span: "lg:col-span-2",
  },
  {
    title: "Works offline",
    description: "Save without a connection. Everything queues and syncs the moment you are back.",
    icon: WifiOff,
    gradient: "from-slate-400 to-slate-600",
  },
  {
    title: "Private by design",
    description:
      "Row-level security isolates every workspace in the database itself. Your data stays yours.",
    icon: ShieldCheck,
    gradient: "from-brand to-brand-accent",
  },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300",
        "hover:-translate-y-1 hover:border-brand/40 hover:shadow-premium",
        feature.span,
      )}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-40 rounded-full bg-brand/10 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div
        className={cn(
          "relative mb-4 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-soft transition-transform duration-300 group-hover:scale-110",
          feature.gradient,
        )}
      >
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="relative mb-1.5 text-base font-semibold">{feature.title}</h3>
      <p className="relative text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
    </article>
  );
}

export function Features() {
  return (
    <section id="features" className="py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Everything you need"
          title="One place for everything you move"
          description="Built for the hundred small transfers you make every day — between your phone, your laptop, and the machine you are not allowed to install anything on."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </Container>
    </section>
  );
}
