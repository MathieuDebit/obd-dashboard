'use client';

import { useDeferredValue, useEffect, useMemo, useState } from "react";

import { useRefreshRate } from "@/app/RefreshRateContext";
import GPSCarData from "@/components/GPSCarData";
import Map from "@/components/Map";
import { useDebouncedRafValue } from "@/hooks/useDebouncedRafValue";
import useOBD from "@/hooks/useOBD";
import type { ChartConfig, ChartData } from "@/types/chart";

const chartConfig = {} satisfies ChartConfig;
const FALLBACK_CHART_FILL = "var(--foreground)";

export default function Home() {
  const { pidMap, error, isLoading } = useOBD();
  const [chartFill, setChartFill] = useState(FALLBACK_CHART_FILL);
  const deferredPidMap = useDeferredValue(pidMap);
  const { intervalMs: refreshIntervalMs } = useRefreshRate();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const styles = getComputedStyle(document.documentElement);
    const value = styles.getPropertyValue("--foreground").trim();
    if (value) {
      setChartFill(value);
    }
  }, []);

  const telemetry = useMemo(() => {
    const getNumericPid = (pid: string) => {
      const command = deferredPidMap.get(pid);
      if (!command) return null;
      const parsed = Number(command.rawValue);
      return Number.isFinite(parsed) ? parsed : null;
    };

    return {
      speed: getNumericPid("SPEED"),
      rpm: getNumericPid("RPM"),
    };
  }, [deferredPidMap]);

  const latestChartData: ChartData = useMemo(() => {
    if (telemetry.speed == null && telemetry.rpm == null) {
      return [];
    }

    return [
      {
        speed: telemetry.speed ?? 0,
        rpm: telemetry.rpm ?? 0,
        fill: chartFill,
      },
    ];
  }, [telemetry, chartFill]);

  const chartData = useDebouncedRafValue(latestChartData, refreshIntervalMs);

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div>
      <Map />

      <div className="pointer-events-none absolute bottom-0 left-0 mb-5 flex w-full justify-center">
        <div className="w-100 pointer-events-auto">
          <GPSCarData chartData={chartData} chartConfig={chartConfig} />
        </div>
      </div>
    </div>
  );
}
