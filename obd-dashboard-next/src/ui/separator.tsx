/**
 * @file Thin divider component built on Radix Separator.
 */
import * as SeparatorPrimitive from "@radix-ui/react-separator"
import * as React from "react"

import { cn } from "@/utils/classNames"

/**
 * Separator renders a horizontal or vertical rule with accessible defaults.
 *
 * @param props.orientation - Layout orientation for the divider.
 * @param props.decorative - Whether the separator is purely visual.
 * @returns Styled separator element.
 */
function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  ...props
}: React.ComponentProps<typeof SeparatorPrimitive.Root>) {
  return (
    <SeparatorPrimitive.Root
      data-slot="separator-root"
      decorative={decorative}
      orientation={orientation}
      className={cn(
        "bg-border shrink-0 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
