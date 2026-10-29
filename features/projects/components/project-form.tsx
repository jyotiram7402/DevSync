"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
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
  project?: Project | undefined;
  /** Called with the saved project instead of navigating to it (dialogs). */
  onSuccess?: (project: Project) => void;
  /**
   * When the submit button lives outside the form (a dialog footer, using
   * `form={formId}`): the form renders no buttons of its own and reports
   * whether it is saving.
   */
  formId?: string;
  onPendingChange?: (pending: boolean) => void;
  /** Where Cancel goes on the full-page form. */
  cancelHref?: string;
}

/** Create or edit a project: name, description, icon and color. */
export function ProjectForm({ mode, project, onSuccess, formId, onPendingChange, cancelHref }: ProjectFormProps) {
  const router = useRouter();
  const ids = useId();
  const nameId = `${ids}-name`;
  const descriptionId = `${ids}-description`;
  const iconLabelId = `${ids}-icon`;
  const colorLabelId = `${ids}-color`;
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

  // Report saving to a dialog footer (latest callback, without re-running on every render).
  const pendingCallback = useRef(onPendingChange);
  useEffect(() => {
    pendingCallback.current = onPendingChange;
  });
  useEffect(() => {
    pendingCallback.current?.(isSubmitting);
  }, [isSubmitting]);

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

    toast.success(mode === "edit" ? "Changes saved." : "Project created.");
    router.refresh();
    if (onSuccess) {
      onSuccess(result.data);
    } else {
      router.push(`/dashboard/projects/${result.data.id}`);
    }
  }

  return (
    <form id={formId} onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {formError ? <FormError message={formError} /> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor={nameId}>Name</Label>
        <Input
          id={nameId}
          autoFocus
          autoComplete="off"
          enterKeyHint="done"
          placeholder="e.g. Checkout app"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${nameId}-error` : undefined}
          {...register("name")}
        />
        {errors.name ? (
          <p id={`${nameId}-error`} role="alert" className="text-sm text-destructive">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor={descriptionId}>
          Description <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Textarea
          id={descriptionId}
          rows={3}
          placeholder="What is this project for?"
          aria-invalid={errors.description ? true : undefined}
          aria-describedby={errors.description ? `${descriptionId}-error` : undefined}
          {...register("description")}
        />
        {errors.description ? (
          <p id={`${descriptionId}-error`} role="alert" className="text-sm text-destructive">
            {errors.description.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <span id={iconLabelId} className="text-sm font-medium leading-none">
          Icon
        </span>
        <ProjectIconPicker
          aria-labelledby={iconLabelId}
          value={icon}
          onChange={(next) => setValue("icon", next, { shouldDirty: true })}
        />
      </div>

      <div className="flex flex-col gap-2">
        <span id={colorLabelId} className="text-sm font-medium leading-none">
          Color
        </span>
        <ProjectColorPicker
          aria-labelledby={colorLabelId}
          value={color}
          onChange={(next) => setValue("color", next, { shouldDirty: true })}
        />
      </div>

      {formId ? null : (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          {cancelHref ? (
            <Button asChild variant="outline">
              <Link href={cancelHref}>Cancel</Link>
            </Button>
          ) : null}
          <Button type="submit" loading={isSubmitting}>
            {mode === "edit" ? "Save changes" : "Create project"}
          </Button>
        </div>
      )}
    </form>
  );
}
