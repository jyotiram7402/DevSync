import { Library, Plus } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Collections",
};

export default function CollectionsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Collections"
        description="Group related snippets across projects."
        actions={
          <Button size="sm" disabled>
            <Plus />
            New collection
          </Button>
        }
      />
      <EmptyState
        icon={Library}
        title="No collections yet"
        description="Collections let you theme snippets independently of their project. This arrives in an upcoming sprint."
      />
    </div>
  );
}
