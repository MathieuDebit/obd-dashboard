'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

type DevtoolsPreferencesContextValue = {
  showPerformanceOverlay: boolean;
  setShowPerformanceOverlay: (value: boolean) => void;
};

const STORAGE_KEY = "obd-dashboard.devtools.showPerformanceOverlay";

const DevtoolsPreferencesContext =
  createContext<DevtoolsPreferencesContextValue>({
    showPerformanceOverlay: false,
    setShowPerformanceOverlay: () => {
      throw new Error(
        "useDevtoolsPreferences must be used within DevtoolsPreferencesProvider",
      );
    },
  });

export const DevtoolsPreferencesProvider = ({
  children,
}: PropsWithChildren) => {
  const [showPerformanceOverlay, setShowPerformanceOverlay] = useState<boolean>(
    () => {
      if (typeof window === "undefined") return false;
      return window.localStorage.getItem(STORAGE_KEY) === "true";
    },
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, String(showPerformanceOverlay));
  }, [showPerformanceOverlay]);

  const changeOverlayVisibility = useCallback((value: boolean) => {
    setShowPerformanceOverlay(value);
  }, []);

  const value = useMemo(
    () => ({
      showPerformanceOverlay,
      setShowPerformanceOverlay: changeOverlayVisibility,
    }),
    [showPerformanceOverlay, changeOverlayVisibility],
  );

  return (
    <DevtoolsPreferencesContext.Provider value={value}>
      {children}
    </DevtoolsPreferencesContext.Provider>
  );
};

export const useDevtoolsPreferences = () =>
  useContext(DevtoolsPreferencesContext);
