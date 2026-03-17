"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { fromZonedTime } from "date-fns-tz"

import { getActuals, getForecasts } from "@/actions/dataset"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Spinner } from "@/components/ui/spinner"
import { MergedPoint, getDefaultTimes, mergeData } from "@/lib/utils"
import Header from "@/components/header"
import ForecastChart from "@/components/forecast-chart"

export default function Page() {
  const defaults = getDefaultTimes()
  const [startTime, setStartTime] = useState(defaults.start)
  const [endTime, setEndTime] = useState(defaults.end)
  const [horizonHours, setHorizonHours] = useState(4)
  const [chartData, setChartData] = useState<MergedPoint[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  const fetchData = useCallback(async () => {
    if (!startTime || !endTime || !horizonHours || loading) return
    const startISO = fromZonedTime(startTime, "Europe/London").toISOString()
    const endISO = fromZonedTime(endTime, "Europe/London").toISOString()

    setLoading(true)
    setError(null)
    try {
      const [actuals, forecasts] = await Promise.all([
        getActuals(startISO, endISO),
        getForecasts(startISO, endISO, horizonHours),
      ])
      setChartData(mergeData(actuals, forecasts))
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [startTime, endTime, horizonHours, loading])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(fetchData, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [fetchData])

  return (
    <div className="flex min-h-svh flex-col bg-background">
      <Header />

      <main className="flex-1 space-y-6 p-4 md:p-8">
        <Card>
          <CardHeader className="pb-4">
            <CardTitle>Configuration</CardTitle>
            <CardDescription>
              Adjust the time range and forecast horizon.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-end gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="datetime-local"
                  value={startTime}
                  step={1800}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-[220px]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="datetime-local"
                  value={endTime}
                  step={1800}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-[220px]"
                />
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <Label>Forecast Horizon</Label>
                  <span className="text-sm font-medium text-muted-foreground">
                    {horizonHours}h
                  </span>
                </div>
                <Slider
                  min={0}
                  max={48}
                  step={1}
                  value={[horizonHours]}
                  onValueChange={([v]) => setHorizonHours(v)}
                  className="w-[220px]"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1 shadow-sm">
          <CardHeader>
            <CardTitle>Generation vs Forecast</CardTitle>
            <CardDescription>
              Compare actual wind power generation against forecasted values.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {loading && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-xl bg-background/60 backdrop-blur-sm">
                <Spinner className="size-8 text-primary" />
              </div>
            )}
            {error && (
              <div className="flex h-[450px] items-center justify-center text-destructive">
                {error}
              </div>
            )}
            {!error && chartData.length === 0 && !loading && (
              <div className="flex h-[450px] items-center justify-center text-muted-foreground">
                No data available for the selected range.
              </div>
            )}
            {!error && chartData.length > 0 && (
              <ForecastChart chartData={chartData} />
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
