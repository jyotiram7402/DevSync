import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing" description="Your plan." />
      <DashboardCard title="Current plan" action={<Badge variant="muted">Free</Badge>}>
        <p className="max-w-prose text-sm text-muted-foreground">
          You&apos;re on the free plan. Everything in CopyAnywhere is free to use right now, and there&apos;s nothing to
          pay.
        </p>
      </DashboardCard>
    </div>
  );
}
