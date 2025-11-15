"use client";

/**
 * @file Houses an external store that records PID samples for charting and
 * exposes hooks/utilities for consumers.
 */

import { useSyncExternalStore } from "react";

import type { OBDServerResponse } from "@/types/commands";

export type PidSample = { timestamp: number; value: number };

const DEFAULT_WINDOW_SECONDS = Number(
  process.env.NEXT_PUBLIC_PID_HISTORY_WINDOW_SECONDS ?? "60",
);
const HISTORY_WINDOW_MS = DEFAULT_WINDOW_SECONDS * 1000;
const DEFAULT_MAX_SAMPLES = Number(
  process.env.NEXT_PUBLIC_PID_HISTORY_MAX_SAMPLES ?? "240",
);

const historyByPid = new Map<string, PidSample[]>();
const listeners = new Set<() => void>();
let isRecording = true;

/**
 * Notifies every subscribed listener that the history map changed.
 */
const emit = () => {
  listeners.forEach((listener) => listener());
};

/**
 * Registers a listener to be invoked whenever samples change.
 *
 * @param listener - Callback invoked on store updates.
 * @returns Unsubscribe function.
 */
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

/**
 * Removes samples older than the cutoff or those exceeding the max sample
 * count.
 *
 * @param samples - Mutable array of PID samples.
 * @param cutoff - Minimum timestamp that should be retained.
 * @returns True if the samples array was modified.
 */
const pruneSamples = (samples: PidSample[], cutoff: number) => {
  let changed = false;

  while (samples.length > 0) {
    const first = samples[0];
    if (!first || first.timestamp >= cutoff) {
      break;
    }
    samples.shift();
    changed = true;
  }

  while (samples.length > DEFAULT_MAX_SAMPLES) {
    samples.shift();
    changed = true;
  }

  return changed;
};

/**
 * Records numeric samples from an OBD response when recording is enabled.
 *
 * @param response - Parsed server response containing PID values.
 */
export function recordPidSamples(response: OBDServerResponse) {
  if (!isRecording) {
    return;
  }

  const entries = Object.entries(response.pids ?? {});
  if (entries.length === 0) {
    return;
  }

  const cutoff = response.timestamp - HISTORY_WINDOW_MS;
  let updated = false;

  entries.forEach(([pid, rawValue]) => {
    const numericValue =
      typeof rawValue === "number"
        ? rawValue
        : typeof rawValue === "string"
          ? Number(rawValue)
          : Number(rawValue ?? 0);

    if (!Number.isFinite(numericValue)) {
      return;
    }

    const existing = historyByPid.get(pid) ?? [];
    const nextSamples = existing.length > 0 ? [...existing] : [];
    nextSamples.push({ timestamp: response.timestamp, value: numericValue });
    const changed = pruneSamples(nextSamples, cutoff);

    if (nextSamples.length === 0) {
      historyByPid.delete(pid);
    } else {
      historyByPid.set(pid, nextSamples);
    }

    updated = updated || changed || nextSamples.length > 0;
  });

  if (updated) {
    emit();
  }
}

const EMPTY_SNAPSHOT: PidSample[] = [];

const getSnapshotForPid = (pid: string | null) =>
  pid ? historyByPid.get(pid) ?? EMPTY_SNAPSHOT : EMPTY_SNAPSHOT;

/**
 * Subscribes React components to the history for a specific PID.
 *
 * @param pid - PID identifier to observe.
 * @returns Array of samples for the PID.
 */
export function usePidHistory(pid: string | null) {
  return useSyncExternalStore<PidSample[]>(
    subscribe,
    () => getSnapshotForPid(pid),
    () => EMPTY_SNAPSHOT,
  );
}

/**
 * Returns a shallow copy of the current PID history array.
 *
 * @param pid - PID identifier to fetch.
 * @returns Array of recorded samples, empty when absent.
 */
export function getPidHistory(pid: string) {
  return historyByPid.get(pid)?.slice() ?? [];
}

/**
 * Clears every stored PID history entry and notifies subscribers.
 */
export function clearPidHistory() {
  if (historyByPid.size === 0) {
    return;
  }
  historyByPid.clear();
  emit();
}

/**
 * Pauses history recording, typically when the websocket disconnects.
 */
export function pausePidHistory() {
  if (!isRecording) return;
  isRecording = false;
}

/**
 * Resumes recording after being paused.
 */
export function resumePidHistory() {
  if (isRecording) return;
  isRecording = true;
}

/**
 * Indicates whether the store is currently recording samples.
 *
 * @returns True while recording is enabled.
 */
export const isPidHistoryRecording = () => isRecording;
export const PID_HISTORY_WINDOW_SECONDS = DEFAULT_WINDOW_SECONDS;
