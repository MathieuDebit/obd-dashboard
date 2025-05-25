'use client';


import { Card, CardContent } from "@/components/ui/card"
import RadialChart from "@/components/custom/RadialChart";
import { ChartConfig } from "@/components/ui/chart";
import useOBD from "@/app/hooks/useOBD";
import Map from "@/components/custom/Map";
import { Fuel, Thermometer } from "lucide-react";


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
          <Card className="pb-0">
            <CardContent className="flex items-start justify-around pb-0 w-full">
              <div className="flex flex-col flex-none items-center">
                <Thermometer className="mb-4"/>
                <div className="w-9 h-3 mb-1 rounded-sm bg-red-200" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-red-200" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-red-400" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-red-400" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-red-400" />
              </div>

              <RadialChart className="mt-4" chartData={chartData} chartConfig={chartConfig} />

              <div className="flex flex-col flex-none items-center">
                <Fuel className="mb-4 ml-1" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-orange-200" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
                <div className="w-9 h-3 mb-1 rounded-sm bg-orange-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
