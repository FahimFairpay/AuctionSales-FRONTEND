export type Appearance = "light" | "dark" | "system";

export const APPEARANCE_KEY = "fps-appearance";

export function readAppearance(): Appearance {
  if (typeof window === "undefined") return "dark";
  const userSelected = localStorage.getItem("fps-theme-selected") === "true";
  if (!userSelected && (window.location.pathname === "/" || window.location.pathname === "")) {
    return "dark";
  }
  const raw = localStorage.getItem(APPEARANCE_KEY);
  if (raw === "light" || raw === "dark" || raw === "system") {
    return raw;
  }
  return "dark";
}

export function resolvedTheme(appearance: Appearance): "light" | "dark" {
  if (appearance === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return appearance;
}

export function applyTheme(appearance: Appearance): void {
  const theme = resolvedTheme(appearance);
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

export function persistAppearance(appearance: Appearance): void {
  localStorage.setItem(APPEARANCE_KEY, appearance);
  applyTheme(appearance);
}
