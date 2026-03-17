import { type DataPoint } from "@/actions/dataset"
import { clsx, type ClassValue } from "clsx"
import { formatInTimeZone } from "date-fns-tz"
import { twMerge } from "tailwind-merge"

export interface MergedPoint {
  time: string
  actual: number | null
  forecast: number | null
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatUKLabel(iso: string): string {
  return formatInTimeZone(iso, "Europe/London", "HH:mm\ndd/MM/yy")
}

export function mergeData(
  actuals: DataPoint[],
  forecasts: DataPoint[]
): MergedPoint[] {
  const map = new Map<string, MergedPoint>()

  for (const a of actuals) {
    map.set(a.time, { time: a.time, actual: a.generation, forecast: null })
  }

  for (const f of forecasts) {
    const existing = map.get(f.time)
    if (existing) {
      existing.forecast = f.generation
    } else {
      map.set(f.time, { time: f.time, actual: null, forecast: f.generation })
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.time).getTime() - new Date(b.time).getTime()
  )
}

export function getDefaultTimes() {
  const now = new Date()
  const end = new Date(now)
  end.setUTCMinutes(0, 0, 0)
  end.setUTCHours(8)
  if (end > now) end.setUTCDate(end.getUTCDate() - 1)

  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - 1)

  return {
    start: formatInTimeZone(start, "Europe/London", "yyyy-MM-dd'T'HH:mm"),
    end: formatInTimeZone(end, "Europe/London", "yyyy-MM-dd'T'HH:mm"),
  }
}
