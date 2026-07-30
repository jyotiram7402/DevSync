"use client";

import { useEffect } from "react";

/**
 * Registers the service worker (public/sw.js), which is what makes DevSync
 * installable as an app on Android and enables the offline fallback.
 * Registration is deferred to the `load` event so it never competes with the
 * first paint. Failures are non-fatal — the app works fine without it.
 * Renders nothing.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const register = () => {
      void navigator.serviceWorker.register("/sw.js").catch(() => {
        // Ignore: unsupported browser, insecure origin, or blocked by policy.
      });
    };

    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
