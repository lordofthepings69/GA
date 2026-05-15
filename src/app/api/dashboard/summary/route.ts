import { NextResponse } from "next/server"
import { withAuth } from "@/lib/api-middleware"
import { prisma } from "@/lib/prisma"
import { startOfWeek } from "date-fns"

export const GET = withAuth(async () => {
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })

  const [activeLots, soldThisWeek, avgHammer, avgRec] = await Promise.all([
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
  ])

  return NextResponse.json({
    activeLots,
    soldThisWeek,
    avgHammerPrice: avgHammer._avg.hammerPrice
      ? Number(avgHammer._avg.hammerPrice)
      : null,
    avgRecommendedPrice: avgRec._avg.priceRecommendation
      ? Number(avgRec._avg.priceRecommendation)
      : null,
  })
})
