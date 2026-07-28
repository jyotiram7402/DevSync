"use client";

import { Dialog } from "@/components/ui/dialog";
import { ProjectForm } from "@/features/projects/components/project-form";
import type { Project } from "@/features/projects/types";

/**
 * Modal create/edit form. Closes on success (the form refreshes server data).
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
  project?: Project;
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === "edit" ? "Edit project" : "New project"}
      description={
        mode === "edit"
          ? "Update your project details."
          : "Create a project to organize your snippets."
      }
    >
      <ProjectForm mode={mode} project={project} onSuccess={() => onClose()} />
    </Dialog>
  );
}
