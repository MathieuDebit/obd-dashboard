// @ts-nocheck
"use client"

// @ts-ignore - Recharts type definitions pull in redux state helpers we exclude
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

import { useLanguage } from "@/app/LanguageContext"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card"
import { translateUi } from "@/utils/i18n"

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
  yAxisId?: "left" | "right"
  unit?: string
}

interface ChartAreaStepProps {
  title?: string
  description?: string
  chartData: { time: number; [key: string]: number }[]
  series?: ChartSeriesConfig[]
  yAxisLeftUnit?: string
  yAxisRightUnit?: string
  valueFormatter?: (value: number) => string
}

const defaultSeries: ChartSeriesConfig[] = [
  { dataKey: "value", name: "Value", yAxisId: "left" },
]

const formatTimestamp = (value: number) => {
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
  yAxisLeftUnit,
  yAxisRightUnit,
  valueFormatter,
}: ChartAreaStepProps) {
  const seriesToRender =
    series && series.length > 0 ? series : defaultSeries
  const startTimestamp = chartData.length > 0 ? chartData[0]?.time ?? null : null
  const usesRightAxis = seriesToRender.some(
    (serie) => (serie.yAxisId ?? "left") === "right"
  )
  const hasUnitBadges = Boolean(yAxisLeftUnit || yAxisRightUnit)
  const chartContainerClass = "h-full w-full"
  const { locale } = useLanguage()
  const tooltipTimeLabel = translateUi("chart.tooltip.time", locale, "Time")

  const tickFormatter = (value: number) => {
    if (
      startTimestamp === null ||
      typeof value !== "number" ||
      Number.isNaN(value)
    ) {
      return ""
    }
    const elapsedSeconds = Math.floor((value - startTimestamp) / 1000)
    if (elapsedSeconds < 0 || elapsedSeconds % 10 !== 0) {
      return ""
    }
    return formatTimestamp(value)
  }

  const seriesConfigMap = seriesToRender.reduce<Record<string, ChartSeriesConfig>>(
    (acc, serie) => {
      acc[serie.dataKey] = serie
      return acc
    },
    {}
  )

  return (
    <Card className="h-full">
      <CardHeader>
        {title && <CardTitle>{title}</CardTitle>}
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="h-[360px] w-full">
        {hasUnitBadges && (
          <div className="text-muted-foreground mb-3 flex items-center justify-between text-[0.65rem] font-medium uppercase tracking-wide">
            <span className="flex items-center gap-1">
              {yAxisLeftUnit ? (
                <span className="border-border/60 bg-muted rounded-md border px-2 py-0.5">
                  {yAxisLeftUnit}
                </span>
              ) : (
                <span className="text-muted-foreground/50"> </span>
              )}
            </span>
            <span className="flex items-center gap-1">
              {yAxisRightUnit ? (
                <span className="border-border/60 bg-muted rounded-md border px-2 py-0.5">
                  {yAxisRightUnit}
                </span>
              ) : (
                <span className="text-muted-foreground/50"> </span>
              )}
            </span>
          </div>
        )}
        <div className={chartContainerClass}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 12, bottom: 8, left: 0, right: 16 }}
            >
              <CartesianGrid strokeDasharray="4 4" stroke="hsl(var(--muted-foreground) / 0.2)" />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={tickFormatter}
              />
              <YAxis
                yAxisId="left"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              {usesRightAxis && (
                <YAxis
                  orientation="right"
                  yAxisId="right"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
              )}
            <Tooltip
              content={
                <ChartTooltip
                  valueFormatter={valueFormatter}
                  seriesConfig={seriesConfigMap}
                  timeLabel={tooltipTimeLabel}
                />
              }
            />
              {seriesToRender.length > 1 && (
                <Legend wrapperStyle={{ paddingTop: 8 }} />
              )}
              {seriesToRender.map((serie, index) => {
                const stroke = serie.color || COLOR_PALETTE[index % COLOR_PALETTE.length]
                const yAxisId = serie.yAxisId ?? "left"
                return (
                  <Area
                    key={serie.dataKey}
                    type={serie.type ?? "monotone"}
                    dataKey={serie.dataKey}
                    name={serie.name}
                    yAxisId={yAxisId}
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
        </div>
      </CardContent>
    </Card>
  )
}

type TooltipDatum = {
  dataKey?: string | number
  value?: number | string
  name?: string
  color?: string
}

type ChartTooltipProps = {
  active?: boolean
  payload?: TooltipDatum[]
  label?: string | number
  valueFormatter?: (value: number) => string
  seriesConfig?: Record<string, ChartSeriesConfig>
  timeLabel?: string
}

function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
  seriesConfig,
  timeLabel,
}: ChartTooltipProps) {
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
    : formatTimestamp(resolvedLabel)

  return (
    <div className="border-border bg-background rounded-md border px-3 py-2 text-xs shadow-xl">
      {timeLabel && (
        <p className="text-muted-foreground font-medium">
          {timeLabel}: <span className="text-foreground">{formattedLabel}</span>
        </p>
      )}
      <div className="mt-2 space-y-1">
        {payload.map((item) => (
          <div
            key={item.dataKey}
            className="flex items-center justify-between gap-6"
          >
            <span className="text-muted-foreground flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-sm"
                style={{
                  backgroundColor: item.color || "hsl(var(--primary))",
                }}
              />
              {item.name ?? item.dataKey}
            </span>
            <span className="text-foreground font-semibold">
              {typeof item.value === "number"
                ? valueFormatter
                  ? valueFormatter(item.value)
                  : item.value.toFixed(2)
                : item.value}
              {seriesConfig &&
              typeof item.dataKey === "string" &&
              seriesConfig[item.dataKey]?.unit
                ? ` ${seriesConfig[item.dataKey]?.unit}`
                : ""}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
