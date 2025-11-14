'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
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

export const LanguageProvider = ({ children }: PropsWithChildren) => {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const storedLocale: Locale = stored === "fr" ? "fr" : "en";
    if (storedLocale !== locale) {
      setLocale(storedLocale);
    }
  }, []);

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

export const useLanguage = () => useContext(LanguageContext);
