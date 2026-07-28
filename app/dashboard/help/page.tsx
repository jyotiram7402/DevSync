import { BookOpen, LifeBuoy, MessageCircle } from "lucide-react";

import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";

export const metadata = {
  title: "Help",
};

const HELP_TOPICS = [
  { title: "Documentation", description: "Guides and reference for using DevSync.", icon: BookOpen },
  { title: "Contact support", description: "Reach out when you need a hand.", icon: MessageCircle },
  { title: "Status", description: "Check current service status.", icon: LifeBuoy },
] as const;

export default function HelpPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Help" description="Support resources and documentation." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HELP_TOPICS.map((topic) => (
          <DashboardCard key={topic.title}>
            <div className="flex flex-col gap-2">
              <span className="flex size-9 items-center justify-center rounded-md bg-secondary text-foreground">
                <topic.icon className="size-4" aria-hidden="true" />
              </span>
              <h3 className="text-sm font-semibold">{topic.title}</h3>
              <p className="text-sm text-muted-foreground">{topic.description}</p>
            </div>
          </DashboardCard>
        ))}
      </div>
    </div>
  );
}
