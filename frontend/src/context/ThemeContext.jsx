import { createContext, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "budgetflow.theme";
const MODES = ["system", "light", "dark"];
const DEFAULT_MODE = "dark";

const ThemeContext = createContext(null);

function getSystemPreference() {
  if (typeof window === "undefined" || !window.matchMedia) {
    return "dark";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function readStoredMode() {
  if (typeof window === "undefined") {
    return DEFAULT_MODE;
  }
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return MODES.includes(stored) ? stored : DEFAULT_MODE;
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(readStoredMode);
  const [systemPreference, setSystemPreference] = useState(getSystemPreference);

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined;
    }
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (event) => setSystemPreference(event.matches ? "dark" : "light");
    media.addEventListener("change", handler);
    return () => media.removeEventListener("change", handler);
  }, []);

  const resolvedTheme = mode === "system" ? systemPreference : mode;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      resolvedTheme,
      setMode,
      cycleMode() {
        const currentIndex = MODES.indexOf(mode);
        const nextIndex = (currentIndex + 1) % MODES.length;
        setMode(MODES[nextIndex]);
      },
    }),
    [mode, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider.");
  }
  return context;
}
