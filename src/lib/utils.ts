import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatLKR(value: number | null | undefined): string {
  if (value == null) return "—"
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatWeekLabel(isoDate: string): string {
  return format(new Date(isoDate), "MMM d")
}

export function pctDiff(a: number, b: number): number {
  if (b === 0) return 0
  return ((a - b) / b) * 100
}
