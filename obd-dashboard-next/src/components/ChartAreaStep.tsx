"use client"

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipProps,
  XAxis,
  YAxis,
} from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card"

type AreaType = "basis" | "bump" | "linear" | "monotone" | "natural" | "step"

const COLOR_PALETTE = [
  "#6366f1",
  "#14b8a6",
  "#f97316",
  "#ef4444",
  "#22d3ee",
  "#84cc16",
]

export interface ChartSeriesConfig {
  dataKey: string
  name?: string
  color?: string
  type?: AreaType
  strokeWidth?: number
  fillOpacity?: number
  stackId?: string
}

interface ChartAreaStepProps {
  title?: string
  description?: string
  chartData: { time: number; [key: string]: number }[]
  series?: ChartSeriesConfig[]
  yLabel?: string
  valueFormatter?: (value: number) => string
}

const defaultSeries: ChartSeriesConfig[] = [{ dataKey: "value", name: "Value" }]

const formatTickLabel = (value: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return ""
  }
  const date = new Date(value)
  const minutes = date.getMinutes().toString().padStart(2, "0")
  const seconds = date.getSeconds().toString().padStart(2, "0")
  return `${minutes}:${seconds}`
}

export function ChartAreaStep({
  title,
  description,
  chartData,
  series,
  yLabel,
  valueFormatter,
}: ChartAreaStepProps) {
  const seriesToRender =
    series && series.length > 0 ? series : defaultSeries

  return (
    <Card className="h-full">
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 16, bottom: 8, left: 0, right: 16 }}
          >
            <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--muted-foreground) / 0.2)" />
            <XAxis
              dataKey="time"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={formatTickLabel}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              label={
                yLabel
                  ? {
                      value: yLabel,
                      angle: -90,
                      position: "insideLeft",
                      offset: -5,
                      fill: "hsl(var(--muted-foreground))",
                    }
                  : undefined
              }
            />
            <Tooltip content={<ChartTooltip valueFormatter={valueFormatter} />} />
            {seriesToRender.length > 1 && (
              <Legend wrapperStyle={{ paddingTop: 8 }} />
            )}
            {seriesToRender.map((serie, index) => {
              const stroke = serie.color || COLOR_PALETTE[index % COLOR_PALETTE.length]
              return (
                <Area
                  key={serie.dataKey}
                  type={serie.type ?? "monotone"}
                  dataKey={serie.dataKey}
                  name={serie.name}
                  stroke={stroke}
                  strokeWidth={serie.strokeWidth ?? 2}
                  fill={stroke}
                  fillOpacity={serie.fillOpacity ?? 0.2}
                  stackId={serie.stackId}
                  isAnimationActive={false}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipProps<number, string> & {
  valueFormatter?: (value: number) => string
}) {
  if (!active || !payload?.length) {
    return null
  }

  const resolvedLabel =
    typeof label === "number"
      ? label
      : typeof label === "string"
      ? Number(label)
      : NaN
  const formattedLabel = Number.isNaN(resolvedLabel)
    ? "--"
    : formatTickLabel(resolvedLabel)

  return (
    <div className="rounded-md border border-border bg-background px-3 py-2 text-xs shadow-xl">
      <p className="font-medium text-muted-foreground">
        Time: <span className="text-foreground">{formattedLabel}</span>
      </p>
      <div className="mt-2 space-y-1">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-6"
          >
            <span className="flex items-center gap-2 text-muted-foreground">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{
                  backgroundColor: item.color || "hsl(var(--primary))",
                }}
              />
              {item.name ?? item.dataKey}
            </span>
            <span className="font-semibold text-foreground">
              {typeof item.value === "number"
                ? valueFormatter
                  ? valueFormatter(item.value)
                  : item.value.toFixed(2)
                : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
