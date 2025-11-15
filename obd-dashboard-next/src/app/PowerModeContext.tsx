'use client';

/**
 * @file Declares the PowerMode React context that toggles the dashboard between
 * performance and power-save profiles and persists the choice in local storage.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { PropsWithChildren } from "react";

export type PowerMode = "performance" | "powersave";

type PowerModeContextValue = {
  mode: PowerMode;
  changeMode: (mode: PowerMode) => void;
};

const POWER_MODE_STORAGE_KEY = "obd-dashboard.powerMode";

const PowerModeContext = createContext<PowerModeContextValue>({
  mode: "performance",
  changeMode: () => {
    throw new Error("PowerModeContext must be used within PowerModeProvider");
  },
});

/**
 * Reads the power mode from local storage if available, defaulting to the
 * performance profile during SSR or when no preference exists.
 *
 * @returns The stored power mode value.
 */
const getStoredPowerMode = (): PowerMode => {
  if (typeof window === "undefined") return "performance";
  const stored = window.localStorage.getItem(POWER_MODE_STORAGE_KEY);
  return stored === "powersave" ? "powersave" : "performance";
};

/**
 * PowerModeProvider exposes the current power mode and a setter so consumers
 * can align their behavior (e.g. polling frequencies) to the selected profile.
 *
 * @param props.children - Components that should access power mode settings.
 * @returns The provider wrapping the supplied children.
 */
export const PowerModeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<PowerMode>(() => getStoredPowerMode());

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(POWER_MODE_STORAGE_KEY, mode);
  }, [mode]);

  const changeMode = useCallback((next: PowerMode) => {
    setMode(next);
  }, []);

  return (
    <PowerModeContext.Provider value={{ mode, changeMode }}>
      {children}
    </PowerModeContext.Provider>
  );
};

/**
 * Convenience hook that exposes the power mode context.
 *
 * @returns The power mode state and updater function.
 */
export const usePowerMode = () => useContext(PowerModeContext);
