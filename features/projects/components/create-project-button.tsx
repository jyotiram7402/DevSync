"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ProjectDialog } from "@/features/projects/components/project-dialog";

/**
 * "New project" button that opens the create dialog (the same flow from the
 * page header and the empty state). Renders nothing without create permission.
 */
export function CreateProjectButton({ canCreate }: { canCreate: boolean }) {
  const [open, setOpen] = useState(false);

  if (!canCreate) return null;

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        <Plus aria-hidden="true" />
        New project
      </Button>
      <ProjectDialog open={open} onClose={() => setOpen(false)} mode="create" />
    </>
  );
}
