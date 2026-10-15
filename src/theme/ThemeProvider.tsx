"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  applyTheme,
  persistAppearance,
  readAppearance,
  type Appearance,
} from "./applyTheme";

type ThemeContextValue = {
  appearance: Appearance;
  setAppearance: (next: Appearance) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearanceState] = useState<Appearance>(() =>
    typeof window === "undefined" ? "dark" : readAppearance(),
  );

  useEffect(() => {
    applyTheme(appearance);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readAppearance() === "system") {
        applyTheme("system");
      }
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [appearance]);

  const value = useMemo(
    () => ({
      appearance,
      setAppearance: (next: Appearance) => {
        persistAppearance(next);
        setAppearanceState(next);
      },
    }),
    [appearance],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }
  return ctx;
}
