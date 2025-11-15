/**
 * @file Shared chart-related TypeScript types used across components.
 */
import type { ComponentType, ReactNode } from "react"

import type { THEMES } from "@/ui/css/utils"

/**
 * Represents a single telemetry sample consumed by the radial chart.
 */
export type ChartData = {
  speed: number
  rpm: number,
  fill: string,
}[]

/**
 * Defines visual metadata (labels/icons/colors) for each chart series.
 */
export type ChartConfig = {
  [k in string]: {
    label?: ReactNode
    icon?: ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}
