import { useCallback, useEffect, useState } from "react";

import { sendMessage } from "@ext/messaging/bus";
import type { PopupState } from "@ext/messaging/types";

export interface SignInResult {
  ok: boolean;
  error?: string;
}

/**
 * Loads aggregate popup state from the background (auth, workspace, connection,
 * sync) and exposes the auth + sync actions. All flows go through the
 * background router so there is one authority.
 */
export function usePopupState() {
  const [state, setState] = useState<PopupState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    const result = await sendMessage({ type: "GET_STATE" });
    if (result.ok) {
      setState(result.data);
      setError(null);
    } else {
      setError(result.error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string): Promise<SignInResult> => {
    const result = await sendMessage({ type: "SIGN_IN", email, password });
    if (result.ok) {
      setState(result.data);
      return { ok: true };
    }
    return { ok: false, error: result.error };
  }, []);

  const signOut = useCallback(async () => {
    await sendMessage({ type: "SIGN_OUT" });
    await refresh();
  }, [refresh]);

  const sync = useCallback(async () => {
    const result = await sendMessage({ type: "TRIGGER_SYNC" });
    if (result.ok) setState((prev) => (prev ? { ...prev, sync: result.data } : prev));
  }, []);

  return { state, loading, error, refresh, signIn, signOut, sync };
}
