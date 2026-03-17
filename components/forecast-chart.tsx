import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { MergedPoint, formatUKLabel } from "@/lib/utils"

const chartConfig = {
  actual: { label: "Actual", color: "#2563eb" },
  forecast: { label: "Forecast", color: "#16a34a" },
} satisfies ChartConfig

const ForecastChart = ({ chartData }: { chartData: MergedPoint[] }) => {
  const yDomain = (() => {
    const vals = chartData
      .flatMap((d) => [d.actual, d.forecast])
      .filter((v): v is number => v !== null)
    if (vals.length === 0) return [0, 30000]
    const min = Math.min(...vals)
    const max = Math.max(...vals)
    const pad = (max - min) * 0.05 || 1000
    return [
      Math.max(0, Math.floor((min - pad) / 1000) * 1000),
      Math.ceil((max + pad) / 1000) * 1000,
    ]
  })()

  return (
    <ChartContainer
      config={chartConfig}
      className="aspect-auto h-[450px] w-full"
    >
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 20, bottom: 25, left: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="time"
          tickFormatter={formatUKLabel}
          tick={{ fontSize: 11 }}
          interval="preserveStartEnd"
          minTickGap={60}
          tickLine={false}
          axisLine={false}
          label={{
            value: "Target Time (UK)",
            position: "insideBottom",
            offset: -15,
            style: {
              fontSize: 12,
              fill: "var(--color-muted-foreground)",
            },
          }}
        />
        <YAxis
          domain={yDomain}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) =>
            v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
          }
          label={{
            value: "Power (MW)",
            angle: -90,
            position: "insideLeft",
            offset: 5,
            style: {
              fontSize: 12,
              fill: "var(--color-muted-foreground)",
            },
          }}
        />
        <Tooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                if (!payload?.[0]?.payload?.time) return ""
                return formatUKLabel(payload[0].payload.time).replace("\n", " ")
              }}
            />
          }
        />
        <Legend verticalAlign="top" height={36} />
        <Line
          type="monotone"
          dataKey="actual"
          name="Actual"
          stroke="var(--color-actual)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
        />
        <Line
          type="monotone"
          dataKey="forecast"
          name="Forecast"
          stroke="var(--color-forecast)"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
          activeDot={{ r: 4 }}
          connectNulls
        />
      </LineChart>
    </ChartContainer>
  )
}

export default ForecastChart
