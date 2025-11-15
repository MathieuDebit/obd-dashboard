'use client';

/**
 * @file Declares the theme context responsible for synchronizing the light or
 * dark preference across the UI and persisting it in local storage.
 */

import {
  createContext,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

export type Theme = "light" | "dark";

export type ThemeContextValue = {
  theme: Theme;
  changeTheme: (theme: Theme) => void;
};

export const THEME_STORAGE_KEY = "obd-dashboard.theme";

export const ThemeContext = createContext<ThemeContextValue>({
  theme: "light",
  changeTheme: () => {
    throw new Error("ThemeContext must be used within ThemeProvider");
  },
});

/**
 * Determines which theme should be used when initializing the context, falling
 * back to light mode during SSR or when no preference exists.
 *
 * @returns The theme string used to seed state.
 */
const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return storedTheme === "dark" ? "dark" : "light";
};

/**
 * ThemeProvider manages the theme state, mirrors it into DOM classes, and
 * exposes a setter to consumers.
 *
 * @param props.children - Components that rely on theme information.
 * @returns The provider wrapping the children.
 */
export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);

    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
