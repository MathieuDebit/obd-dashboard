'use client';

import { ChartConfig } from "@/ui/chart";
import useOBD from "@/hooks/useOBD";
import Map from "@/components/Map";
import GPSCarData from "@/components/GPSCarData";


const chartConfig = {
} satisfies ChartConfig

export default function Home() {
  const { pids, error, isLoading } = useOBD();

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  const speed = pids.filter((command) => command.pid === 'SPEED')[0]?.rawValue || 1;
  const rpm = pids.filter((command) => command.pid === 'RPM')[0]?.rawValue   || 0;

  const chartData = [
    { speed, rpm },
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
