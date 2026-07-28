"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { FormError } from "@/components/auth/form-error";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { createSnippetAction, updateSnippetAction } from "@/features/snippets/actions";
import { CollectionSelector } from "@/features/snippets/components/collection-selector";
import { LanguageSelector } from "@/features/snippets/components/language-selector";
import { ProjectSelector } from "@/features/snippets/components/project-selector";
import { SnippetTags } from "@/features/snippets/components/snippet-tags";
import { DEFAULT_SNIPPET_VISIBILITY, SNIPPET_VISIBILITY_OPTIONS } from "@/features/snippets/constants";
import { DEFAULT_LANGUAGE } from "@/features/snippets/languages";
import { snippetFormSchema, type SnippetFormValues } from "@/features/snippets/schemas";
import type { SelectOption, Snippet } from "@/features/snippets/types";

const SnippetEditor = dynamic(
  () => import("@/features/snippets/components/snippet-editor").then((mod) => mod.SnippetEditor),
  { ssr: false, loading: () => <Skeleton className="h-[360px] w-full" /> },
);

interface SnippetFormProps {
  mode: "create" | "edit";
  snippet?: Snippet;
  projectOptions: SelectOption[];
  collectionOptions: SelectOption[];
  onSuccess?: (snippet: Snippet) => void;
}

export function SnippetForm({
  mode,
  snippet,
  projectOptions,
  collectionOptions,
  onSuccess,
}: SnippetFormProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SnippetFormValues>({
    resolver: zodResolver(snippetFormSchema),
    defaultValues: {
      title: snippet?.title ?? "",
      content: snippet?.content ?? "",
      language: snippet?.language ?? DEFAULT_LANGUAGE,
      projectId: snippet?.projectId ?? "",
      visibility: snippet?.visibility ?? DEFAULT_SNIPPET_VISIBILITY,
      tags: snippet?.tags ?? [],
      collectionIds: snippet?.collectionIds ?? [],
    },
  });

  const content = watch("content");
  const language = watch("language") ?? DEFAULT_LANGUAGE;
  const projectId = watch("projectId") ?? "";
  const visibility = watch("visibility") ?? DEFAULT_SNIPPET_VISIBILITY;
  const tags = watch("tags") ?? [];
  const collectionIds = watch("collectionIds") ?? [];

  async function onSubmit(values: SnippetFormValues) {
    setFormError(null);
    const result =
      mode === "edit" && snippet
        ? await updateSnippetAction(snippet.id, values)
        : await createSnippetAction(values);

    if (!result.ok) {
      if (result.error.fieldErrors) {
        for (const [field, messages] of Object.entries(result.error.fieldErrors)) {
          if (messages[0]) setError(field as keyof SnippetFormValues, { message: messages[0] });
        }
      } else {
        setFormError(result.error.message);
      }
      return;
    }

    toast.success(mode === "edit" ? "Snippet saved" : "Snippet created");
    router.refresh();
    if (onSuccess) {
      onSuccess(result.data);
    } else {
      router.push(`/dashboard/snippets/${result.data.id}`);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {formError ? <FormError message={formError} /> : null}

      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Optional title"
          aria-invalid={errors.title ? true : undefined}
          {...register("title")}
        />
        {errors.title ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.title.message}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <Label htmlFor="language">Content</Label>
          <div className="w-44">
            <LanguageSelector
              id="language"
              value={language}
              onChange={(next) => setValue("language", next, { shouldDirty: true })}
            />
          </div>
        </div>
        <SnippetEditor
          value={content}
          language={language}
          onChange={(next) => setValue("content", next, { shouldDirty: true, shouldValidate: true })}
        />
        {errors.content ? (
          <p role="alert" className="text-sm text-destructive">
            {errors.content.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="project">Project</Label>
          <ProjectSelector
            id="project"
            value={projectId}
            options={projectOptions}
            onChange={(next) => setValue("projectId", next, { shouldDirty: true })}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="visibility">Visibility</Label>
          <select
            id="visibility"
            aria-label="Visibility"
            value={visibility}
            onChange={(event) =>
              setValue("visibility", event.target.value as SnippetFormValues["visibility"], {
                shouldDirty: true,
              })
            }
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {SNIPPET_VISIBILITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Tags</Label>
        <SnippetTags value={tags} onChange={(next) => setValue("tags", next, { shouldDirty: true })} />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Collections</Label>
        <CollectionSelector
          value={collectionIds}
          options={collectionOptions}
          onChange={(next) => setValue("collectionIds", next, { shouldDirty: true })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
          {isSubmitting ? "Saving…" : mode === "edit" ? "Save changes" : "Create snippet"}
        </Button>
      </div>
    </form>
  );
}
