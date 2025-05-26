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
  return (
    <ChartContainer
      config={chartConfig}
      className={cn("aspect-square h-[150px]", className)}
    >
      <RadialBarChart
        data={chartData}
        startAngle={200}
        endAngle={chartData[0].rpm / -30 + 180}
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
                      {chartData[0].speed.toLocaleString() || '1'}
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
