/**
 * @file Card primitives used to build consistent surfaces.
 */
import type { ComponentProps } from "react"

import { cn } from "@/utils/classNames"

/**
 * Card renders the root container with padding, border, and rounded corners.
 *
 * @param props.className - Additional css classes.
 * @returns Styled card div.
 */
function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex h-full flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardHeader lays out the header region for titles/actions.
 *
 * @returns Styled header div.
 */
function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6 grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardTitle styles a heading placed inside a CardHeader.
 *
 * @returns Styled title div.
 */
function CardTitle({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("font-semibold leading-none", className)}
      {...props}
    />
  )
}

/**
 * CardDescription styles supporting text under a title.
 *
 * @returns Styled description div.
 */
function CardDescription({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

/**
 * CardAction positions elements (e.g., buttons) in the header grid.
 *
 * @returns Styled action div.
 */
function CardAction({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * CardContent wraps the main body content with consistent padding.
 *
 * @returns Styled content div.
 */
function CardContent({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

/**
 * CardFooter anchors controls at the bottom of a card.
 *
 * @returns Styled footer div.
 */
function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("[.border-t]:pt-6 flex items-center px-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
