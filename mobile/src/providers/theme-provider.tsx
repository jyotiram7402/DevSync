import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useColorScheme } from "react-native";

import { useSettingsStore } from "~/stores/settings-store";
import { getTheme, type Theme } from "~/theme";

const ThemeContext = createContext<Theme>(getTheme("dark"));

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const preference = useSettingsStore((state) => state.settings.theme);

  const theme = useMemo(() => {
    const scheme = preference === "system" ? (system === "light" ? "light" : "dark") : preference;
    return getTheme(scheme);
  }, [preference, system]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
