"use client";

import { X } from "lucide-react";
import { useState } from "react";

import { MAX_TAGS } from "@/features/snippets/constants";

/** Tag input: add on Enter/comma, remove via chip button or Backspace. */
export function SnippetTags({
  value,
  onChange,
  max = MAX_TAGS,
}: {
  value: string[];
  onChange: (tags: string[]) => void;
  max?: number;
}) {
  const [input, setInput] = useState("");

  function add(raw: string) {
    const tag = raw.trim().toLowerCase();
    if (!tag || value.includes(tag) || value.length >= max) {
      setInput("");
      return;
    }
    onChange([...value, tag]);
    setInput("");
  }

  function remove(tag: string) {
    onChange(value.filter((current) => current !== tag));
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      add(input);
    } else if (event.key === "Backspace" && input === "" && value.length > 0) {
      const last = value[value.length - 1];
      if (last) remove(last);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 rounded-md border px-2 py-1.5 focus-within:ring-1 focus-within:ring-ring">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded bg-secondary px-2 py-0.5 text-xs"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove tag ${tag}`}
            onClick={() => remove(tag)}
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        value={input}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => add(input)}
        placeholder={value.length > 0 ? "" : "Add tags…"}
        aria-label="Add tag"
        className="min-w-[6rem] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
