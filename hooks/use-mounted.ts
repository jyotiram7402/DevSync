"use client";

import { useEffect, useState } from "react";

/**
 * Returns `false` on the server and the initial client render, then `true`
 * after mount. Used to guard client-only, environment-dependent UI (e.g. the
 * resolved theme) so the first client render matches the server and avoids
 * hydration mismatches.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
