"use client"

import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"

import { cn } from "@/utils/classNames"

type ScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  viewportProps?: Omit<
    React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>,
    "children"
  >
}

const assignRef = <T,>(
  ref: React.Ref<T> | undefined,
  value: T
) => {
  if (!ref) return
  if (typeof ref === "function") {
    ref(value)
  } else {
    ;(ref as React.RefObject<T | null>).current = value
  }
}

type PointerWithCapabilities = PointerEvent & {
  sourceCapabilities?: {
    firesTouchEvents?: boolean
  }
}

function ScrollArea({
  className,
  children,
  viewportProps,
  ...props
}: ScrollAreaProps) {
  const {
    className: viewportClassName,
    style: viewportStyle,
    ref: viewportRefProp,
    ...restViewportProps
  } = viewportProps ?? {}

  const viewportRef = React.useRef<HTMLDivElement | null>(null)

  const setViewportRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      viewportRef.current = node
      assignRef(viewportRefProp, node)
    },
    [viewportRefProp]
  )

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const coarsePointerQuery = window.matchMedia("(pointer: coarse)")
    const hasTouchCapabilities = navigator.maxTouchPoints > 0

    let activePointerId: number | null = null
    let startX = 0
    let startY = 0
    let startScrollLeft = 0
    let startScrollTop = 0
    let isDragging = false
    let restoreUserSelect: (() => void) | null = null

    const eventOptions: AddEventListenerOptions = { passive: false }

    const restoreSelection = () => {
      if (restoreUserSelect) {
        restoreUserSelect()
        restoreUserSelect = null
      }
    }

    const disableSelection = () => {
      if (restoreUserSelect) return
      const previousDocumentSelect = document.documentElement.style.userSelect
      const previousBodySelect = document.body.style.userSelect

      document.documentElement.style.userSelect = "none"
      document.body.style.userSelect = "none"

      restoreUserSelect = () => {
        document.documentElement.style.userSelect = previousDocumentSelect
        document.body.style.userSelect = previousBodySelect
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId || !viewport) return

      const deltaX = event.clientX - startX
      const deltaY = event.clientY - startY

      if (!isDragging) {
        if (Math.abs(deltaX) < 3 && Math.abs(deltaY) < 3) {
          return
        }
        isDragging = true
      }

      viewport.scrollLeft = startScrollLeft - deltaX
      viewport.scrollTop = startScrollTop - deltaY
      event.preventDefault()
    }

    const handlePointerEnd = (event: PointerEvent) => {
      if (event.pointerId !== activePointerId) return
      stopDragging()
    }

    const stopDragging = () => {
      window.removeEventListener("pointermove", handlePointerMove, eventOptions)
      window.removeEventListener("pointerup", handlePointerEnd)
      window.removeEventListener("pointercancel", handlePointerEnd)
      activePointerId = null
      isDragging = false
      restoreSelection()
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!viewport || activePointerId !== null || event.button !== 0) {
        return
      }

      const pointerEvent = event as PointerWithCapabilities
      const isMousePointer = event.pointerType === "mouse"
      const isTouchLikeMousePointer =
        isMousePointer &&
        (coarsePointerQuery.matches ||
          navigator.maxTouchPoints > 0 ||
          pointerEvent.sourceCapabilities?.firesTouchEvents)

      const shouldEnableDrag =
        event.pointerType === "touch" ||
        event.pointerType === "pen" ||
        isTouchLikeMousePointer ||
        (!("PointerEvent" in window) && hasTouchCapabilities)

      if (!shouldEnableDrag) {
        return
      }

      activePointerId = event.pointerId
      startX = event.clientX
      startY = event.clientY
      startScrollLeft = viewport.scrollLeft
      startScrollTop = viewport.scrollTop
      isDragging = false
      disableSelection()

      window.addEventListener("pointermove", handlePointerMove, eventOptions)
      window.addEventListener("pointerup", handlePointerEnd)
      window.addEventListener("pointercancel", handlePointerEnd)
    }

    viewport.addEventListener("pointerdown", handlePointerDown, eventOptions)

    return () => {
      viewport.removeEventListener("pointerdown", handlePointerDown, eventOptions)
      stopDragging()
      restoreSelection()
    }
  }, [])

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        ref={setViewportRef}
        className={cn(
          "focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
          viewportClassName
        )}
        style={{
          touchAction: "pan-x pan-y",
          WebkitOverflowScrolling: "touch",
          overscrollBehaviorX: "contain",
          overscrollBehaviorY: "contain",
          ...viewportStyle,
        }}
        {...restViewportProps}
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}

export { ScrollArea, ScrollBar }
