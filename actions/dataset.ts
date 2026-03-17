"use server"

const BMRS_BASE = "https://data.elexon.co.uk/bmrs/api/v1/datasets"

interface FuelHHRecord {
  dataset: string
  publishTime: string
  startTime: string
  settlementDate: string
  settlementPeriod: number
  fuelType: string
  generation: number
}

interface WindForRecord {
  dataset: string
  publishTime: string
  startTime: string
  generation: number
}

export interface DataPoint {
  time: string
  generation: number
}

export async function getActuals(
  startTime: string,
  endTime: string
): Promise<DataPoint[]> {
  const start = new Date(startTime)
  const end = new Date(endTime)

  const settlementDateFrom = start.toISOString().slice(0, 10)
  const settlementDateTo = end.toISOString().slice(0, 10)

  const url = new URL(`${BMRS_BASE}/FUELHH/stream`)
  url.searchParams.set("settlementDateFrom", settlementDateFrom)
  url.searchParams.set("settlementDateTo", settlementDateTo)
  url.searchParams.set("fuelType", "WIND")

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) {
    throw new Error(`FUELHH API error: ${res.status}`)
  }

  const data: FuelHHRecord[] = await res.json()

  return data
    .filter((r) => {
      const t = new Date(r.startTime)
      return t >= start && t <= end
    })
    .map((r) => ({ time: r.startTime, generation: r.generation }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}

export async function getForecasts(
  startTime: string,
  endTime: string,
  horizonHours: number
): Promise<DataPoint[]> {
  const start = new Date(startTime)
  const end = new Date(endTime)

  const publishFrom = new Date(start.getTime() - 48 * 60 * 60 * 1000)

  const url = new URL(`${BMRS_BASE}/WINDFOR/stream`)
  url.searchParams.set("publishDateTimeFrom", publishFrom.toISOString())
  url.searchParams.set("publishDateTimeTo", end.toISOString())

  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) {
    throw new Error(`WINDFOR API error: ${res.status}`)
  }

  const data: WindForRecord[] = await res.json()
  const horizonMs = horizonHours * 60 * 60 * 1000

  const bestByTarget = new Map<
    string,
    { publishTime: string; generation: number }
  >()

  for (const r of data) {
    const targetTime = new Date(r.startTime)
    const publishTime = new Date(r.publishTime)

    if (targetTime < start || targetTime > end) continue

    const leadTime = targetTime.getTime() - publishTime.getTime()
    if (leadTime < horizonMs) continue

    const existing = bestByTarget.get(r.startTime)
    if (!existing || new Date(existing.publishTime) < publishTime) {
      bestByTarget.set(r.startTime, {
        publishTime: r.publishTime,
        generation: r.generation,
      })
    }
  }

  return Array.from(bestByTarget.entries())
    .map(([time, { generation }]) => ({ time, generation }))
    .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime())
}
