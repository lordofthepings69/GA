"use client"

import { useEffect, useState } from "react"
import { Grade } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatLKR } from "@/lib/utils"
import { format } from "date-fns"

interface DataPoint {
  source: "auction" | "recommendation"
  date: string
  price: number
  catalogueNumber: string
  elevation: string
  buyerName?: string
  tasterName?: string
  tastingStatus?: string
  resultStatus?: string
}

interface Stats {
  avgAuctionPrice: number | null
  avgRecommendedPrice: number | null
  minPrice: number | null
  maxPrice: number | null
  sampleCount: number
}

interface Props {
  estateName: string
  grade: Grade | ""
  weeksBack?: number
}

export function ComparablesPanel({ estateName, grade, weeksBack = 6 }: Props) {
  const [data, setData] = useState<{ dataPoints: DataPoint[]; stats: Stats } | null>(null)
  const [loading, setLoading] = useState(false)
  const [weeks, setWeeks] = useState(weeksBack)

  useEffect(() => {
    if (!estateName || !grade) {
      setData(null)
      return
    }
    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `/api/comparables?estate=${encodeURIComponent(estateName)}&grade=${grade}&weeks=${weeks}`,
          { signal: controller.signal }
        )
        if (res.ok) setData(await res.json())
      } catch {
        // aborted
      } finally {
        setLoading(false)
      }
    }, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [estateName, grade, weeks])

  if (!estateName || !grade) {
    return (
      <div className="text-xs text-gray-400 p-4">
        Enter estate name and grade to see historical comparables.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Historical Comparables</h3>
        <div className="flex gap-1">
          {[4, 6, 8].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setWeeks(w)}
              className={`px-2 py-0.5 text-xs rounded ${
                weeks === w
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {w}w
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded bg-blue-50 p-2">
              <p className="text-gray-500">Avg Hammer</p>
              <p className="font-bold text-blue-700">
                {data.stats.avgAuctionPrice ? formatLKR(data.stats.avgAuctionPrice) : "—"}
              </p>
            </div>
            <div className="rounded bg-emerald-50 p-2">
              <p className="text-gray-500">Avg Recommended</p>
              <p className="font-bold text-emerald-700">
                {data.stats.avgRecommendedPrice ? formatLKR(data.stats.avgRecommendedPrice) : "—"}
              </p>
            </div>
          </div>

          {data.stats.minPrice && data.stats.maxPrice && (
            <p className="text-xs text-gray-500">
              Range: {formatLKR(data.stats.minPrice)} – {formatLKR(data.stats.maxPrice)}
              {" "}({data.stats.sampleCount} records)
            </p>
          )}

          <div className="overflow-auto max-h-64">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b text-gray-500">
                  <th className="py-1 text-left">Date</th>
                  <th className="py-1 text-left">Source</th>
                  <th className="py-1 text-right">LKR/kg</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.dataPoints.slice(0, 15).map((p, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-1">{format(new Date(p.date), "dd MMM")}</td>
                    <td className="py-1">
                      <span
                        className={`rounded px-1 text-xs ${
                          p.source === "auction"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {p.source === "auction" ? "Hammer" : "Rec"}
                      </span>
                      <span className="ml-1 text-gray-400">{p.catalogueNumber}</span>
                    </td>
                    <td className="py-1 text-right font-mono font-medium">
                      {formatLKR(p.price)}
                    </td>
                  </tr>
                ))}
                {data.dataPoints.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-3 text-center text-gray-400">
                      No comparable data in the last {weeks} weeks.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
