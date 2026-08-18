/**
 * lib/utils/cn.ts
 * Utility untuk menggabungkan Tailwind class dengan deduplication.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
