"use client";

import { Download, Share, X } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { promptInstall } from "@/lib/pwa/install-prompt";
import { detectPlatform, isStandalone, noSubscribe, type Platform } from "@/lib/pwa/platform";

const DISMISS_KEY = "copyanywhere:install-card-dismissed";

/**
 * A quiet, dismissible "Install CopyAnywhere" card for Home. It shows only
 * when installing is possible and not done yet: with Install where the
 * browser offers it (Chrome, Edge, Android), with the Share → Add to Home
 * Screen steps on iPhone and iPad. Dismissing it is remembered on this device.
 */
export function InstallCard() {
  const { canPrompt, installed } = useInstallPrompt();
  const platform = useSyncExternalStore<Platform | null>(noSubscribe, detectPlatform, () => null);
  const standalone = useSyncExternalStore(noSubscribe, isStandalone, () => false);
  // Hidden until the saved choice has been read, so it never flashes up.
  const [dismissed, setDismissed] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      setDismissed(window.localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // Private mode: it stays hidden for this visit.
    }
  }

  const eligible = !installed && !standalone && (canPrompt || platform === "ios");
  if (platform === null || dismissed || !eligible) return null;

  return (
    <section
      aria-labelledby="install-card-title"
      className="flex items-start gap-3 rounded-lg border border-border bg-card p-4"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-wash text-primary-ink">
        <Download className="size-5" aria-hidden="true" />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h2 id="install-card-title" className="text-sm font-semibold">
          Install CopyAnywhere
        </h2>
        {canPrompt ? (
          <>
            <p className="text-sm text-muted-foreground">Open it from your home screen, full screen, like any app.</p>
            <Button
              type="button"
              size="sm"
              loading={busy}
              onClick={async () => {
                setBusy(true);
                await promptInstall();
                setBusy(false);
              }}
              className="mt-2 w-fit"
            >
              Install
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            Tap Share <Share className="inline size-4 align-text-bottom text-foreground" aria-hidden="true" />, then
            &ldquo;Add to Home Screen&rdquo;.
          </p>
        )}
      </div>
      <IconButton label="Dismiss" icon={X} size="sm" onClick={dismiss} className="-mr-2 -mt-2 shrink-0" />
    </section>
  );
}
