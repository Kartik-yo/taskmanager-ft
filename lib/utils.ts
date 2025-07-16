import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Utility to merge conditional Tailwind classes safely.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
