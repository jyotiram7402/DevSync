"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProjectDialog } from "@/features/projects/components/project-dialog";

/**
 * "New project" button that opens the create dialog. Renders nothing when the
 * user lacks create permission.
 */
export function CreateProjectButton({ canCreate }: { canCreate: boolean }) {
  const [open, setOpen] = useState(false);

  if (!canCreate) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus />
        New project
      </Button>
      <ProjectDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
