import { LevelFuel, LevelThermometer } from "./Levels";
import RadialChart from "./RadialChart";

import type { ChartConfig, ChartData } from "@/types/chart";
import { Card, CardContent } from "@/ui/card";


interface GPSCarDataProps {
    chartData: ChartData;
    chartConfig: ChartConfig
}

export default function GPSCarData({ chartData, chartConfig }: GPSCarDataProps) {
    return (
        <Card className="pb-0">
            <CardContent className="flex w-full items-start justify-around pb-0">
                <LevelThermometer />

                <RadialChart className="mt-4" chartData={chartData} chartConfig={chartConfig} />

                <LevelFuel />
            </CardContent>
        </Card>
    )
}