"use client";

import { CircleCheck, Download, Share } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";
import { useInstallPrompt } from "@/hooks/use-install-prompt";
import { promptInstall } from "@/lib/pwa/install-prompt";

/**
 * InstallAppButton — install CopyAnywhere as an app, the right way for this
 * device: a real Install button where the browser offers one (Chrome, Edge,
 * Android), the Share → Add to Home Screen steps on iPhone and iPad, and the
 * menu or address-bar steps elsewhere. Already installed? It says so.
 * Platform checks run in the browser only (no hydration mismatch).
 */
type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  const ua = navigator.userAgent;
  // iPadOS reports itself as a Mac; touch support gives it away.
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "desktop";
}

function isStandalone(): boolean {
  const iosStandalone = (navigator as Navigator & { standalone?: boolean }).standalone === true;
  return iosStandalone || window.matchMedia("(display-mode: standalone)").matches;
}

const noSubscribe = () => () => {};

export function InstallAppButton() {
  const { canPrompt, installed } = useInstallPrompt();
  const platform = useSyncExternalStore<Platform | null>(noSubscribe, detectPlatform, () => null);
  const standalone = useSyncExternalStore(noSubscribe, isStandalone, () => false);
  const [busy, setBusy] = useState(false);

  // Server render and hydration: nothing platform-specific yet.
  if (platform === null) return null;

  if (installed || standalone) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <CircleCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
        Installed on this device. Open it from your home screen or dock.
      </p>
    );
  }

  if (canPrompt) {
    return (
      <Button
        type="button"
        loading={busy}
        onClick={async () => {
          setBusy(true);
          await promptInstall();
          setBusy(false);
        }}
        className="w-fit"
      >
        {busy ? null : <Download aria-hidden="true" />}
        Install CopyAnywhere
      </Button>
    );
  }

  if (platform === "ios") {
    return (
      <ol className="flex list-decimal flex-col gap-1 pl-5 text-sm text-muted-foreground marker:text-muted-foreground">
        <li>
          Tap Share <Share className="inline size-4 align-text-bottom text-foreground" aria-hidden="true" /> in
          the browser toolbar.
        </li>
        <li>Choose &ldquo;Add to Home Screen&rdquo;, then tap Add.</li>
      </ol>
    );
  }

  if (platform === "android") {
    return (
      <p className="text-sm text-muted-foreground">
        Open your browser&apos;s menu (⋮) and tap &ldquo;Install app&rdquo; or &ldquo;Add to Home screen&rdquo;.
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      In Chrome or Edge, click the install icon at the right end of the address bar. In Safari on a Mac, choose
      File → Add to Dock.
    </p>
  );
}
