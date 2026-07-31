import {
  DatabaseZap,
  GitMerge,
  Lock,
  RefreshCcw,
  Timer,
  WifiOff,
  type LucideIcon,
} from "lucide-react";

import { Container } from "@/components/shared/container";
import { SectionHeader } from "@/components/shared/section-header";

const CARDS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Private workspaces",
    description:
      "Every row is scoped to your workspace by row-level security — enforced by the database, not just the app.",
    icon: Lock,
  },
  {
    title: "Encrypted in transit",
    description: "All traffic runs over TLS, and sessions are stored in encrypted device storage.",
    icon: DatabaseZap,
  },
  {
    title: "Realtime, not polling",
    description:
      "A persistent secure channel pushes changes the instant they happen. Nothing sits waiting.",
    icon: RefreshCcw,
  },
  {
    title: "Offline queue",
    description:
      "Lost connection? Your item is stored locally and retried automatically until it lands.",
    icon: WifiOff,
  },
  {
    title: "Conflict resolution",
    description:
      "Edits from two devices reconcile predictably with last-write-wins and duplicate detection.",
    icon: GitMerge,
  },
  {
    title: "Auto-expiry",
    description:
      "Items clear themselves on a schedule unless you pin them, so nothing lingers on a shared machine.",
    icon: Timer,
  },
];

export function Security() {
  return (
    <section id="security" className="relative overflow-hidden border-y bg-muted/20 py-24">
      <Container className="flex flex-col gap-12">
        <SectionHeader
          eyebrow="Security"
          title="Built like infrastructure, not a side project"
          description="The guarantees that matter when your clipboard holds credentials, client work, and half-finished ideas."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <article
                key={card.title}
                className="group rounded-2xl border bg-card/70 p-6 backdrop-blur-sm transition-all duration-300 hover:border-brand/40 hover:shadow-premium"
              >
                <div className="mb-4 flex size-10 items-center justify-center rounded-xl border bg-background text-brand transition-transform duration-300 group-hover:scale-110">
                  <Icon className="size-5" aria-hidden="true" />
                </div>
                <h3 className="mb-1.5 text-base font-semibold">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.description}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
