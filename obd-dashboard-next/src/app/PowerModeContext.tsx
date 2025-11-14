'use client';

import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

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

export const PowerModeProvider = ({ children }: PropsWithChildren) => {
  const [mode, setMode] = useState<PowerMode>("performance");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem(POWER_MODE_STORAGE_KEY);
    if (stored === "powersave" || stored === "performance") {
      setMode((current) => (current === stored ? current : stored));
    }
  }, []);

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

export const usePowerMode = () => useContext(PowerModeContext);
