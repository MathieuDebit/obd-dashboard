import { Card, CardContent } from "@/ui/card";
import { LevelFuel, LevelThermometer } from "./Levels";
import RadialChart from "./RadialChart";

export default function GPSCarData({ chartData, chartConfig }) {
    return (
        <Card className="pb-0">
            <CardContent className="flex items-start justify-around pb-0 w-full">
                <LevelThermometer />

                <RadialChart className="mt-4" chartData={chartData} chartConfig={chartConfig} />

                <LevelFuel />
            </CardContent>
        </Card>
    )
}