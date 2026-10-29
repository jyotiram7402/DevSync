import { SearchX } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

/**
 * 404 inside the app (a deleted item, an old link): the shell stays, so the
 * rest of the app is one tap away.
 */
export default function DashboardNotFound() {
  return (
    <EmptyState
      icon={SearchX}
      title="Not found"
      description="It may have been deleted, or the link is old."
      className="my-6"
      action={
        <Button asChild>
          <Link href="/dashboard/home">Go to Home</Link>
        </Button>
      }
      secondaryAction={
        <Button asChild variant="outline">
          <Link href="/dashboard/search">Search</Link>
        </Button>
      }
    />
  );
}
