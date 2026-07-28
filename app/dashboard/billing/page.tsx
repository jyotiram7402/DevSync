import { DashboardCard } from "@/components/shared/dashboard-card";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Billing" description="Manage your plan and usage." />
      <DashboardCard
        title="Current plan"
        action={<Badge variant="muted">Free</Badge>}
      >
        <p className="text-sm text-muted-foreground">
          You are on the Free plan. Paid plans and usage-based billing arrive in an upcoming sprint.
        </p>
        <div className="mt-4">
          <Button size="sm" disabled>
            Upgrade to Pro
          </Button>
        </div>
      </DashboardCard>
    </div>
  );
}
