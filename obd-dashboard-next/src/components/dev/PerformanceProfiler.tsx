'use client';

/**
 * @file Implements developer-only instrumentation for profiling React commit
 * times and rendering a lightweight performance overlay.
 */

import {
  Profiler,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { PropsWithChildren ,
  ProfilerOnRenderCallback} from "react";

import { useDevtoolsPreferences } from "@/app/DevtoolsPreferencesContext";

type CommitStats = {
  average: number;
  max: number;
};

const SAMPLE_WINDOW = 24;
const FRAME_BUDGET_MS = 16.67;
const isDev = process.env.NODE_ENV !== "production";

/**
 * Tracks whether the component tree has mounted on the client, guarding
 * browser-only APIs.
 *
 * @returns True once the component has run on the client.
 */
const useIsClient = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient;
};

/**
 * Measures approximate frames per second using requestAnimationFrame loops.
 *
 * @returns The current FPS sample averaged over one second windows.
 */
const useFpsMeter = () => {
  const [fps, setFps] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let frame = 0;
    let lastTime = performance.now();
    let frames = 0;

    const loop = (timestamp: number) => {
      frames += 1;
      const delta = timestamp - lastTime;
      if (delta >= 1_000) {
        setFps((frames * 1_000) / delta);
        frames = 0;
        lastTime = timestamp;
      }
      frame = window.requestAnimationFrame(loop);
    };

    frame = window.requestAnimationFrame(loop);

    return () => window.cancelAnimationFrame(frame);
  }, []);

  return fps;
};

/**
 * Collects React Profiler commit durations and exposes stats plus an onRender
 * handler suitable for the Profiler component.
 *
 * @returns The latest commit stats along with the Profiler callback.
 */
const useCommitStats = () => {
  const [stats, setStats] = useState<CommitStats>({ average: 0, max: 0 });
  const bufferRef = useRef<number[]>([]);
  const latestStatsRef = useRef<CommitStats>(stats);

  useEffect(() => {
    latestStatsRef.current = stats;
  }, [stats]);

  const onRender = useCallback<ProfilerOnRenderCallback>(
    (_id, _phase, actualDuration) => {
      bufferRef.current.push(actualDuration);
      if (bufferRef.current.length < SAMPLE_WINDOW) {
        return;
      }
      const samples = bufferRef.current;
      bufferRef.current = [];
      const total = samples.reduce((sum, sample) => sum + sample, 0);
      const average = total / samples.length;
      const max = Math.max(...samples);
      setStats({ average, max });
    },
    [],
  );

  return { stats, onRender };
};

/**
 * PerformanceOverlay displays FPS, commit timings, and estimated CPU load in a
 * small floating panel.
 *
 * @param props.fps - Most recent frames-per-second sample.
 * @param props.stats - React commit timing stats.
 * @returns Overlay markup summarizing performance metrics.
 */
const PerformanceOverlay = ({
  fps,
  stats,
}: {
  fps: number;
  stats: CommitStats;
}) => {
  const cpuLoad = Math.min(
    100,
    Math.round((stats.average / FRAME_BUDGET_MS) * 100),
  );

  return (
    <div className="border-foreground/10 bg-background/80 pointer-events-none fixed bottom-4 right-4 z-50 flex min-w-[200px] flex-col gap-1 rounded-md border px-3 py-2 text-xs font-medium shadow-lg backdrop-blur">
      <span className="text-muted-foreground text-[10px] uppercase tracking-wide">
        Dev Performance
      </span>
      <div className="text-foreground flex flex-wrap gap-3 font-mono text-[11px]">
        <span>FPS {fps ? fps.toFixed(0) : "--"}</span>
        <span>Commit {stats.average ? stats.average.toFixed(1) : "--"}ms</span>
        <span>CPU ~{Number.isFinite(cpuLoad) ? cpuLoad : 0}%</span>
      </div>
      <p className="text-muted-foreground text-[10px]">
        Target &lt;30% CPU while idle.
      </p>
    </div>
  );
};

/**
 * PerformanceProfiler wraps the app shell in a React Profiler and draws an
 * overlay whenever devtools preferences request it.
 *
 * @param props.children - Application subtree to profile.
 * @returns The wrapped children with optional profiler and overlay.
 */
export default function PerformanceProfiler({
  children,
}: PropsWithChildren) {
  const isClient = useIsClient();
  const fps = useFpsMeter();
  const { stats, onRender } = useCommitStats();
  const { showPerformanceOverlay } = useDevtoolsPreferences();

  useEffect(() => {
    if (!isDev || !showPerformanceOverlay || !isClient) return;
    if (!stats.average) return;
    const cpuLoad = Math.min(
      100,
      Math.round((stats.average / FRAME_BUDGET_MS) * 100),
    );
    console.info(
      `[Profiler] FPS≈${fps.toFixed(0)} | avg commit ${stats.average.toFixed(
        1,
      )}ms (max ${stats.max.toFixed(
        1,
      )}ms) | est CPU ${cpuLoad}% (target <30%)`,
    );
  }, [fps, stats, showPerformanceOverlay]);

  const overlay = useMemo(() => {
    if (!isDev || !showPerformanceOverlay || !isClient) return null;
    return <PerformanceOverlay fps={fps} stats={stats} />;
  }, [fps, stats, showPerformanceOverlay, isClient]);

  if (!isDev || !isClient) {
    return <>{children}</>;
  }

  return (
    <>
      <Profiler id="app-shell" onRender={onRender}>
        {children}
      </Profiler>
      {overlay}
    </>
  );
}
