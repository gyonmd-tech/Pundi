/**
 * lib/utils/cn.ts
 * Menggabungkan class Tailwind: clsx + mergeClasses (pengganti ringan
 * tailwind-merge, lihat lib/utils/mergeClasses.ts).
 */
import { clsx, type ClassValue } from "clsx";
import { mergeClasses } from "./mergeClasses";

export function cn(...inputs: ClassValue[]) {
  return mergeClasses(clsx(inputs));
}
