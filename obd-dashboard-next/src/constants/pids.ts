/**
 * @file Lists canonical PID identifiers plus helper predicates for filtering
 * and normalizing values.
 */
export const CORE_PIDS = [
  "RPM",
  "SPEED",
  "THROTTLE_POS",
  "ENGINE_LOAD",
  "INTAKE_PRESSURE",
  "SHORT_FUEL_TRIM_1",
  "LONG_TERM_FUEL_TRIM_1",
  "O2_B1S1",
  "O2_B1S2",
  "TIMING_ADVANCE",
  "COOLANT_TEMP",
  "INTAKE_TEMP",
  "PIDS_A",
] as const;

export type CorePid = (typeof CORE_PIDS)[number];

const CORE_PID_SET: ReadonlySet<string> = new Set<string>(CORE_PIDS);

/**
 * Guards whether a PID string is one of the supported core identifiers.
 *
 * @param pid - PID string to evaluate.
 * @returns True when the PID belongs to CORE_PIDS.
 */
export const isCorePid = (pid: string | undefined | null): pid is CorePid => {
  if (!pid) return false;
  return CORE_PID_SET.has(pid.toUpperCase());
};

/**
 * Normalizes PID identifiers into uppercase keys used throughout the store.
 *
 * @param pid - PID string to normalize.
 * @returns Uppercase string safe for use as a map key.
 */
export const toPidKey = (pid: string | undefined | null): string =>
  (pid ?? "").toUpperCase();
