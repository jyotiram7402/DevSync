"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { createRealtimePlatform, RealtimePlatform } from "@/lib/realtime/platform";
import type { ConnectionStatus } from "@/lib/realtime/types";
import { SupabaseContext } from "@/providers/supabase-provider";

/**
 * Provides one RealtimePlatform per browser client to the client tree, mirrors
 * its aggregate connection status and online/offline state into React, keeps
 * the realtime auth token current, and tears the platform down on unmount.
 *
 * When Supabase is not configured, `platform` is null and the app still renders
 * (status stays "idle").
 */
export interface RealtimeContextValue {
  platform: RealtimePlatform | null;
  status: ConnectionStatus;
  isOnline: boolean;
}

export const RealtimeContext = createContext<RealtimeContextValue | undefined>(undefined);

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const supabase = useContext(SupabaseContext);
  const platformRef = useRef<RealtimePlatform | null>(null);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [isOnline, setIsOnline] = useState(true);

  // Lazily create the platform once (the Supabase client instance is stable).
  if (supabase && platformRef.current === null) {
    platformRef.current = createRealtimePlatform(supabase);
  }

  // Start the platform and mirror its connection state into React.
  useEffect(() => {
    const platform = platformRef.current;
    if (!platform) return;

    platform.start();
    setStatus(platform.connection.getStatus());
    setIsOnline(platform.connection.isOnline());

    const offStatus = platform.connection.onStatusChange(setStatus);
    const offOnline = platform.connection.onOnlineChange(setIsOnline);

    return () => {
      offStatus();
      offOnline();
      platform.stop();
    };
  }, []);

  // Keep the realtime socket's auth token current (for RLS-protected channels).
  useEffect(() => {
    if (!supabase) return;
    let active = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        platformRef.current?.setAuth(data.session?.access_token ?? null);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      platformRef.current?.setAuth(session?.access_token ?? null);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  const value = useMemo<RealtimeContextValue>(
    () => ({ platform: platformRef.current, status, isOnline }),
    [status, isOnline],
  );

  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}
