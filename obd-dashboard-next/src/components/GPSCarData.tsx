/**
 * @file Aggregates the card widget that shows the radial telemetry chart plus
 * simple temperature and fuel level indicators.
 */
import { LevelFuel, LevelThermometer } from "./Levels";
import RadialChart from "./RadialChart";

import type { ChartConfig, ChartData } from "@/types/chart";
import { Card, CardContent } from "@/ui/card";


interface GPSCarDataProps {
    chartData: ChartData;
    chartConfig: ChartConfig
}

/**
 * GPSCarData renders the speed/RPM radial chart alongside auxiliary indicators
 * to summarize key vehicle telemetry.
 *
 * @param props.chartData - Chart points representing latest telemetry sample.
 * @param props.chartConfig - Configuration describing chart series/appearance.
 * @returns The telemetry card component.
 */
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
