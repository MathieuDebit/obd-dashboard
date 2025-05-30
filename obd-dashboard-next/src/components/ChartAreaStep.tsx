"use client"

import { Activity } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/ui/chart"
import { ChartConfig } from "@/types/chart"


const chartConfig = {
  value: {
    label: "Value",
    color: "var(--card-foreground)",
    icon: Activity,
  },
} satisfies ChartConfig

interface ChartAreaStepProps {
  title?: string;
  description?: string;
  chartData: { time: number, value: number }[];
}

export function ChartAreaStep({ title, description, chartData }: ChartAreaStepProps) {
  return (
    <Card>
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle> }
        { description &&
          <CardDescription>
            {description}
          </CardDescription>
        }
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value > 0 ? value : ''}
            />
            <YAxis
              dataKey="value"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Area
              dataKey="value"
              type="step"
              fill="var(--color-value)"
              fillOpacity={0.4}
              stroke="var(--color-value)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
