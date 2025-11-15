'use client';

import { createContext, useContext, useMemo } from "react";
import type { PropsWithChildren } from "react";

import { usePowerMode, type PowerMode } from "@/app/PowerModeContext";

type RefreshRateContextValue = {
  powerMode: PowerMode;
  intervalMs: number;
};

// The simulator pushes PID frames roughly every 120 ms, so mirror that cadence
// in performance mode. In power save mode we only sample every 600 ms to keep
// idle CPU usage well below the 30% target. Values are hard-coded per spec.
const PERFORMANCE_REFRESH_INTERVAL_MS = 120;
const POWERSAVE_REFRESH_INTERVAL_MS = 600;

const INTERVAL_BY_POWER_MODE: Record<PowerMode, number> = {
  performance: PERFORMANCE_REFRESH_INTERVAL_MS,
  powersave: POWERSAVE_REFRESH_INTERVAL_MS,
};

const RefreshRateContext = createContext<RefreshRateContextValue>({
  powerMode: "performance",
  intervalMs: PERFORMANCE_REFRESH_INTERVAL_MS,
});

export const RefreshRateProvider = ({ children }: PropsWithChildren) => {
  const { mode: powerMode } = usePowerMode();
  const intervalMs = INTERVAL_BY_POWER_MODE[powerMode];
  const value = useMemo(
    () => ({ intervalMs, powerMode }),
    [intervalMs, powerMode],
  );

  return (
    <RefreshRateContext.Provider value={value}>
      {children}
    </RefreshRateContext.Provider>
  );
};

export const useRefreshRate = () => useContext(RefreshRateContext);
export const refreshRateIntervals = {
  performance: PERFORMANCE_REFRESH_INTERVAL_MS,
  powersave: POWERSAVE_REFRESH_INTERVAL_MS,
};
