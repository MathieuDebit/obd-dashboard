'use client';

/**
 * @file Hosts the context that persists developer tooling preferences such as
 * toggling the performance overlay in the dashboard UI.
 */

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

/**
 * DevtoolsPreferencesProvider stores debug preferences in local storage and
 * surfaces them via context so instrumentation can be toggled globally.
 *
 * @param props.children - Components requiring access to devtools preferences.
 * @returns The provider-wrapped subtree.
 */
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

/**
 * useDevtoolsPreferences exposes the developer preference state and setter.
 *
 * @returns The context value governing devtools options.
 */
export const useDevtoolsPreferences = () =>
  useContext(DevtoolsPreferencesContext);
