"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { DialogFooter, ResponsiveDialog } from "@/components/ui/dialog";
import { ProjectForm } from "@/features/projects/components/project-form";
import type { Project } from "@/features/projects/types";

/**
 * Create or edit a project in a dialog (a sheet on phones), with Save pinned
 * under the fields. A new project opens right after it's created.
 */
export function ProjectDialog({
  open,
  onClose,
  mode,
  project,
}: {
  open: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  project?: Project | undefined;
}) {
  const router = useRouter();
  const formId = useId();
  const [pending, setPending] = useState(false);

  function close() {
    if (!pending) onClose();
  }

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      title={mode === "edit" ? "Edit project" : "New project"}
      description={mode === "edit" ? undefined : "Group snippets by what you're working on. You can change all of this later."}
      footer={
        <DialogFooter>
          <Button type="button" variant="outline" onClick={close} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={pending}>
            {mode === "edit" ? "Save changes" : "Create project"}
          </Button>
        </DialogFooter>
      }
    >
      <ProjectForm
        mode={mode}
        project={project}
        formId={formId}
        onPendingChange={setPending}
        onSuccess={(saved) => {
          setPending(false);
          onClose();
          if (mode === "create") router.push(`/dashboard/projects/${saved.id}`);
        }}
      />
    </ResponsiveDialog>
  );
}
