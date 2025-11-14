"use client"

import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";
import { cn } from "@/utils/classNames"
import { ChartContainer } from "@/ui/chart"
import { ChartConfig, ChartData } from "@/types/chart";


interface RadialChartProps {
  className: string,
  chartData: ChartData,
  chartConfig: ChartConfig,
}

export default function RadialChart({ className, chartData, chartConfig }: RadialChartProps) {
  if (chartData.length === 0) {
    return (
      <div className={cn("aspect-square h-[150px]", className)}>
        <div className="flex h-full w-full items-center justify-center rounded-xl border text-xs text-muted-foreground">
          Waiting for data
        </div>
      </div>
    )
  }

  const sample = chartData[0];
  const speedValue = Number.isFinite(sample.speed) ? sample.speed : 0;
  const rpmValue = Number.isFinite(sample.rpm) ? sample.rpm : 0;
  const endAngle = rpmValue / -30 + 180;

  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-square h-[150px]", className)}
    >
      <RadialBarChart
        data={chartData}
        startAngle={200}
        endAngle={endAngle}
        innerRadius={65}
        outerRadius={87}
      >
        <RadialBar dataKey="speed" cornerRadius={10} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) - 12}
                      className="fill-foreground text-4xl font-bold"
                    >
                      {speedValue.toLocaleString()}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 12}
                      className="fill-muted-foreground"
                    >
                      km/h
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  )
}
