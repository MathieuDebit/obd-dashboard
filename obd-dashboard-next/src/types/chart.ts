import { THEMES } from "@/ui/css/utils"
import { ComponentType, ReactNode } from "react"

export type ChartData = {
  speed: number
  rpm: number,
  fill: string,
}[]

export type ChartConfig = {
  [k in string]: {
    label?: ReactNode
    icon?: ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}