import type { Session, User } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

import { supabase } from "~/lib/supabase";
import { heartbeat, registerThisDevice } from "~/services/device-service";

/**
 * Auth state provider — restores the session on launch (auto-login), tracks
 * live auth changes, registers this device on sign-in, and sends periodic
 * heartbeats so device presence stays fresh. Session storage/refresh is handled
 * by supabase-js; this only mirrors state into React.
 */
interface AuthValue {
  session: Session | null;
  user: User | null;
  initializing: boolean;
}

const AuthContext = createContext<AuthValue>({ session: null, user: null, initializing: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setInitializing(false);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user.id;

  useEffect(() => {
    if (!userId) return;
    void registerThisDevice();
    const interval = setInterval(() => void heartbeat(), 120_000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, initializing }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthValue {
  return useContext(AuthContext);
}
