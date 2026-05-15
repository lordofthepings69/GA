import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

export const GET = withAuth(async (req) => {
  const { searchParams } = new URL(req.url)
  const weeks = parseInt(searchParams.get("weeks") ?? "12")
  const gradeFilter = searchParams.get("grade")
  const regionFilter = searchParams.get("region")

  type Row = {
    week_start: Date
    grade: string
    region: string
    avg_hammer_price: number | null
    avg_recommended_price: number | null
    lot_count: number
  }

  let rows: Row[]

  // Build query based on filter combination
  if (gradeFilter && regionFilter) {
    rows = await prisma.$queryRaw<Row[]>`
      SELECT
        DATE_TRUNC('week', ar.date_recorded) AS week_start,
        l.grade, l.region,
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
        AND ar.date_recorded >= NOW() - (${weeks}::int * INTERVAL '1 week')
        AND l.grade = ${gradeFilter}
        AND l.region = ${regionFilter}
      GROUP BY week_start, l.grade, l.region
      ORDER BY week_start ASC, l.grade ASC
    `
  } else if (gradeFilter) {
    rows = await prisma.$queryRaw<Row[]>`
      SELECT
        DATE_TRUNC('week', ar.date_recorded) AS week_start,
        l.grade, l.region,
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
        AND ar.date_recorded >= NOW() - (${weeks}::int * INTERVAL '1 week')
        AND l.grade = ${gradeFilter}
      GROUP BY week_start, l.grade, l.region
      ORDER BY week_start ASC, l.grade ASC
    `
  } else if (regionFilter) {
    rows = await prisma.$queryRaw<Row[]>`
      SELECT
        DATE_TRUNC('week', ar.date_recorded) AS week_start,
        l.grade, l.region,
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
        AND ar.date_recorded >= NOW() - (${weeks}::int * INTERVAL '1 week')
        AND l.region = ${regionFilter}
      GROUP BY week_start, l.grade, l.region
      ORDER BY week_start ASC, l.grade ASC
    `
  } else {
    rows = await prisma.$queryRaw<Row[]>`
      SELECT
        DATE_TRUNC('week', ar.date_recorded) AS week_start,
        l.grade, l.region,
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
        AND ar.date_recorded >= NOW() - (${weeks}::int * INTERVAL '1 week')
      GROUP BY week_start, l.grade, l.region
      ORDER BY week_start ASC, l.grade ASC
    `
  }

  const weekSet = new Set(rows.map((r) => r.week_start.toISOString().split("T")[0]))
  const weeksList = Array.from(weekSet).sort()

  const seriesMap = new Map<
    string,
    {
      key: string
      label: string
      grade: string
      region: string
      data: { week: string; avgHammerPrice: number | null; avgRecommendedPrice: number | null; lotCount: number }[]
    }
  >()

  for (const row of rows) {
    const week = row.week_start.toISOString().split("T")[0]
    const key = `${row.grade}-${row.region}`
    if (!seriesMap.has(key)) {
      seriesMap.set(key, { key, label: `${row.grade} (${row.region})`, grade: row.grade, region: row.region, data: [] })
    }
    seriesMap.get(key)!.data.push({
      week,
      avgHammerPrice: row.avg_hammer_price,
      avgRecommendedPrice: row.avg_recommended_price,
      lotCount: row.lot_count,
    })
  }

  return NextResponse.json({ weeks: weeksList, series: Array.from(seriesMap.values()) })
})
