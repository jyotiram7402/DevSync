import { ClipboardPlus, ExternalLink, LogOut, RefreshCw, Settings } from "lucide-react";
import { useCallback } from "react";

import { useClipboardSave } from "@ext/hooks/use-clipboard-save";
import { usePopupState } from "@ext/hooks/use-popup-state";
import { useRecentSnippets } from "@ext/hooks/use-recent-snippets";
import { useSettings } from "@ext/hooks/use-settings";
import { useTheme } from "@ext/hooks/use-theme";
import { SignIn } from "@ext/popup/components/sign-in";
import { SnippetList } from "@ext/popup/components/snippet-list";
import { StatusBar } from "@ext/popup/components/status-bar";
import { Button, Feedback, Spinner } from "@ext/popup/components/ui";
import { getSnippetContent } from "@ext/services/snippet-service";
import { writeClipboard } from "@ext/services/clipboard";
import { dashboardUrl, isConfigured } from "@ext/shared/config";
import { DASHBOARD_PATHS } from "@ext/shared/constants";
import { browser, openTab } from "@ext/utils/browser";

export function App() {
  const { state, loading, signIn, signOut, sync } = usePopupState();
  const { settings } = useSettings();
  useTheme(settings.theme);

  const workspaceId = state?.session ? (state.workspace?.id ?? null) : null;
  const { snippets, loading: snippetsLoading, reload } = useRecentSnippets(workspaceId);
  const { save, saving, feedback } = useClipboardSave(reload);

  const copySnippet = useCallback(async (id: string): Promise<boolean> => {
    const content = await getSnippetContent(id);
    if (!content) return false;
    return writeClipboard(content);
  }, []);

  const openDashboard = useCallback(() => void openTab(dashboardUrl(DASHBOARD_PATHS.snippets)), []);
  const openOptions = useCallback(() => void browser.runtime.openOptionsPage(), []);
  const openWeb = useCallback(() => void openTab(dashboardUrl(DASHBOARD_PATHS.login)), []);

  return (
    <div className="popup-root flex flex-col">
      <header className="flex items-center justify-between border-b px-3 py-2">
        <span className="text-sm font-semibold">
          Dev<span className="text-brand">Sync</span>
        </span>
        <div className="flex items-center gap-0.5">
          <Button variant="ghost" onClick={openOptions} aria-label="Settings" className="px-2">
            <Settings className="size-4" aria-hidden="true" />
          </Button>
          <Button variant="ghost" onClick={openDashboard} aria-label="Open dashboard" className="px-2">
            <ExternalLink className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </header>

      {!isConfigured() ? (
        <div className="p-4 text-center text-sm text-muted-foreground">
          The extension is not configured. Set the Supabase URL and anon key at build time.
        </div>
      ) : loading ? (
        <Spinner label="Loading DevSync" />
      ) : !state?.session ? (
        <SignIn onSignIn={signIn} onOpenWeb={openWeb} />
      ) : (
        <main className="flex min-h-0 flex-1 flex-col">
          <StatusBar workspace={state.workspace} connection={state.connection} sync={state.sync} />

          <div className="flex items-center gap-2 p-2">
            <Button onClick={() => void save()} disabled={saving} className="flex-1">
              <ClipboardPlus className="size-4" aria-hidden="true" />
              {saving ? "Saving…" : "Save clipboard"}
            </Button>
            <Button variant="outline" onClick={() => void sync()} aria-label="Sync now">
              <RefreshCw className="size-4" aria-hidden="true" />
            </Button>
          </div>

          {feedback ? <Feedback type={feedback.type} text={feedback.text} /> : null}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <SnippetList snippets={snippets} loading={snippetsLoading} onCopy={copySnippet} />
          </div>

          <footer className="flex items-center justify-between border-t px-3 py-2">
            <Button variant="ghost" onClick={openDashboard} className="text-xs">
              Open dashboard
            </Button>
            <Button variant="destructive" onClick={() => void signOut()} className="text-xs">
              <LogOut className="size-3.5" aria-hidden="true" />
              Sign out
            </Button>
          </footer>
        </main>
      )}
    </div>
  );
}
