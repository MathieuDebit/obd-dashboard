'use client';

import RadialChart from "@/components/custom/RadialChart";
import { ChartConfig } from "@/components/ui/chart";
import useOBD from "./hooks/useOBD";


const chartConfig = {
} satisfies ChartConfig

export default function Home() {
  const { pids, error, isLoading } = useOBD();

  if (error) return <div>failed to load</div>
  if (isLoading) return <div>loading...</div>

  const speed = pids.filter((command) => command.pid === 'SPEED')[0]?.value || 0;
  const rpm = pids.filter((command) => command.pid === 'RPM')[0]?.value || 0;

  const chartData = [
    { speed, rpm },
  ]

  return (
    <div className="">
      <div className="w-[200px]">
        <RadialChart chartData={chartData} chartConfig={chartConfig} />
      </div>
    </div>
  );
}
