"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Input } from "@/components/ui/input";

const DEBOUNCE_MS = 350;

/**
 * Debounced project search. Writes `?search=` (and goes back to page 1) once
 * typing pauses. It only writes when the text differs from the URL, so opening
 * page 2 never resets the page, and Back/Forward put their own search back in
 * the box.
 */
export function ProjectSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlValue = searchParams.get("search") ?? "";
  const [value, setValue] = useState(urlValue);
  /** The search this box last wrote to the URL, so its own update isn't mistaken for Back/Forward. */
  const written = useRef<string | null>(null);

  // The URL changed: if it wasn't this box, show what the URL says.
  useEffect(() => {
    if (written.current !== null && written.current === urlValue) {
      written.current = null;
      return;
    }
    setValue(urlValue);
  }, [urlValue]);

  useEffect(() => {
    const next = value.trim();
    if (next === urlValue) return;
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (next) params.set("search", next);
      else params.delete("search");
      params.delete("page");
      written.current = next;
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timeout);
  }, [value, urlValue, searchParams, pathname, router]);

  return (
    <div className="relative w-full min-w-0 sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label="Search projects"
        placeholder="Search projects…"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        enterKeyHint="search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
