"use client";

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

const emit = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

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

export function usePidHistory(pid: string | null) {
  return useSyncExternalStore<PidSample[]>(
    subscribe,
    () => getSnapshotForPid(pid),
    () => EMPTY_SNAPSHOT,
  );
}

export function getPidHistory(pid: string) {
  return historyByPid.get(pid)?.slice() ?? [];
}

export function clearPidHistory() {
  if (historyByPid.size === 0) {
    return;
  }
  historyByPid.clear();
  emit();
}

export function pausePidHistory() {
  if (!isRecording) return;
  isRecording = false;
}

export function resumePidHistory() {
  if (isRecording) return;
  isRecording = true;
}

export const isPidHistoryRecording = () => isRecording;
export const PID_HISTORY_WINDOW_SECONDS = DEFAULT_WINDOW_SECONDS;
