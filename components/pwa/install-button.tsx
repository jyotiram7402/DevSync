"use client";

import { Download } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

/**
 * InstallAppButton — lets the user install DevSync as a standalone app.
 *
 * On Chrome / Edge / Android the browser fires a `beforeinstallprompt` event
 * which we capture and replay when the button is clicked. On iOS Safari there
 * is no such event, so we show the manual "Add to Home Screen" instructions.
 */
export function InstallAppButton() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    function handlePrompt(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event);
    }
    function handleInstalled() {
      setInstalled(true);
      setDeferredPrompt(null);
    }

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  if (installed) {
    return (
      <p className="text-sm text-muted-foreground">
        ✓ DevSync is already installed as an app on this device.
      </p>
    );
  }

  if (deferredPrompt) {
    return (
      <Button
        onClick={async () => {
          deferredPrompt.prompt();
          await deferredPrompt.userChoice;
          setDeferredPrompt(null);
        }}
      >
        <Download className="mr-2 size-4" aria-hidden="true" />
        Install DevSync app
      </Button>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      <strong>Android / Chrome / Edge:</strong> open the browser menu (⋮) and tap
      &ldquo;Install app&rdquo; / &ldquo;Add to Home screen&rdquo;.
      <br />
      <strong>iPhone (Safari):</strong> tap Share (□↑) → &ldquo;Add to Home
      Screen&rdquo;.
    </p>
  );
}
