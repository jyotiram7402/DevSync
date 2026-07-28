"use client";

import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SNIPPET_LANGUAGES } from "@/features/snippets/languages";
import type { SelectOption, SnippetVisibility } from "@/features/snippets/types";
import type { SearchFilters as SearchFiltersModel } from "@/features/search/types";
import { cn } from "@/utils/cn";

/**
 * SearchFilters — the individual filter controls. Emits a fully-formed filters
 * object on every change (only defined keys are present, exact-optional safe).
 * Project/collection selects appear only when options are supplied.
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

const selectClass =
  "h-9 w-full rounded-md border border-input bg-background px-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

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
    <div className={cn("grid gap-4 sm:grid-cols-2", className)}>
      {projectOptions && projectOptions.length > 0 ? (
        <Field label="Project">
          <select
            className={selectClass}
            value={filters.projectId ?? ""}
            onChange={(e) => onChange(withFilter(filters, "projectId", e.target.value || undefined))}
          >
            <option value="">Any project</option>
            {projectOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {collectionOptions && collectionOptions.length > 0 ? (
        <Field label="Collection">
          <select
            className={selectClass}
            value={filters.collectionId ?? ""}
            onChange={(e) =>
              onChange(withFilter(filters, "collectionId", e.target.value || undefined))
            }
          >
            <option value="">Any collection</option>
            {collectionOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      <Field label="Language">
        <select
          className={selectClass}
          value={filters.language ?? ""}
          onChange={(e) => onChange(withFilter(filters, "language", e.target.value || undefined))}
        >
          <option value="">Any language</option>
          {SNIPPET_LANGUAGES.map((language) => (
            <option key={language.id} value={language.id}>
              {language.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Tag">
        <Input
          value={filters.tag ?? ""}
          placeholder="Any tag"
          onChange={(e) => onChange(withFilter(filters, "tag", e.target.value.trim() || undefined))}
        />
      </Field>

      <Field label="Visibility">
        <select
          className={selectClass}
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
        </select>
      </Field>

      <Field label="Favorite">
        <select
          className={selectClass}
          value={triValue(filters.favorite)}
          onChange={(e) => onChange(withFilter(filters, "favorite", parseTri(e.target.value)))}
        >
          <option value="">Any</option>
          <option value="true">Favorites only</option>
          <option value="false">Non-favorites</option>
        </select>
      </Field>

      <Field label="Pinned">
        <select
          className={selectClass}
          value={triValue(filters.pinned)}
          onChange={(e) => onChange(withFilter(filters, "pinned", parseTri(e.target.value)))}
        >
          <option value="">Any</option>
          <option value="true">Pinned only</option>
          <option value="false">Unpinned</option>
        </select>
      </Field>

      <Field label="Archived">
        <select
          className={selectClass}
          value={triValue(filters.archived)}
          onChange={(e) => onChange(withFilter(filters, "archived", parseTri(e.target.value)))}
        >
          <option value="">Active only</option>
          <option value="true">Archived only</option>
        </select>
      </Field>

      <Field label="Created after">
        <Input
          type="date"
          value={filters.createdAfter ?? ""}
          onChange={(e) => onChange(withFilter(filters, "createdAfter", e.target.value || undefined))}
        />
      </Field>

      <Field label="Created before">
        <Input
          type="date"
          value={filters.createdBefore ?? ""}
          onChange={(e) =>
            onChange(withFilter(filters, "createdBefore", e.target.value || undefined))
          }
        />
      </Field>

      <Field label="Updated after">
        <Input
          type="date"
          value={filters.updatedAfter ?? ""}
          onChange={(e) => onChange(withFilter(filters, "updatedAfter", e.target.value || undefined))}
        />
      </Field>

      <Field label="Updated before">
        <Input
          type="date"
          value={filters.updatedBefore ?? ""}
          onChange={(e) =>
            onChange(withFilter(filters, "updatedBefore", e.target.value || undefined))
          }
        />
      </Field>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
