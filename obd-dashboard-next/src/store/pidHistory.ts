"use client"

import { useSyncExternalStore } from "react"
import { OBDServerResponse } from "@/types/commands"

export type PidSample = { timestamp: number; value: number }

const DEFAULT_WINDOW_SECONDS = Number(
  process.env.NEXT_PUBLIC_PID_HISTORY_WINDOW_SECONDS ?? "60"
)
const HISTORY_WINDOW_MS = DEFAULT_WINDOW_SECONDS * 1000

const historyByPid = new Map<string, PidSample[]>()
const listeners = new Set<() => void>()

const emit = () => {
  listeners.forEach((listener) => listener())
}

const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const pruneHistory = (cutoff: number) => {
  let changed = false
  historyByPid.forEach((samples, pid) => {
    const pruned = samples.filter((sample) => sample.timestamp >= cutoff)
    if (pruned.length === samples.length) {
      return
    }

    if (pruned.length > 0) {
      historyByPid.set(pid, pruned)
    } else {
      historyByPid.delete(pid)
    }
    changed = true
  })
  return changed
}

export function recordPidSamples(response: OBDServerResponse) {
  const entries = Object.entries(response.pids ?? {})
  if (entries.length === 0) {
    return
  }

  const cutoff = response.timestamp - HISTORY_WINDOW_MS
  let updated = false

  entries.forEach(([pid, rawValue]) => {
    const numericValue =
      typeof rawValue === "number"
        ? rawValue
        : typeof rawValue === "string"
        ? Number(rawValue)
        : Number(rawValue ?? 0)

    if (Number.isNaN(numericValue)) {
      return
    }

    const samples = historyByPid.get(pid) ?? []
    const updatedSamples = [
      ...samples,
      { timestamp: response.timestamp, value: numericValue },
    ].filter((sample) => sample.timestamp >= cutoff)

    historyByPid.set(pid, updatedSamples)
    updated = true
  })

  const pruned = pruneHistory(cutoff)

  if (updated || pruned) {
    emit()
  }
}

const EMPTY_SNAPSHOT: PidSample[] = []

const getSnapshotForPid = (pid: string | null) =>
  pid ? historyByPid.get(pid) ?? EMPTY_SNAPSHOT : EMPTY_SNAPSHOT

export function usePidHistory(pid: string | null) {
  return useSyncExternalStore<PidSample[]>(
    subscribe,
    () => getSnapshotForPid(pid),
    () => EMPTY_SNAPSHOT
  )
}

export function getPidHistory(pid: string) {
  return historyByPid.get(pid)?.slice() ?? []
}

export function clearPidHistory() {
  if (historyByPid.size === 0) {
    return
  }
  historyByPid.clear()
  emit()
}

export const PID_HISTORY_WINDOW_SECONDS = DEFAULT_WINDOW_SECONDS
