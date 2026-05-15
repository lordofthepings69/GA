import { KpiCard } from "@/components/dashboard/KpiCard"
import { PriceTrendChart } from "@/components/dashboard/PriceTrendChart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatLKR } from "@/lib/utils"
import { prisma } from "@/lib/prisma"
import { startOfWeek, subWeeks } from "date-fns"

async function getDashboardData() {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const twelveWeeksAgo = subWeeks(new Date(), 12)

  const [activeLots, soldThisWeek, avgHammer, avgRec, trendRows] = await Promise.all([
    prisma.lot.count({ where: { lotStatus: "Active" } }),
    prisma.auctionResult.count({
      where: { resultStatus: "Sold", dateRecorded: { gte: weekStart } },
    }),
    prisma.auctionResult.aggregate({
      where: { resultStatus: "Sold" },
      _avg: { hammerPrice: true },
    }),
    prisma.tastingRecord.aggregate({
      where: { status: { in: ["Approved", "Overridden"] } },
      _avg: { priceRecommendation: true },
    }),
    prisma.$queryRaw<
      {
        week_start: Date
        grade: string
        region: string
        avg_hammer_price: number | null
        avg_recommended_price: number | null
        lot_count: number
      }[]
    >`
      SELECT
        DATE_TRUNC('week', ar.date_recorded) AS week_start,
        l.grade,
        l.region,
        AVG(ar.hammer_price)::float AS avg_hammer_price,
        AVG(tr.price_recommendation)::float AS avg_recommended_price,
        COUNT(ar.id)::int AS lot_count
      FROM auction_results ar
      JOIN lots l ON ar.lot_id = l.id
      LEFT JOIN (
        SELECT DISTINCT ON (lot_id) lot_id, price_recommendation
        FROM tasting_records
        WHERE status IN ('Approved', 'Overridden')
        ORDER BY lot_id, approved_at DESC
      ) tr ON tr.lot_id = l.id
      WHERE ar.result_status = 'Sold'
        AND ar.date_recorded >= ${twelveWeeksAgo}
      GROUP BY week_start, l.grade, l.region
      ORDER BY week_start ASC, l.grade ASC
    `,
  ])

  // Build chart data
  const weekSet = new Set(trendRows.map((r) => r.week_start.toISOString().split("T")[0]))
  const weeks = Array.from(weekSet).sort()

  const seriesMap = new Map<string, { key: string; label: string; grade: string; region: string; data: { week: string; avgHammerPrice: number | null; avgRecommendedPrice: number | null }[] }>()
  for (const row of trendRows) {
    const week = row.week_start.toISOString().split("T")[0]
    const key = `${row.grade}-${row.region}`
    if (!seriesMap.has(key)) {
      seriesMap.set(key, { key, label: `${row.grade} (${row.region})`, grade: row.grade, region: row.region, data: [] })
    }
    seriesMap.get(key)!.data.push({ week, avgHammerPrice: row.avg_hammer_price, avgRecommendedPrice: row.avg_recommended_price })
  }

  return {
    activeLots,
    soldThisWeek,
    avgHammerPrice: avgHammer._avg.hammerPrice ? Number(avgHammer._avg.hammerPrice) : null,
    avgRecommendedPrice: avgRec._avg.priceRecommendation ? Number(avgRec._avg.priceRecommendation) : null,
    weeks,
    series: Array.from(seriesMap.values()),
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard title="Active Lots" value={data.activeLots} subtitle="awaiting auction" />
        <KpiCard title="Sold This Week" value={data.soldThisWeek} subtitle="lots cleared" />
        <KpiCard
          title="Avg Hammer Price"
          value={formatLKR(data.avgHammerPrice)}
          subtitle="all time, sold lots"
        />
        <KpiCard
          title="Avg Recommended"
          value={formatLKR(data.avgRecommendedPrice)}
          subtitle="approved tastings"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Price Trends — 12 Weeks (Hammer vs Recommendation)</CardTitle>
        </CardHeader>
        <CardContent>
          {data.series.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No auction data yet. Seed the database to see trends.
            </p>
          ) : (
            <PriceTrendChart weeks={data.weeks} series={data.series} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
