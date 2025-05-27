'use client';

import dynamic from 'next/dynamic'
import useOBD from "@/hooks/useOBD";
import GPSCarData from "@/components/GPSCarData";
import { ChartConfig, ChartData } from "@/types/chart";

const Map = dynamic(() => import('@/components/Map'), { ssr: false })


const chartConfig = {
} satisfies ChartConfig

export default function Home() {
  const { pids, error, isLoading } = useOBD();

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  const speed = Number(pids.filter((command) => command.pid === 'SPEED')[0]?.rawValue) || 1;
  const rpm = Number(pids.filter((command) => command.pid === 'RPM')[0]?.rawValue) || 0;

  const styles = getComputedStyle(document.documentElement);
  const bgMuted = styles.getPropertyValue("--foreground");

  const chartData: ChartData = [
    { speed, rpm, fill: bgMuted },
  ]

  return (
    <div  >
      <Map />

      <div className="absolute w-full h-full p-10 pointer-events-none">
        <div className="w-100 pointer-events-auto">
          <GPSCarData chartData={chartData} chartConfig={chartConfig} />
        </div>
      </div>
    </div>
  );
}
