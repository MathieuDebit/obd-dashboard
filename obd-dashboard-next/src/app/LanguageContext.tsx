'use client';

/**
 * @file Implements the language selection context that synchronizes the chosen
 * locale across the dashboard, persists it, and updates the HTML lang attribute.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

import { DEFAULT_LOCALE, type Locale } from "@/utils/i18n";

export type LanguageContextValue = {
  locale: Locale;
  changeLocale: (locale: Locale) => void;
};

export const LANGUAGE_STORAGE_KEY = "obd-dashboard.locale";

const LanguageContext = createContext<LanguageContextValue>({
  locale: "en",
  changeLocale: () => {
    throw new Error("LanguageContext must be used within LanguageProvider");
  },
});

/**
 * Retrieves the persisted locale value, defaulting to English when running on
 * the server or when no preference is stored.
 *
 * @returns The locale code to initialize the context with.
 */
const getStoredLocale = (): Locale => {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return stored === "fr" ? "fr" : "en";
};

/**
 * LanguageProvider exposes the active locale and setter so pages and hooks can
 * render translated text consistently.
 *
 * @param props.children - Subtree that needs access to language controls.
 * @returns The provider composed around the supplied children.
 */
export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [locale, setLocale] = useState<Locale>(() => getStoredLocale());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, locale);
    window.document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const changeLocale = useCallback((next: Locale) => {
    setLocale(next);
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, changeLocale }}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * useLanguage is a convenience hook for accessing the language context.
 *
 * @returns The active locale plus the change handler.
 */
export const useLanguage = () => useContext(LanguageContext);
