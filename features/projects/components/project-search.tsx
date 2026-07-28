"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

/**
 * Debounced project search. Writes `?search=` (and resets `page`) to the URL,
 * so the server component re-queries. Uses replace to avoid history spam.
 */
export function ProjectSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get("search") ?? "");

  useEffect(() => {
    const timeout = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const trimmed = value.trim();
      if (trimmed) {
        params.set("search", trimmed);
      } else {
        params.delete("search");
      }
      params.delete("page");
      router.replace(`${pathname}?${params.toString()}`);
    }, 350);

    return () => clearTimeout(timeout);
    // Only re-run when the query text changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className="relative w-full sm:max-w-xs">
      <Search
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        aria-label="Search projects"
        placeholder="Search projects…"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="pl-9"
      />
    </div>
  );
}
