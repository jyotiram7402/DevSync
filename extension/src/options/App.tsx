import { useEffect, useState } from "react";

import { Section, Toggle } from "@ext/options/components/controls";
import { useSettings } from "@ext/hooks/use-settings";
import { useTheme } from "@ext/hooks/use-theme";
import { getActiveWorkspace } from "@ext/services/workspace-service";
import { dashboardUrl } from "@ext/shared/config";
import { EXTENSION_VERSION } from "@ext/shared/constants";
import type { Theme, WorkspaceInfo } from "@ext/types";
import { openTab } from "@ext/utils/browser";

const THEMES: ReadonlyArray<{ value: Theme; label: string }> = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

export function App() {
  const { settings, loaded, update } = useSettings();
  useTheme(settings.theme);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);

  useEffect(() => {
    void getActiveWorkspace().then(setWorkspace);
  }, []);

  if (!loaded) return null;

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5 p-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-lg font-semibold">
          Dev<span className="text-brand">Sync</span> settings
        </h1>
        <p className="text-xs text-muted-foreground">
          Preferences are stored locally in this browser.
        </p>
      </header>

      <Section title="Appearance" description="How the popup and this page look.">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="theme" className="text-sm">
            Theme
          </label>
          <select
            id="theme"
            value={settings.theme}
            onChange={(event) => void update({ theme: event.target.value as Theme })}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {THEMES.map((theme) => (
              <option key={theme.value} value={theme.value}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>
      </Section>

      <Section title="Workspace" description="Snippets sync within your active workspace.">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="workspace" className="text-sm">
            Active workspace
          </label>
          <select
            id="workspace"
            value={workspace?.id ?? ""}
            disabled
            className="h-9 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-70"
          >
            <option value="">{workspace ? workspace.name : "Sign in to load workspaces"}</option>
          </select>
          <p className="text-xs text-muted-foreground">
            Switching between multiple workspaces arrives with team workspaces.
          </p>
        </div>
      </Section>

      <Section title="Sync" description="How the extension keeps snippets in sync.">
        <Toggle
          id="autoSync"
          checked={settings.autoSync}
          onChange={(value) => void update({ autoSync: value })}
          label="Background sync"
          description="Periodically flush queued snippets while signed in."
        />
      </Section>

      <Section title="Clipboard">
        <Toggle
          id="captureClipboard"
          checked={settings.captureClipboard}
          onChange={(value) => void update({ captureClipboard: value })}
          label="Enable clipboard capture"
          description="Allow saving the current clipboard from the popup."
        />
      </Section>

      <Section title="Privacy" description="You are in control. Nothing here is enabled by default.">
        <Toggle
          id="notifications"
          checked={settings.showNotifications}
          onChange={(value) => void update({ showNotifications: value })}
          label="Sync notifications"
          description="Requires the optional notifications permission (requested when enabled)."
        />
        <Toggle
          id="telemetry"
          checked={settings.telemetry}
          onChange={(value) => void update({ telemetry: value })}
          label="Anonymous usage analytics"
          description="Scaffold only — no telemetry is collected yet."
        />
      </Section>

      <Section title="About">
        <dl className="flex flex-col gap-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Version</dt>
            <dd className="tabular-nums">{EXTENSION_VERSION}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={() => void openTab(dashboardUrl("/dashboard"))}
          className="self-start text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:underline"
        >
          Open DevSync dashboard
        </button>
      </Section>
    </div>
  );
}
