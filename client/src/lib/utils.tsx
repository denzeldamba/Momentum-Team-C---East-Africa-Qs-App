import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * @param inputs - An array of class names (strings, objects, or arrays)
 * @returns A single string of combined and deduplicated Tailwind CSS classes.
 * This function handles conditional logic (clsx) and resolves conflicting utilities (twMerge).
 */
export function cn(...inputs: ClassValue[]) {
  // Uses twMerge for smart merging and clsx for conditional class handling.
  return twMerge(clsx(inputs));
}