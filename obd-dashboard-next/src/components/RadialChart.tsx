// @ts-nocheck
"use client"

/**
 * @file Declares the RadialChart component that formats speed and RPM samples
 * into the stylized radial gauge used in the telemetry card.
 */

// @ts-ignore - Recharts type definitions depend on redux state helpers we omit
import {
  Label,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import type { ChartConfig, ChartData } from "@/types/chart";
import { ChartContainer } from "@/ui/chart"
import { cn } from "@/utils/classNames"


interface RadialChartProps {
  className: string,
  chartData: ChartData,
  chartConfig: ChartConfig,
}

/**
 * RadialChart renders a radial bar chart with a prominent speed readout and
 * angle derived from the most recent RPM value.
 *
 * @param props.className - Optional class names appended to the container.
 * @param props.chartData - Data array containing the latest telemetry sample.
 * @param props.chartConfig - Chart configuration for context-specific styling.
 * @returns A radial bar chart component; falls back to an empty placeholder if
 * no data is available.
 */
export default function RadialChart({ className, chartData, chartConfig }: RadialChartProps) {
  if (chartData.length === 0) {
    return <div className={cn("aspect-square h-[150px]", className)} />
  }

  const sample = chartData[0]!;
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
