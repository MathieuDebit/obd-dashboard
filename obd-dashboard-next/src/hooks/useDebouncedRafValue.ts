'use client';

/**
 * @file Provides a hook that throttles value updates using timeouts and
 * requestAnimationFrame to align with animation cadence.
 */

import { useEffect, useRef, useState } from "react";

/**
 * Checks whether the window global is available (guards SSR).
 *
 * @returns True when running in the browser.
 */
const hasWindow = () => typeof window !== "undefined";

/**
 * Debounces rapid value changes by waiting the supplied delay and then updating
 * state inside requestAnimationFrame for smoother UI transitions.
 *
 * @param value - Latest value that should eventually be propagated.
 * @param delayMs - Debounce interval before scheduling the RAF update.
 * @returns The debounced value that only updates after the interval elapses.
 */
export function useDebouncedRafValue<T>(value: T, delayMs: number) {
  const [state, setState] = useState(value);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (frameRef.current && hasWindow()) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!hasWindow() || delayMs <= 0) {
      setState(value);
      return;
    }

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (frameRef.current) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    timeoutRef.current = window.setTimeout(() => {
      frameRef.current = window.requestAnimationFrame(() => {
        setState(value);
        frameRef.current = null;
      });
    }, delayMs);

    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (frameRef.current) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [value, delayMs]);

  return state;
}
