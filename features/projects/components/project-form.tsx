"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProjectAction, updateProjectAction } from "@/features/projects/actions";
import { ProjectColorPicker } from "@/features/projects/components/project-color-picker";
import { ProjectIconPicker } from "@/features/projects/components/project-icon-picker";
import { DEFAULT_PROJECT_COLOR } from "@/features/projects/constants";
import { DEFAULT_PROJECT_ICON } from "@/features/projects/icons";
import { projectFormSchema, type ProjectFormValues } from "@/features/projects/schemas";
import type { Project } from "@/features/projects/types";

interface ProjectFormProps {
  mode: "create" | "edit";
  project?: Project;
  /** When provided (e.g. in a dialog), called on success instead of navigating. */
  onSuccess?: (project: Project) => void;
}

export function ProjectForm({ mode, project, onSuccess }: ProjectFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
      icon: project?.icon ?? DEFAULT_PROJECT_ICON,
      color: project?.color ?? DEFAULT_PROJECT_COLOR,
    },
  });

  const icon = watch("icon") ?? DEFAULT_PROJECT_ICON;
  const color = watch("color") ?? DEFAULT_PROJECT_COLOR;

  async function onSubmit(values: ProjectFormValues) {
    setFormError(null);
    const result =
      mode === "edit" && project
        ? await updateProjectAction(project.id, values)
        : await createProjectAction(values);

    if (!result.ok) {
      if (result.error.fieldErrors) {
        for (const [field, messages] of Object.entries(result.error.fieldErrors)) {
          if (messages[0]) {
            setError(field as keyof ProjectFormValues, { message: messages[0] });
          }
        }
      } else {
        setFormError(result.error.message);
      }
      return;
    }

    toast.success(mode === "edit" ? "Project updated" : "Project created");
    router.refresh();
    if (onSuccess) {
      onSuccess(result.data);
    } else {
      router.push(`/dashboard/projects/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {formError ? <FormError message={formError} /> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          autoFocus
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? "name-error" : undefined}
          {...register("name")}
        />
        {errors.name ? (
          <p id="name-error" role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="What is this project for?"
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? "description-error" : undefined}
          {...register("description")}
        />
        {errors.description ? (
          <p id="description-error" role="alert" className="text-sm text-destructive">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Icon</Label>
        <ProjectIconPicker value={icon} onChange={(next) => setValue("icon", next, { shouldDirty: true })} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Color</Label>
        <ProjectColorPicker value={color} onChange={(next) => setValue("color", next, { shouldDirty: true })} />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
