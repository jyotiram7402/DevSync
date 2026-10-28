"use client";

import { useEffect, useId, useState, type ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SNIPPET_LANGUAGES } from "@/features/snippets/languages";
import type { SelectOption, SnippetVisibility } from "@/features/snippets/types";
import type { SearchFilters as SearchFiltersModel } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * SearchFilters — the individual filter controls, each with its own label.
 * Emits a fully-formed filters object on every change (only defined keys are
 * present). Project/collection selects appear only when options are supplied.
 */
type FilterKey = keyof SearchFiltersModel;

function withFilter<K extends FilterKey>(
  filters: SearchFiltersModel,
  key: K,
  value: SearchFiltersModel[K] | undefined,
): SearchFiltersModel {
  const next: SearchFiltersModel = { ...filters };
  if (value === undefined) delete next[key];
  else next[key] = value;
  return next;
}

function triValue(value: boolean | undefined): string {
  return value === undefined ? "" : value ? "true" : "false";
}
function parseTri(raw: string): boolean | undefined {
  return raw === "" ? undefined : raw === "true";
}

export function SearchFilters({
  filters,
  onChange,
  projectOptions,
  collectionOptions,
  className,
}: {
  filters: SearchFiltersModel;
  onChange: (filters: SearchFiltersModel) => void;
  projectOptions?: SelectOption[];
  collectionOptions?: SelectOption[];
  className?: string;
}) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {projectOptions && projectOptions.length > 0 ? (
        <Field label="Project">
          {(id) => (
            <Select
              id={id}
              value={filters.projectId ?? ""}
              onChange={(e) => onChange(withFilter(filters, "projectId", e.target.value || undefined))}
            >
              <option value="">Any project</option>
              {projectOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : null}

      {collectionOptions && collectionOptions.length > 0 ? (
        <Field label="Collection">
          {(id) => (
            <Select
              id={id}
              value={filters.collectionId ?? ""}
              onChange={(e) => onChange(withFilter(filters, "collectionId", e.target.value || undefined))}
            >
              <option value="">Any collection</option>
              {collectionOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          )}
        </Field>
      ) : null}

      <Field label="Language">
        {(id) => (
          <Select
            id={id}
            value={filters.language ?? ""}
            onChange={(e) => onChange(withFilter(filters, "language", e.target.value || undefined))}
          >
            <option value="">Any language</option>
            {SNIPPET_LANGUAGES.map((language) => (
              <option key={language.id} value={language.id}>
                {language.label}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label="Tag">
        {(id) => (
          <TagInput id={id} value={filters.tag} onCommit={(tag) => onChange(withFilter(filters, "tag", tag))} />
        )}
      </Field>

      <Field label="Visibility">
        {(id) => (
          <Select
            id={id}
            value={filters.visibility ?? ""}
            onChange={(e) =>
              onChange(
                withFilter(
                  filters,
                  "visibility",
                  e.target.value ? (e.target.value as SnippetVisibility) : undefined,
                ),
              )
            }
          >
            <option value="">Any</option>
            <option value="private">Private</option>
            <option value="workspace">Workspace</option>
            <option value="public">Public</option>
          </Select>
        )}
      </Field>

      <Field label="Favorite">
        {(id) => (
          <Select
            id={id}
            value={triValue(filters.favorite)}
            onChange={(e) => onChange(withFilter(filters, "favorite", parseTri(e.target.value)))}
          >
            <option value="">Any</option>
            <option value="true">Favorites only</option>
            <option value="false">Not favorites</option>
          </Select>
        )}
      </Field>

      <Field label="Pinned">
        {(id) => (
          <Select
            id={id}
            value={triValue(filters.pinned)}
            onChange={(e) => onChange(withFilter(filters, "pinned", parseTri(e.target.value)))}
          >
            <option value="">Any</option>
            <option value="true">Pinned only</option>
            <option value="false">Not pinned</option>
          </Select>
        )}
      </Field>

      <Field label="Archived">
        {(id) => (
          <Select
            id={id}
            value={triValue(filters.archived)}
            onChange={(e) => onChange(withFilter(filters, "archived", parseTri(e.target.value)))}
          >
            <option value="">Active only</option>
            <option value="true">Archived only</option>
          </Select>
        )}
      </Field>

      <Field label="Created after">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={filters.createdAfter ?? ""}
            onChange={(e) => onChange(withFilter(filters, "createdAfter", e.target.value || undefined))}
          />
        )}
      </Field>

      <Field label="Created before">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={filters.createdBefore ?? ""}
            onChange={(e) => onChange(withFilter(filters, "createdBefore", e.target.value || undefined))}
          />
        )}
      </Field>

      <Field label="Updated after">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={filters.updatedAfter ?? ""}
            onChange={(e) => onChange(withFilter(filters, "updatedAfter", e.target.value || undefined))}
          />
        )}
      </Field>

      <Field label="Updated before">
        {(id) => (
          <Input
            id={id}
            type="date"
            value={filters.updatedBefore ?? ""}
            onChange={(e) => onChange(withFilter(filters, "updatedBefore", e.target.value || undefined))}
          />
        )}
      </Field>
    </div>
  );
}

/**
 * The tag box keeps exactly what's typed (spaces included) and filters by the
 * trimmed tag; it follows outside changes such as Clear.
 */
function TagInput({
  id,
  value,
  onCommit,
}: {
  id: string;
  value: string | undefined;
  onCommit: (tag: string | undefined) => void;
}) {
  const [draft, setDraft] = useState(value ?? "");

  useEffect(() => {
    setDraft((current) => (current.trim() === (value ?? "") ? current : (value ?? "")));
  }, [value]);

  return (
    <Input
      id={id}
      value={draft}
      placeholder="Any tag"
      autoCapitalize="none"
      autoCorrect="off"
      spellCheck={false}
      onChange={(e) => {
        setDraft(e.target.value);
        onCommit(e.target.value.trim() || undefined);
      }}
    />
  );
}

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      {children(id)}
    </div>
  );
}
