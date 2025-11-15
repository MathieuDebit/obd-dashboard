/**
 * @file Tailwind-friendly class name merging helper.
 */
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combines class names using clsx and merges Tailwind conflicts.
 *
 * @param inputs - List of class name fragments.
 * @returns Merged class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
