"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { formatWeekLabel, formatLKR } from "@/lib/utils"

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
]

interface Series {
  key: string
  label: string
  data: { week: string; avgHammerPrice: number | null; avgRecommendedPrice: number | null }[]
}

interface Props {
  weeks: string[]
  series: Series[]
}

export function PriceTrendChart({ weeks, series }: Props) {
  // Transform to per-week rows
  const chartData = weeks.map((week) => {
    const row: Record<string, unknown> = { week }
    for (const s of series) {
      const point = s.data.find((d) => d.week === week)
      row[`${s.key}_hammer`] = point?.avgHammerPrice ?? null
      row[`${s.key}_rec`] = point?.avgRecommendedPrice ?? null
    }
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="week"
          tickFormatter={formatWeekLabel}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v) => `${v}`}
          tick={{ fontSize: 11 }}
          label={{ value: "LKR/kg", angle: -90, position: "insideLeft", fontSize: 11 }}
        />
        <Tooltip
          formatter={(value) => [typeof value === "number" ? formatLKR(value) : String(value)]}
          labelFormatter={(label) => typeof label === "string" ? formatWeekLabel(label) : String(label)}
        />
        <Legend />
        {series.map((s, i) => (
          <>
            <Line
              key={`${s.key}_hammer`}
              type="monotone"
              dataKey={`${s.key}_hammer`}
              name={`${s.label} — Hammer`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              key={`${s.key}_rec`}
              type="monotone"
              dataKey={`${s.key}_rec`}
              name={`${s.label} — Recommended`}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              connectNulls
            />
          </>
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
