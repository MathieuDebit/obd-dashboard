'use client';

/**
 * @file Provides the refresh-rate context that maps the selected power mode to
 * the polling interval used by OBD data hooks throughout the dashboard.
 */

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

/**
 * RefreshRateProvider derives the appropriate polling cadence from the current
 * power mode and exposes it to descendants via context.
 *
 * @param props.children - Elements that need access to the refresh interval.
 * @returns The provider-wrapped subtree that shares refresh settings.
 */
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

/**
 * useRefreshRate exposes the current refresh interval and power mode so hooks
 * can align network or sensor polling frequency accordingly.
 *
 * @returns The refresh rate context value containing interval and power mode.
 */
export const useRefreshRate = () => useContext(RefreshRateContext);

/**
 * refreshRateIntervals lists the hard-coded polling cadences associated with
 * each power mode for consumers that need static values (e.g. tests).
 */
export const refreshRateIntervals = {
  performance: PERFORMANCE_REFRESH_INTERVAL_MS,
  powersave: POWERSAVE_REFRESH_INTERVAL_MS,
};
