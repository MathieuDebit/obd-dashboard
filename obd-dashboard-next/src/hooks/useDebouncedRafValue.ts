'use client';

import { useEffect, useRef, useState } from "react";

const hasWindow = () => typeof window !== "undefined";

/**
 * Debounce updates via requestAnimationFrame to avoid rendering bursts.
 */
export function useDebouncedRafValue<T>(value: T, delayMs: number) {
  const [state, setState] = useState(value);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
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
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
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
