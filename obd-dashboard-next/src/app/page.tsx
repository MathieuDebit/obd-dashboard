'use client';

import { useEffect, useMemo, useState } from "react";
import useOBD from "@/hooks/useOBD";
import GPSCarData from "@/components/GPSCarData";
import { ChartConfig, ChartData } from "@/types/chart";
import Map from "@/components/Map";

const chartConfig = {} satisfies ChartConfig;
const FALLBACK_CHART_FILL = "var(--foreground)";

export default function Home() {
  const { pidMap, error, isLoading } = useOBD();
  const [chartFill, setChartFill] = useState(FALLBACK_CHART_FILL);

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
      const command = pidMap.get(pid);
      if (!command) return null;
      const parsed = Number(command.rawValue);
      return Number.isFinite(parsed) ? parsed : null;
    };

    return {
      speed: getNumericPid("SPEED"),
      rpm: getNumericPid("RPM"),
    };
  }, [pidMap]);

  const chartData: ChartData = useMemo(() => {
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

  if (error) return <div>failed to load</div>;
  if (isLoading) return <div>loading...</div>;

  return (
    <div>
      <Map />

      <div className="absolute w-full bottom-0 left-0 mb-5 pointer-events-none flex justify-center">
        <div className="w-100 pointer-events-auto">
          <GPSCarData chartData={chartData} chartConfig={chartConfig} />
        </div>
      </div>
    </div>
  );
}
